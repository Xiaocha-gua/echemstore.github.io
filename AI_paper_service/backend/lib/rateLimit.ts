import { kv } from '@vercel/kv';

const MAX_DAILY_REQUESTS_PER_IP = Number(process.env.DAILY_IP_LIMIT) || 5;
const MAX_DAILY_TOKENS = Number(process.env.DAILY_TOKEN_LIMIT) || 1000000;

// Local in-memory storage for development
const localRateLimitMap = new Map<string, { count: number, date: string }>();

export async function checkRateLimit(ip: string): Promise<{ success: boolean; msg?: string }> {
    // If no KV (local dev), use in-memory mock
    if (!process.env.KV_REST_API_URL) {
        console.warn(`[RateLimit] Checking local limit for IP: ${ip}`);
        
        const date = new Date().toISOString().split('T')[0];
        let record = localRateLimitMap.get(ip);
        
        // Reset if new day or no record
        if (!record || record.date !== date) {
            record = { count: 0, date };
        }
        
        record.count++;
        localRateLimitMap.set(ip, record);
        
        console.log(`[RateLimit] IP: ${ip}, Count: ${record.count}/${MAX_DAILY_REQUESTS_PER_IP}`);

        if (record.count > MAX_DAILY_REQUESTS_PER_IP) {
            return { success: false, msg: "Daily limit exceeded (5 requests/day)." };
        }
        return { success: true };
    }

    const date = new Date().toISOString().split('T')[0];
    const key = `rate:${ip}:${date}`;
    
    try {
        const count = await kv.incr(key);
        if (count === 1) {
            await kv.expire(key, 86400);
        }
        
        if (count > MAX_DAILY_REQUESTS_PER_IP) {
            return { success: false, msg: "Daily limit exceeded (5 requests/day)." };
        }
        return { success: true };
    } catch (e) {
        console.error("KV Error:", e);
        // Fail open or closed? Fail open for availability
        return { success: true }; 
    }
}

export async function checkTokenLimit(estimatedTokens: number = 0): Promise<{ success: boolean; msg?: string }> {
     if (!process.env.KV_REST_API_URL) return { success: true };

     const date = new Date().toISOString().split('T')[0];
     const key = `tokens:${date}`;
     
     const current = await kv.get<number>(key) || 0;
     const projected = current + Math.max(estimatedTokens, 0);
     
     if (projected >= MAX_DAILY_TOKENS) {
         return { success: false, msg: "System daily token limit reached." };
     }
     
     return { success: true };
}

export async function incrementTokenUsage(tokens: number) {
    if (!process.env.KV_REST_API_URL || tokens <= 0) return;
    const date = new Date().toISOString().split('T')[0];
    const key = `tokens:${date}`;
    await kv.incrby(key, tokens);
    await kv.expire(key, 86400);
}
