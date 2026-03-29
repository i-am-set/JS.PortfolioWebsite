const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;
const VIEWS_FILE = path.join(__dirname, 'views.json');

const allowedOrigins =[
    'http://localhost',
    'http://127.0.0.1:5500',
    'https://sethgran.my.id',
    'http://sethgran.my.id'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

function getTodayString() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}

function getViewsData() {
    try {
        const data = fs.readFileSync(VIEWS_FILE, 'utf8');
        const parsed = JSON.parse(data);
        
        if (typeof parsed.count === 'number' && !parsed.totalUnique) {
            return {
                totalUnique: parsed.count,
                totalRaw: parsed.count,
                daily: {}
            };
        }
        return parsed;
    } catch (err) {
        const defaultData = { totalUnique: 0, totalRaw: 0, daily: {} };
        fs.writeFileSync(VIEWS_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

function saveViewsData(data) {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

async function sendEmailReport(dateStr, dailyStats, totalUnique, totalRaw) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn(`[API] Email report skipped: Missing EMAIL_USER or EMAIL_PASS env variables.`);
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'seth.gran@outlook.com',
        subject: `Portfolio Daily View Report - ${dateStr}`,
        text: `Good morning Seth,\n\nHere is your portfolio view report for ${dateStr}:\n\nUnique Visitors: ${dailyStats.unique}\nTotal Page Loads (Raw): ${dailyStats.raw}\n\nAll-Time Unique Visitors: ${totalUnique}\nAll-Time Page Loads: ${totalRaw}\n\nBest,\nYour Portfolio API`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[API] Report sent successfully to ${mailOptions.to}`);
        return true;
    } catch (error) {
        console.error('[API] Failed to send report:', error);
        return false;
    }
}

app.get('/api/views', (req, res) => {
    const data = getViewsData();
    res.json({ count: data.totalUnique });
});

app.post('/api/views/increment', (req, res) => {
    const { isUnique } = req.body;
    const data = getViewsData();
    const today = getTodayString();

    if (!data.daily[today]) {
        data.daily[today] = { unique: 0, raw: 0 };
    }

    data.totalRaw += 1;
    data.daily[today].raw += 1;

    if (isUnique) {
        data.totalUnique += 1;
        data.daily[today].unique += 1;
    }

    saveViewsData(data);
    res.json({ count: data.totalUnique });
});


app.get('/api/views/test-email', async (req, res) => {
    const data = getViewsData();
    const today = getTodayString();
    const dailyStats = data.daily[today] || { unique: 0, raw: 0 };
    
    const success = await sendEmailReport(`TEST - ${today}`, dailyStats, data.totalUnique, data.totalRaw);
    
    if (success) {
        res.json({ success: true, message: 'Test email sent successfully! Check your inbox.' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to send email. Check server logs for details.' });
    }
});

cron.schedule('0 0 * * *', async () => {
    const data = getViewsData();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

    const dailyStats = data.daily[dateStr] || { unique: 0, raw: 0 };

    await sendEmailReport(dateStr, dailyStats, data.totalUnique, data.totalRaw);
}, {
    scheduled: true,
    timezone: "America/New_York"
});

app.listen(PORT, () => console.log(`[API] View counter running on port ${PORT}`));