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
        
        let needsSave = false;
        const categories =['page', 'scoundrel', 'resume'];
        
        categories.forEach(type => {
            if (!parsed[type]) {
                parsed[type] = { allTimeVisitors: 0, allTimeReturning: 0, totalRaw: 0, daily: {} };
                needsSave = true;
            } else {
                if (parsed[type].allTimeUnique !== undefined) {
                    parsed[type].allTimeVisitors = parsed[type].allTimeUnique;
                    delete parsed[type].allTimeUnique;
                    needsSave = true;
                }
                if (parsed[type].returning !== undefined && parsed[type].allTimeReturning === undefined) {
                    parsed[type].allTimeReturning = parsed[type].returning;
                    delete parsed[type].returning;
                    needsSave = true;
                }
                
                for (const date in parsed[type].daily) {
                    const d = parsed[type].daily[date];
                    if (d.unique !== undefined) {
                        d.visitors = d.unique;
                        d.new = d.unique;
                        d.returning = 0;
                        delete d.unique;
                        needsSave = true;
                    }
                }

                if (type === 'page' && parsed[type].allTimeReturning === 0 && parsed[type].allTimeVisitors >= 245) {
                    parsed[type].allTimeReturning = 245;
                    needsSave = true;
                }
            }
        });

        if (needsSave) saveViewsData(parsed);
        return parsed;
    } catch (err) {
        const defaultCategory = () => ({ allTimeVisitors: 0, allTimeReturning: 0, totalRaw: 0, daily: {} });
        const defaultData = { page: defaultCategory(), scoundrel: defaultCategory(), resume: defaultCategory() };
        fs.writeFileSync(VIEWS_FILE, JSON.stringify(defaultData, null, 2));
        return defaultData;
    }
}

function saveViewsData(data) {
    fs.writeFileSync(VIEWS_FILE, JSON.stringify(data, null, 2));
}

async function sendEmailReport(subject, targetDate, data) {
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
        const daily = catData.daily[targetDate] || { visitors: 0, new: 0, returning: 0, raw: 0 };
        
        const dailyRetPct = daily.visitors > 0 ? Math.round((daily.returning / daily.visitors) * 100) : 0;
        const allTimeRetPct = catData.allTimeVisitors > 0 ? Math.round((catData.allTimeReturning / catData.allTimeVisitors) * 100) : 0;

        return `[ ${name} ]\n` +
               `- Visitors Today: ${daily.visitors}\n` +
               `- New Today: ${daily.new}\n` +
               `- Returning Today: ${daily.returning} (${dailyRetPct}%)\n` +
               `- Visitors All-Time: ${catData.allTimeVisitors}\n` +
               `- Returning All-Time: ${catData.allTimeReturning} (${allTimeRetPct}%)\n` +
               `- Total All-Time (Raw): ${catData.totalRaw}\n`;
    }

    const text = `Good evening Seth,\n\nHere is your portfolio view report for ${targetDate}:\n\n` +
                 `${formatCategoryStats('Page Views', data.page)}\n` +
                 `${formatCategoryStats('Scoundrel Daily Clicks', data.scoundrel)}\n` +
                 `${formatCategoryStats('Resume Clicks', data.resume)}\n` +
                 `Best,\nYour Portfolio API`;

    const mailOptions = {
        from: 'Portfolio API <noreply@sethgran.my.id>',
        to: 'seth.gran@outlook.com',
        subject: subject,
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
    const { type = 'page', isNewVisitor, isReturningVisitor, isDailyUnique } = req.body;
    const data = getViewsData();
    const today = getTodayString();

    if (!data[type]) {
        data[type] = { allTimeVisitors: 0, allTimeReturning: 0, totalRaw: 0, daily: {} };
    }

    if (!data[type].daily[today]) {
        data[type].daily[today] = { visitors: 0, new: 0, returning: 0, raw: 0 };
    }

    data[type].totalRaw += 1;
    data[type].daily[today].raw += 1;

    if (isDailyUnique) {
        data[type].daily[today].visitors += 1;
        
        if (isNewVisitor) {
            data[type].allTimeVisitors += 1;
            data[type].daily[today].new += 1;
        }
        
        if (isReturningVisitor) {
            data[type].allTimeReturning += 1;
            data[type].daily[today].returning += 1;
        }
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
    
    // Pass the subject and the actual date string separately so the lookup doesn't fail
    const success = await sendEmailReport(`TEST - Portfolio Daily View Report - ${today}`, today, data);
    
    if (success) {
        res.json({ success: true, message: 'Test email sent successfully! Check your inbox.' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to send email. Check server logs for details.' });
    }
});

// Run at 11:59 PM every day to capture the full day's data before the date rolls over
cron.schedule('59 23 * * *', async () => {
    const data = getViewsData();
    const today = getTodayString();

    await sendEmailReport(`Portfolio Daily View Report - ${today}`, today, data);
}, {
    scheduled: true,
    timezone: "America/New_York"
});

app.listen(PORT, () => console.log(`[API] View counter running on port ${PORT}`));
