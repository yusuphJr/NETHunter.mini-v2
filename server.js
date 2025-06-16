// server.js
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import fs from 'fs';

const { Client, LocalAuth } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express server to keep it alive on Render
const app = express();
app.get('/', (req, res) => {
    res.send('🌐 NetHunter Mini is running.');
});
app.listen(process.env.PORT || 3000, () => {
    console.log('🟢 Web server started');
});

// WhatsApp client setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📸 QR code ready — scan it in WhatsApp');
});

client.on('ready', () => {
    console.log('✅ Client is ready and logged in');
});

client.on('message_create', async (msg) => {
    if (!msg.body.startsWith("sudo ")) return;

    const command = msg.body.slice(5).trim().toLowerCase();
    console.log(`📩 Command received: ${command}`);

    let output = await handleCommand(command, msg);

    try {
        await msg.edit(`📟 *sudo ${command}*\n\n${output}`);
    } catch (err) {
        console.error("❌ Could not edit message:", err);
    }
});

async function handleCommand(command, msg) {
    switch (command) {
        case 'hello':
            return "👋 Hello from NetHunter Mini!";
        case 'time':
            return `🕒 Current time: ${new Date().toLocaleTimeString()}`;
        case 'date':
            return `📅 Today's date: ${new Date().toDateString()}`;
        case 'whoami':
            const contact = await msg.getContact();
            return `🙍 You are: ${contact.pushname || contact.number}`;
        case 'help':
            return `🧰 Available commands:\n• sudo hello\n• sudo time\n• sudo date\n• sudo whoami\n• sudo help`;
        default:
            return "⚠️ Unknown command. Type `sudo help` for options.";
    }
}

client.initialize();
