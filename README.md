# PCSO Lotto API

This project provides an API for retrieving and processing PCSO (Philippine Charity Sweepstakes Office) lottery results. It fetches data from a Google Sheet in real time via Computer Vision, processes it, and serves the lottery draw information via an Express.js server.

Historical data included, from January 02, 2013 to August 06, 2024

Datasets: https://www.kaggle.com/datasets/harrychristian/pcso-lottery-results-philippines/
Official Results: https://www.pcso.gov.ph/SearchLottoResult.aspx

## Features

- Fetches lottery data in real-time from a Google Sheet using Computer Vision technology
- Processes data for both real-time and daily results
- Caches processed data for improved performance
- Serves data via RESTful API endpoints with flexible filtering options
- Provides formatted data for easy integration

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)
- A Google Cloud project with the Google Sheets API enabled
- A service account key for accessing the Google Sheet

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/your-username/pcso-lotto-api.git
   cd pcso-lotto-api
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your Google Cloud project and create a service account key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Sheets API for your project
   - Create a service account and download the JSON key file
   - Rename the key file to `service_account_key.json` and place it in the project root directory

4. Share your Google Sheet with the email address in the `client_email` field of your service account JSON file.

5. Update the `SPREADSHEET_ID` constant in the code with your Google Sheet's ID.

## Usage

1. Start the server:
   ```
   node server.js
   ```

2. The API will be available at:
   - `http://localhost:4000/api/live-lotto-results` for real-time results
   - `http://localhost:4000/api/daily-lotto-results` for daily results with flexible filtering options

### Filtering Options for Daily Results

The `/api/daily-lotto-results` endpoint now supports flexible filtering based on date, game, and draw time. You can use the following URL patterns:

- `/api/daily-lotto-results`: Returns all daily lotto results
- `/api/daily-lotto-results/2024-08-06`: Returns all results for August 6, 2024
- `/api/daily-lotto-results/3D-Lotto`: Returns all 3D Lotto results
- `/api/daily-lotto-results/2PM`: Returns all results for 2PM draws
- `/api/daily-lotto-results/2024-08-06/3D-Lotto`: Returns 3D Lotto results for August 6, 2024
- `/api/daily-lotto-results/2024-08-06/3D-Lotto/2PM`: Returns 3D Lotto results for August 6, 2024 at 2PM
- `/api/daily-lotto-results/3D-Lotto/2PM`: Returns all 3D Lotto results for 2PM draws
- `/api/daily-lotto-results/2024-08-06/2PM`: Returns all results for August 6, 2024 at 2PM

The order of the parameters doesn't matter, so `/api/daily-lotto-results/2PM/3D-Lotto/2024-08-06` would work just as well.

## How It Works

1. The server fetches data from the specified Google Sheet using the Google Sheets API and Computer Vision technology.
2. For real-time results:
   - The `processRealtimeData` function processes the fetched data, removing duplicates based on date, game, and ball numbers.
3. For daily results:
   - The `formatDailyData` function formats the data according to the specified structure.
   - The `filterDailyData` function applies filters based on the provided parameters (date, game, draw time).
4. The processed data is cached to improve performance for subsequent requests.
5. The API endpoints serve the processed data as JSON.

## Data Format

### Real-time Results
```json
{
  "timestamp": "2024-08-17 21:34:49",
  "date": "2024-08-17",
  "game": "2D Lotto",
  "draw": "9PM Draw",
  "ballNumbers": ["15", "27"]
}
```

### Daily Results
```json
{
  "timestamp": "2024-08-17 00:00:00",
  "date": "2024-08-17",
  "game": "2D Lotto",
  "draw": "9PM Draw",
  "ballNumbers": ["15", "27"],
  "jackpot": "4,500.00",
  "winners": "185"
}
```

## Computer Vision Integration

This (Realtime) API uses advanced Computer Vision technology to extract lottery results from various sources, ensuring up-to-date and accurate data. For more information about our Computer Vision capabilities and pricing, please contact:

Email: info@harrychristian.com

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License.