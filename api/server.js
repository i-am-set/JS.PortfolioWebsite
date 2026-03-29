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
        let parsed = JSON.parse(data);
        
        // Migration from old format to new granular format
        if (parsed.totalUnique !== undefined || typeof parsed.count === 'number') {
            const oldTotalUnique = parsed.totalUnique || parsed.count || 0;
            const oldTotalRaw = parsed.totalRaw || oldTotalUnique;
            const oldDaily = parsed.daily || {};
            
            parsed = {
                page: { allTimeUnique: oldTotalUnique, returning: 0, totalRaw: oldTotalRaw, daily: oldDaily },
                scoundrel: { allTimeUnique: 0, returning: 0, totalRaw: 0, daily: {} },
                resume: { allTimeUnique: 0, returning: 0, totalRaw: 0, daily: {} }
            };
            saveViewsData(parsed);
        }
        return parsed;
    } catch (err) {
        const defaultCategory = () => ({ allTimeUnique: 0, returning: 0, totalRaw: 0, daily: {} });
        const defaultData = { page: defaultCategory(), scoundrel: defaultCategory(), resume: defaultCategory() };
        fs.writeFileSync(VIEWS_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

function saveViewsData(data) {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

async function sendEmailReport(dateStr, data) {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[API] Email report skipped: Missing RESEND_API_KEY env variable.`);
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
            user: 'resend',
            pass: process.env.RESEND_API_KEY
        }
    });

    function formatCategoryStats(name, catData) {
        const daily = catData.daily[dateStr] || { unique: 0, raw: 0 };
        return `[ ${name} ]\n` +
               `- Daily Unique: ${daily.unique}\n` +
               `- Daily Total (Raw): ${daily.raw}\n` +
               `- All-Time Unique: ${catData.allTimeUnique}\n` +
               `- All-Time Returning: ${catData.returning}\n` +
               `- All-Time Total (Raw): ${catData.totalRaw}\n`;
    }

    const text = `Good morning Seth,\n\nHere is your portfolio view report for ${dateStr}:\n\n` +
                 `${formatCategoryStats('Page Views', data.page)}\n` +
                 `${formatCategoryStats('Scoundrel Daily Clicks', data.scoundrel)}\n` +
                 `${formatCategoryStats('Resume Clicks', data.resume)}\n` +
                 `Best,\nYour Portfolio API`;

    const mailOptions = {
        from: 'Portfolio API <noreply@sethgran.my.id>',
        to: 'seth.gran@outlook.com',
        subject: `Portfolio Daily View Report - ${dateStr}`,
        text: text
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
    res.json(data.page);
});

app.post('/api/views/increment', (req, res) => {
    const { type = 'page', isNewVisitor, isDailyUnique } = req.body;
    const data = getViewsData();
    const today = getTodayString();

    if (!data[type]) {
        data[type] = { allTimeUnique: 0, returning: 0, totalRaw: 0, daily: {} };
    }

    if (!data[type].daily[today]) {
        data[type].daily[today] = { unique: 0, raw: 0 };
    }

    data[type].totalRaw += 1;
    data[type].daily[today].raw += 1;

    if (isNewVisitor) {
        data[type].allTimeUnique += 1;
    } else if (isDailyUnique) {
        data[type].returning += 1;
    }

    if (isDailyUnique) {
        data[type].daily[today].unique += 1;
    }

    saveViewsData(data);
    
    if (type === 'page') {
        res.json(data.page);
    } else {
        res.json({ success: true });
    }
});

app.get('/api/views/test-email', async (req, res) => {
    const { password } = req.query;
    
    if (!process.env.EMAIL_TEST_PASSWORD) {
        return res.status(500).json({ success: false, message: 'Server configuration error: EMAIL_TEST_PASSWORD not set.' });
    }

    if (password !== process.env.EMAIL_TEST_PASSWORD) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid password.' });
    }

    const data = getViewsData();
    const today = getTodayString();
    
    const success = await sendEmailReport(`TEST - ${today}`, data);
    
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

    await sendEmailReport(dateStr, data);
}, {
    scheduled: true,
    timezone: "America/New_York"
});

app.listen(PORT, () => console.log(`[API] View counter running on port ${PORT}`));
