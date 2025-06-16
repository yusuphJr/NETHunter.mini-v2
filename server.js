import express from 'express';
import { createServer } from 'http';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client, LocalAuth, MessageMedia } = pkg;

// Path setup for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let qrImage = null;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox'],
    },
});

client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
        qrImage = url;
        console.log('✅ QR Code updated.');
    });
});

client.on('ready', () => {
    console.log('🤖 Bot is ready!');
});

client.on('message_create', async (msg) => {
    if (!msg.fromMe) return;
    const text = msg.body.toLowerCase();

    if (text.startsWith('sudo ping')) {
        await msg.edit('🟢 Pong from Nethunter.');
    } else if (text.startsWith('sudo hello')) {
        await msg.edit('👋 Hello! I am *Nethunter Mini*.');
    } else if (text.startsWith('sudo time')) {
        const now = new Date().toLocaleString();
        await msg.edit(`🕒 Server time: ${now}`);
    }
});

client.on('message', async (msg) => {
    if (msg.body.toLowerCase().includes('hi') || msg.body.toLowerCase().includes('hello')) {
        await msg.reply('⚠️ I am currently unavailable. This is an auto-reply from Nethunter Mini.');
    }
});

client.initialize();

app.get('/generate-qr', (req, res) => {
    if (qrImage) {
        res.json({ qr: qrImage });
    } else {
        res.status(202).json({ message: 'QR not ready yet.' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(3000, () => {
    console.log('🚀 Server running on port 3000');
});
