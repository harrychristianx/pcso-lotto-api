const express = require('express');
const { google } = require('googleapis');
const NodeCache = require('node-cache');

const app = express();
const port = 4000;

const cache = new NodeCache({ stdTTL: 300 });

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = '16OsD3wm-SKWu-Bw8XG3xNd4sV36b95cZhbrsF5P7zGs';
const REALTIME_RANGE = 'Realtime!A:J';
const DAILY_RANGE = 'Daily!A:L';

const serviceAccount = require('./service_account_key.json');

const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

function processRealtimeData(rows) {
    console.log('Processing Realtime data, total rows:', rows.length);
    const headers = rows.shift();

    let uniqueEntries = {};

    for (let i = 0; i < rows.length; i++) {
        const [timestamp, date, game, draw, ...ballNumbers] = rows[i];
        const cleanBallNumbers = ballNumbers.filter(num => num !== '');
        const key = `${date}_${game}_${cleanBallNumbers.join(',')}`;

        if (!uniqueEntries[key]) {
            uniqueEntries[key] = { timestamp, date, game, draw, ballNumbers: cleanBallNumbers };
        }
    }

    const processedData = Object.values(uniqueEntries);
    console.log('Processed Realtime data entries:', processedData.length);
    return processedData;
}

function formatDailyData(rows) {
    const headers = rows.shift();
    return rows.map(row => {
        const [timestamp, date, game, draw, ...rest] = row;
        const ballNumbers = rest.slice(0, 6).filter(num => num !== '');
        const jackpot = rest[6] || '';
        const winners = rest[7] || '';

        return {
            timestamp,
            date,
            game,
            draw,
            ballNumbers,
            jackpot,
            winners
        };
    });
}

async function fetchRealtimeData() {
    const cachedData = cache.get("realtimeLotteryResults");
    if (cachedData) {
        console.log('Returning cached Realtime data');
        return cachedData;
    }

    console.log('Fetching data from Google Sheets for Realtime');
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: REALTIME_RANGE,
    });

    console.log('Realtime data fetched successfully, rows:', response.data.values.length);

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('No data found in the Realtime response');
        throw new Error('No data found in Realtime sheet.');
    }

    const processedData = processRealtimeData(rows);
    cache.set("realtimeLotteryResults", processedData);

    return processedData;
}

function filterDailyData(data, filter) {
    return data.filter(entry => {
        const dateMatch = !filter.date || entry.date === filter.date;
        const gameMatch = !filter.game || entry.game.replace(/\s+/g, '-').toLowerCase() === filter.game.toLowerCase();
        const drawMatch = !filter.draw || entry.draw.toLowerCase().includes(filter.draw.toLowerCase());
        return dateMatch && gameMatch && drawMatch;
    });
}

function isValidDate(dateString) {
    return !isNaN(Date.parse(dateString));
}

function isValidDraw(drawString) {
    return ['2PM', '5PM', '9PM'].includes(drawString.toUpperCase());
}

async function fetchDailyData() {
    const cachedData = cache.get("dailyLotteryResults");
    if (cachedData) {
        console.log('Returning cached Daily data');
        return cachedData;
    }

    console.log('Fetching data from Google Sheets for Daily');
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: DAILY_RANGE,
    });

    console.log('Daily data fetched successfully, rows:', response.data.values.length);

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        console.log('No data found in the Daily response');
        throw new Error('No data found in Daily sheet.');
    }

    const formattedData = formatDailyData(rows);
    cache.set("dailyLotteryResults", formattedData);

    return formattedData;
}

app.get('/api/live-lotto-results', async (req, res) => {
    try {
        const data = await fetchRealtimeData();
        res.json(data);
    } catch (error) {
        console.error('Error fetching realtime data:', error);
        res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
    }
});

app.get('/api/daily-lotto-results/:param1?/:param2?/:param3?', async (req, res) => {
    try {
        const { param1, param2, param3 } = req.params;
        const filter = {};

        [param1, param2, param3].forEach(param => {
            if (param) {
                if (isValidDate(param)) {
                    filter.date = param;
                } else if (isValidDraw(param)) {
                    filter.draw = param.toUpperCase();
                } else {
                    filter.game = param;
                }
            }
        });

        const data = await fetchDailyData();
        const filteredData = filterDailyData(data, filter);
        res.json(filteredData);
    } catch (error) {
        console.error('Error fetching or filtering daily data:', error);
        res.status(500).json({ error: 'An error occurred while fetching or filtering data', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});