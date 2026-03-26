const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3001;
const VIEWS_FILE = path.join(__dirname, 'views.json');

const allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1:5500',
    'https://sethgran.my.id',
    'http://sethgran.my.id'
];

app.use(compression());
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

let viewsCache = null;

async function getViews() {
    if (viewsCache !== null) return viewsCache;
    try {
        const data = await fs.readFile(VIEWS_FILE, 'utf8');
        viewsCache = JSON.parse(data).count || 0;
        return viewsCache;
    } catch (err) {
        viewsCache = 0;
        await fs.writeFile(VIEWS_FILE, JSON.stringify({ count: 0 }));
        return 0;
    }
}

app.get('/api/views', async (req, res) => {
    const count = await getViews();
    res.json({ count });
});

app.post('/api/views/increment', async (req, res) => {
    const currentCount = await getViews();
    viewsCache = currentCount + 1;
    fs.writeFile(VIEWS_FILE, JSON.stringify({ count: viewsCache })).catch(console.error);
    res.json({ count: viewsCache });
});

app.listen(PORT, () => console.log(`[API] View counter running on port ${PORT}`));