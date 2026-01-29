import express from 'express';
import dotenv from 'dotenv';
import chatHandler from './api/chat';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers['content-type']));
    // Only log body keys or length to avoid spamming console with large payloads
    if (req.body) {
        console.log('Body keys:', Object.keys(req.body));
        if (req.body.messages) {
            console.log('Messages count:', req.body.messages.length);
        }
    }
    next();
});

// Wrapper to adapt Express req/res to Vercel req/res
app.all('/api/chat', async (req, res) => {
    // @ts-ignore
    await chatHandler(req, res);
});

app.listen(PORT, () => {
    console.log(`Local Backend running on http://localhost:${PORT}`);
});
