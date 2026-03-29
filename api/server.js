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

const countryNames = {
    "AF": "Afghanistan", "AL": "Albania", "DZ": "Algeria", "AS": "American Samoa", "AD": "Andorra", "AO": "Angola", "AI": "Anguilla", "AQ": "Antarctica", "AG": "Antigua and Barbuda", "AR": "Argentina", "AM": "Armenia", "AW": "Aruba", "AU": "Australia", "AT": "Austria", "AZ": "Azerbaijan", "BS": "Bahamas", "BH": "Bahrain", "BD": "Bangladesh", "BB": "Barbados", "BY": "Belarus", "BE": "Belgium", "BZ": "Belize", "BJ": "Benin", "BM": "Bermuda", "BT": "Bhutan", "BO": "Bolivia", "BA": "Bosnia and Herzegovina", "BW": "Botswana", "BR": "Brazil", "IO": "British Indian Ocean Territory", "VG": "British Virgin Islands", "BN": "Brunei", "BG": "Bulgaria", "BF": "Burkina Faso", "BI": "Burundi", "KH": "Cambodia", "CM": "Cameroon", "CA": "Canada", "CV": "Cape Verde", "KY": "Cayman Islands", "CF": "Central African Republic", "TD": "Chad", "CL": "Chile", "CN": "China", "CX": "Christmas Island", "CC": "Cocos Islands", "CO": "Colombia", "KM": "Comoros", "CK": "Cook Islands", "CR": "Costa Rica", "HR": "Croatia", "CU": "Cuba", "CW": "Curacao", "CY": "Cyprus", "CZ": "Czech Republic", "CD": "Democratic Republic of the Congo", "DK": "Denmark", "DJ": "Djibouti", "DM": "Dominica", "DO": "Dominican Republic", "TL": "East Timor", "EC": "Ecuador", "EG": "Egypt", "SV": "El Salvador", "GQ": "Equatorial Guinea", "ER": "Eritrea", "EE": "Estonia", "ET": "Ethiopia", "FK": "Falkland Islands", "FO": "Faroe Islands", "FJ": "Fiji", "FI": "Finland", "FR": "France", "PF": "French Polynesia", "GA": "Gabon", "GM": "Gambia", "GE": "Georgia", "DE": "Germany", "GH": "Ghana", "GI": "Gibraltar", "GR": "Greece", "GL": "Greenland", "GD": "Grenada", "GU": "Guam", "GT": "Guatemala", "GG": "Guernsey", "GN": "Guinea", "GW": "Guinea-Bissau", "GY": "Guyana", "HT": "Haiti", "HN": "Honduras", "HK": "Hong Kong", "HU": "Hungary", "IS": "Iceland", "IN": "India", "ID": "Indonesia", "IR": "Iran", "IQ": "Iraq", "IE": "Ireland", "IM": "Isle of Man", "IL": "Israel", "IT": "Italy", "CI": "Ivory Coast", "JM": "Jamaica", "JP": "Japan", "JE": "Jersey", "JO": "Jordan", "KZ": "Kazakhstan", "KE": "Kenya", "KI": "Kiribati", "XK": "Kosovo", "KW": "Kuwait", "KG": "Kyrgyzstan", "LA": "Laos", "LV": "Latvia", "LB": "Lebanon", "LS": "Lesotho", "LR": "Liberia", "LY": "Libya", "LI": "Liechtenstein", "LT": "Lithuania", "LU": "Luxembourg", "MO": "Macau", "MK": "Macedonia", "MG": "Madagascar", "MW": "Malawi", "MY": "Malaysia", "MV": "Maldives", "ML": "Mali", "MT": "Malta", "MH": "Marshall Islands", "MR": "Mauritania", "MU": "Mauritius", "YT": "Mayotte", "MX": "Mexico", "FM": "Micronesia", "MD": "Moldova", "MC": "Monaco", "MN": "Mongolia", "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco", "MZ": "Mozambique", "MM": "Myanmar", "NA": "Namibia", "NR": "Nauru", "NP": "Nepal", "NL": "Netherlands", "AN": "Netherlands Antilles", "NC": "New Caledonia", "NZ": "New Zealand", "NI": "Nicaragua", "NE": "Niger", "NG": "Nigeria", "NU": "Niue", "KP": "North Korea", "MP": "Northern Mariana Islands", "NO": "Norway", "OM": "Oman", "PK": "Pakistan", "PW": "Palau", "PS": "Palestine", "PA": "Panama", "PG": "Papua New Guinea", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines", "PN": "Pitcairn", "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "QA": "Qatar", "CG": "Republic of the Congo", "RE": "Reunion", "RO": "Romania", "RU": "Russia", "RW": "Rwanda", "BL": "Saint Barthelemy", "SH": "Saint Helena", "KN": "Saint Kitts and Nevis", "LC": "Saint Lucia", "MF": "Saint Martin", "PM": "Saint Pierre and Miquelon", "VC": "Saint Vincent and the Grenadines", "WS": "Samoa", "SM": "San Marino", "ST": "Sao Tome and Principe", "SA": "Saudi Arabia", "SN": "Senegal", "RS": "Serbia", "SC": "Seychelles", "SL": "Sierra Leone", "SG": "Singapore", "SX": "Sint Maarten", "SK": "Slovakia", "SI": "Slovenia", "SB": "Solomon Islands", "SO": "Somalia", "ZA": "South Africa", "KR": "South Korea", "SS": "South Sudan", "ES": "Spain", "LK": "Sri Lanka", "SD": "Sudan", "SR": "Suriname", "SJ": "Svalbard and Jan Mayen", "SZ": "Swaziland", "SE": "Sweden", "CH": "Switzerland", "SY": "Syria", "TW": "Taiwan", "TJ": "Tajikistan", "TZ": "Tanzania", "TH": "Thailand", "TG": "Togo", "TK": "Tokelau", "TO": "Tonga", "TT": "Trinidad and Tobago", "TN": "Tunisia", "TR": "Turkey", "TM": "Turkmenistan", "TC": "Turks and Caicos Islands", "TV": "Tuvalu", "VI": "U.S. Virgin Islands", "UG": "Uganda", "UA": "Ukraine", "AE": "United Arab Emirates", "GB": "United Kingdom", "US": "United States", "UY": "Uruguay", "UZ": "Uzbekistan", "VU": "Vanuatu", "VA": "Vatican", "VE": "Venezuela", "VN": "Vietnam", "WF": "Wallis and Futuna", "EH": "Western Sahara", "YE": "Yemen", "ZM": "Zambia", "ZW": "Zimbabwe",
    "UK": "United Kingdom", "EU": "Europe"
};

function getCountryName(code) {
    if (!code || code === 'N/A' || code === 'Unknown') return code;
    const cleanCode = String(code).trim().toUpperCase();
    return countryNames[cleanCode] || code;
}

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
                parsed[type] = { allTimeVisitors: 0, allTimeReturning: 0, totalRaw: 0, daily: {}, countries: {}, devices: { desktop: 0, mobile: 0 } };
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
                    if (!d.countries) {
                        d.countries = {};
                        needsSave = true;
                    }
                }

                if (!parsed[type].countries) {
                    parsed[type].countries = {};
                    needsSave = true;
                }
                if (!parsed[type].devices) {
                    parsed[type].devices = { desktop: 0, mobile: 0 };
                    needsSave = true;
                }
            }
        });

        if (needsSave) saveViewsData(parsed);
        return parsed;
    } catch (err) {
        const defaultCategory = () => ({ allTimeVisitors: 0, allTimeReturning: 0, totalRaw: 0, daily: {}, countries: {}, devices: { desktop: 0, mobile: 0 } });
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
        const daily = catData.daily[targetDate] || { visitors: 0, new: 0, returning: 0, raw: 0, countries: {} };
        
        const dailyRetPct = daily.visitors > 0 ? Math.round((daily.returning / daily.visitors) * 100) : 0;
        const allTimeRetPct = catData.allTimeVisitors > 0 ? Math.round((catData.allTimeReturning / catData.allTimeVisitors) * 100) : 0;

        const topCountries = Object.entries(catData.countries || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([c, count], i) => `  #${i+1} ${getCountryName(c)} (${count})`)
            .join('\n') || '  None';

        const topDailyCountries = Object.entries(daily.countries || {})
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([c, count], i) => `  #${i+1} ${getCountryName(c)} (${count})`)
            .join('\n') || '  None';

        return `[ ${name} ]\n` +
               `- Visitors Today: ${daily.visitors}\n` +
               `- New Today: ${daily.new}\n` +
               `- Returning Today: ${daily.returning} (${dailyRetPct}%)\n` +
               `- Top 5 Regions Today:\n${topDailyCountries}\n` +
               `- Visitors All-Time: ${catData.allTimeVisitors}\n` +
               `- Returning All-Time: ${catData.allTimeReturning} (${allTimeRetPct}%)\n` +
               `- Total All-Time (Raw): ${catData.totalRaw}\n` +
               `- Top 5 Regions All-Time:\n${topCountries}\n`;
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

    const country = req.headers['cf-ipcountry'] || 'Unknown';
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';

    if (!data[type]) {
        data[type] = { allTimeVisitors: 0, allTimeReturning: 0, totalRaw: 0, daily: {}, countries: {}, devices: { desktop: 0, mobile: 0 } };
    }

    if (!data[type].daily[today]) {
        data[type].daily[today] = { visitors: 0, new: 0, returning: 0, raw: 0, countries: {} };
    }

    data[type].totalRaw += 1;
    data[type].daily[today].raw += 1;

    if (isDailyUnique) {
        data[type].daily[today].visitors += 1;
        
        // Track country all-time
        if (!data[type].countries[country]) data[type].countries[country] = 0;
        data[type].countries[country] += 1;

        // Track country daily
        if (!data[type].daily[today].countries) data[type].daily[today].countries = {};
        if (!data[type].daily[today].countries[country]) data[type].daily[today].countries[country] = 0;
        data[type].daily[today].countries[country] += 1;

        // Track device
        data[type].devices[deviceType] += 1;
        
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
    
    const success = await sendEmailReport(`TEST - Portfolio Daily View Report - ${today}`, today, data);
    
    if (success) {
        res.json({ success: true, message: 'Test email sent successfully! Check your inbox.' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to send email. Check server logs for details.' });
    }
});

cron.schedule('59 23 * * *', async () => {
    const data = getViewsData();
    const today = getTodayString();

    await sendEmailReport(`Portfolio Daily View Report - ${today}`, today, data);
}, {
    scheduled: true,
    timezone: "America/New_York"
});

app.listen(PORT, () => console.log(`[API] View counter running on port ${PORT}`));