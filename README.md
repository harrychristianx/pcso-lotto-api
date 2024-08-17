# PCSO Lotto API

This project provides an API for retrieving and processing PCSO (Philippine Charity Sweepstakes Office) lottery results. It fetches data from a Google Sheet in real time via Computer Vision, processes it to remove duplicates, and serves the unique lottery draw information via an Express.js server.

Historical data to be included, from January 02, 2013 to August 06, 2024

Datasets: https://www.kaggle.com/datasets/harrychristian/pcso-lottery-results-philippines/
Official Results: https://www.pcso.gov.ph/SearchLottoResult.aspx

## Features

- Fetches lottery data from a Google Sheet
- Processes data to keep only unique entries based on date, game, and ball numbers
- Caches processed data for improved performance
- Serves data via a RESTful API endpoint

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

2. The API will be available at `http://localhost:4000/api/lottery-results`

## How It Works

1. The server fetches data from the specified Google Sheet using the Google Sheets API.
2. The `processData` function processes the fetched data:
   - It iterates through each row of data
   - Creates a unique key for each entry based on date, game, and ball numbers
   - Stores only the first occurrence of each unique combination
3. The processed data is cached to improve performance for subsequent requests.
4. The API endpoint `/api/lottery-results` serves the processed data as JSON.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the Apache License.