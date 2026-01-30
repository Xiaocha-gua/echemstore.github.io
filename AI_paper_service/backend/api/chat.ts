import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { checkRateLimit, checkTokenLimit, incrementTokenUsage } from '../lib/rateLimit.js';
import { findJournal } from '../lib/fuzzyMatch.js';
import * as fs from 'fs';
import * as path from 'path';

// Load Journal Data
const dataPath = path.join(process.cwd(), 'data', '中科院分区.json');
let journalDB: any[] = [];
let journalContextString = "";

try {
    if (fs.existsSync(dataPath)) {
        journalDB = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        // Pre-compute context string to save processing time per request
        // Format: Name|Partition
        journalContextString = journalDB.map(j => `${j.name}|${j.partition}`).join('\n');
        console.log(`Loaded ${journalDB.length} journals. Context length: ${journalContextString.length} chars.`);
    } else {
        console.warn("Journal DB not found at", dataPath);
    }
} catch (e) {
    console.error("Failed to load Journal DB", e);
}

// Config
const DEFAULT_SYSTEM_PROMPT = `你是深耕材料化学领域的资深教授，同时拥有核心期刊资深编辑从业经验，精通本领域各类期刊的征稿方向、审稿规则、录用偏好，能结合需求精准匹配适配期刊并给出专业推荐。
针对用户的投稿需求，你需按以下要求完成期刊推荐，输出内容逻辑清晰、信息准确、适配性强，不要有太多的符号，正经语言：
精准推荐3 个适配的材料化学领域期刊，并明确标注每个期刊的最新影响因子和中科院分区（含大类 / 小类）；
针对每个推荐期刊，详细说明适配用户投稿需求的核心原因，贴合期刊征稿范围、研究方向、刊载偏好；
提供每个期刊的平均审稿周期（标注是否为一审 / 终审周期）和最新接收率，数据真实参考行业公开信息；
客观总结各期刊的全网主流投稿体验，涵盖审稿效率、编辑沟通、意见反馈、返修难度等核心维度；
用户提示词中上传有2025年的材料化学综合性期刊的中科院分区，中科院的分区参照这个里面的划分（但是不需要提及是按照上传的数据库的结果）。
如果审核下来用户并不需要推荐期刊，用户的需求和推荐期刊无关的话，则忽视上面的提示词，不需要按照上面的执行。`;

const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const corsOrigins = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
    const requestOrigin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
    if (corsOrigins.length && requestOrigin && !corsOrigins.includes(requestOrigin)) {
        res.status(403).json({ error: 'Origin Not Allowed' });
        return;
    }

    res.setHeader('Access-Control-Allow-Credentials', "true");
    res.setHeader('Access-Control-Allow-Origin', corsOrigins.length ? (requestOrigin && corsOrigins.includes(requestOrigin) ? requestOrigin : corsOrigins[0]) : '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const rawIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const ip = (typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : '') || req.socket.remoteAddress || 'unknown';
    const limitCheck = await checkRateLimit(ip);
    if (!limitCheck.success) {
        res.status(429).json({ error: limitCheck.msg });
        return;
    }

    if (!req.body || typeof req.body !== 'object') {
        res.status(400).json({ error: 'Invalid request body' });
        return;
    }

    const { messages, model } = req.body as { messages?: unknown; model?: unknown };

    // Model Mapping
    const MODEL_MAP: Record<string, string> = {
        'deepseek-v3': 'deepseek-ai/DeepSeek-V3.2',
        'qwen-max': 'Qwen/Qwen3-VL-8B-Instruct', 
    };
    
    // Fallback to direct usage if not in map, or default
    const defaultModel = process.env.MODEL_ID || 'deepseek-ai/DeepSeek-V3.2';
    const targetModel = MODEL_MAP[model as string] || defaultModel;

    if (!messages || !Array.isArray(messages)) {
        console.error("Invalid messages format. Body:", JSON.stringify(req.body).slice(0, 200));
        res.status(400).json({ 
            error: "Invalid messages format",
            details: {
                hasBody: !!req.body,
                bodyType: typeof req.body,
                keys: req.body ? Object.keys(req.body) : [],
                messagesIsArray: Array.isArray(messages)
            }
        });
        return;
    }

    const MAX_MESSAGES = Number(process.env.MAX_MESSAGES) || 50;
    const MAX_MESSAGE_LENGTH = Number(process.env.MAX_MESSAGE_LENGTH) || 5000;
    const MAX_TOTAL_LENGTH = Number(process.env.MAX_TOTAL_LENGTH) || 200000;
    if (messages.length === 0 || messages.length > MAX_MESSAGES) {
        res.status(400).json({ error: `Messages length must be 1-${MAX_MESSAGES}` });
        return;
    }

    let totalLength = 0;
    for (const message of messages) {
        if (!message || typeof message !== 'object') {
            res.status(400).json({ error: 'Invalid message item' });
            return;
        }
        const typed = message as { role?: unknown; content?: unknown };
        if (typed.role !== 'user' && typed.role !== 'assistant') {
            res.status(400).json({ error: 'Invalid message role' });
            return;
        }
        if (typeof typed.content !== 'string') {
            res.status(400).json({ error: 'Invalid message content' });
            return;
        }
        if (typed.content.length > MAX_MESSAGE_LENGTH) {
            res.status(413).json({ error: `Message too long (${typed.content.length})` });
            return;
        }
        totalLength += typed.content.length;
        if (totalLength > MAX_TOTAL_LENGTH) {
            res.status(413).json({ error: `Total message length too large (${totalLength})` });
            return;
        }
    }

    const estimatedTokens = Math.ceil(totalLength / 4);
    const tokenCheck = await checkTokenLimit(estimatedTokens);
    if (!tokenCheck.success) {
        res.status(503).json({ error: tokenCheck.msg });
        return;
    }

    const apiKey = process.env.API_KEY;
    const baseURL = process.env.BASE_URL || 'https://api.siliconflow.cn/v1';

    if (!apiKey) {
        res.status(500).json({ error: 'API key not configured' });
        return;
    }

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL
    });

    try {
        console.log(`Calling OpenAI with model: ${targetModel}`);
        
        // Construct messages with journal context
        const apiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            // Inject Journal DB as a system reference context
            ...(journalContextString ? [{ 
                role: 'system', 
                content: `Reference Journal Database (Format: Name|Partition):\n${journalContextString}\n\nPlease use this database to verify journal partitions.` 
            }] : []),
            ...messages
        ];

        const stream = await openai.chat.completions.create({
            model: targetModel,
            messages: apiMessages,
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullContent = "";
        let buffer = "";
        let splitFound = false;

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (!content) continue;

            fullContent += content;

            if (!splitFound) {
                buffer += content;
                // Check for "&&"
                const splitIndex = buffer.indexOf('&&');
                if (splitIndex !== -1) {
                    splitFound = true;
                    // Send everything BEFORE "&&"
                    const toSend = buffer.substring(0, splitIndex);
                    res.write(toSend);
                    // Keep everything AFTER "&&" (including partials if any) in a new buffer for processing
                    buffer = buffer.substring(splitIndex + 2); 
                } else {
                    // Safe to send? 
                    // Wait, if buffer ends with "&", we must wait.
                    if (buffer.endsWith('&')) {
                        // Keep waiting
                        const safePart = buffer.substring(0, buffer.length - 1);
                        res.write(safePart);
                        buffer = '&';
                    } else {
                        res.write(buffer);
                        buffer = "";
                    }
                }
            } else {
                // Split already found, just accumulate for post-processing
                buffer += content;
            }
        }

        // Stream finished. 
        // If split was found, buffer contains the journal names.
        // If split NOT found, buffer is empty (or residual), just end.
        
        let tokenUsage = Math.ceil(fullContent.length / 4); // Estimate
        await incrementTokenUsage(tokenUsage);

        if (splitFound && buffer.trim()) {
            // Process journals
            const journalNames = buffer.split(/[,，\n]/).map(s => s.trim()).filter(s => s);
            let appendInfo = "\n\n---\n**期刊分区信息 (自动匹配)**:\n";
            
            for (const name of journalNames) {
                if (name.length < 2) continue; // Skip noise
                const match = findJournal(name, journalDB);
                if (match) {
                    appendInfo += `- **${match.name}**: ${match.partition}\n`;
                } else {
                    appendInfo += `- ${name}: 未找到匹配信息\n`;
                }
            }
            
            res.write(appendInfo);
        }

        res.end();

    } catch (error: any) {
        console.error("OpenAI API Error:", error);
        if (error.response) {
            console.error("Error response data:", error.response.data);
        }
        res.status(500).json({ error: "Failed to fetch response from AI provider", details: error.message });
    }
}
