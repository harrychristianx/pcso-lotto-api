const express = require('express');
const { google } = require('googleapis');
const NodeCache = require('node-cache');

const app = express();
const port = 4000;

const cache = new NodeCache({ stdTTL: 300 });

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = '16OsD3wm-SKWu-Bw8XG3xNd4sV36b95cZhbrsF5P7zGs';
const RANGE_NAME = 'PCSO Results!A:J';

const serviceAccount = require('./service_account_key.json');

const auth = new google.auth.JWT({
  email: serviceAccount.client_email,
  key: serviceAccount.private_key,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

function processData(rows) {
    console.log('Processing data, total rows:', rows.length);
    const headers = rows.shift();
  
    let uniqueEntries = {};
  
    for (let i = 0; i < rows.length; i++) {
      const [timestamp, date, game, draw, ...ballNumbers] = rows[i];
      const cleanBallNumbers = ballNumbers.filter(num => num !== '');
      const key = `${date}_${game}_${cleanBallNumbers.join(',')}`;
  
      if (!uniqueEntries[key]) {
        uniqueEntries[key] = {timestamp, date, game, draw, ballNumbers: cleanBallNumbers};
      }
    }
  
    const processedData = Object.values(uniqueEntries);
    console.log('Processed data entries:', processedData.length);
    return processedData;
  }
  
  app.get('/api/lottery-results', async (req, res) => {
    try {
      const cachedData = cache.get("lotteryResults");
      if (cachedData) {
        console.log('Returning cached data');
        return res.json(cachedData);
      }
  
      console.log('Fetching data from Google Sheets');
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: RANGE_NAME,
      });
  
      console.log('Data fetched successfully, rows:', response.data.values.length);
  
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        console.log('No data found in the response');
        return res.status(404).json({ error: 'No data found.' });
      }
  
      const processedData = processData(rows);
  
      cache.set("lotteryResults", processedData);
  
      console.log('Sending processed data, entries:', processedData.length);
      res.json(processedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'An error occurred while fetching data', details: error.message });
    }
  });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});