const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const VIEWS_FILE = path.join(__dirname, 'views.json');

const allowedOrigins = [
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

function getViews() {
    try {
        const data = fs.readFileSync(VIEWS_FILE, 'utf8');
        return JSON.parse(data).count || 0;
    } catch (err) {
        fs.writeFileSync(VIEWS_FILE, JSON.stringify({ count: 0 }));
        return 0;
    }
}

app.get('/api/views', (req, res) => {
    res.json({ count: getViews() });
});

app.post('/api/views/increment', (req, res) => {
    const currentCount = getViews();
    const newCount = currentCount + 1;
    fs.writeFileSync(VIEWS_FILE, JSON.stringify({ count: newCount }));
    res.json({ count: newCount });
});

app.listen(PORT, () => console.log(`[API] View counter running on port ${PORT}`));