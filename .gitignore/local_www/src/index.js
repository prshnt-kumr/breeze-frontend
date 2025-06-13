import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom'; // Ensure ReactDOM is imported

// This file is the entry point for your React application.
// It renders the main App component into the 'root' div in index.html.

function App() {
    const [stockSymbol, setStockSymbol] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [historicalData, setHistoricalData] = useState(null); // Will store data from backend
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        setHistoricalData(null); // Clear previous data

        try {
            // IMPORTANT: Updated URL for Azure deployment.
            // The frontend now calls the public URL of your deployed backend App Service.
            const response = await fetch('https://stock-predictor-backend.azurewebsites.net/api/fetch_historical_data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stock_symbol: stockSymbol,
                    from_date: startDate,
                    to_date: endDate,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch data from backend.');
            }

            const result = await response.json();
            setHistoricalData(result.historical_data); // Set the fetched data

        } catch (err) {
            setError(`Error: ${err.message}. Make sure your Python backend is running and reachable.`);
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }, [stockSymbol, startDate, endDate]); // Dependencies for useCallback

    return (
        <div className="min-h-screen bg-gray-100 p-4 font-inter">
            {/* Tailwind CSS CDN for styling */}
            <script src="https://cdn.tailwindcss.com"></script>
            {/* Google Fonts for 'Inter' font */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div className="max-w-7xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
                    NSE Stock Predictor & Agent Evaluation
                </h1>

                {/* Input Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-blue-50 rounded-md">
                    <div>
                        <label htmlFor="stockSymbol" className="block text-sm font-medium text-gray-700">Stock Symbol (e.g., TCS, INFY)</label>
                        <input
                            type="text"
                            id="stockSymbol"
                            value={stockSymbol}
                            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                            placeholder="e.g., RELIANCE"
                        />
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Historical Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Historical End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        />
                    </div>
                </div>

                <div className="flex justify-center mb-10">
                    <button
                        onClick={handleFetchData}
                        disabled={loading || !stockSymbol || !startDate || !endDate}
                        className={`py-3 px-8 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300
              ${loading || !stockSymbol || !startDate || !endDate ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Fetching Data...' : 'Fetch Historical Data'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {historicalData && (
                    <div className="mt-8 p-6 bg-green-50 rounded-md shadow-inner">
                        <h2 className="text-xl font-semibold text-green-800 mb-4">Data Fetched Successfully!</h2>
                        <p className="text-gray-700">
                            Received {historicalData.length} entries for {stockSymbol}.
                            <pre className="mt-4 p-4 bg-gray-100 rounded-md overflow-x-auto text-sm">
                                {JSON.stringify(historicalData, null, 2)}
                            </pre>
                        </p>
                    </div>
                )}

                <div className="mt-10 text-center text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
                    <p className="font-semibold">Disclaimer:</p>
                    <p>
                        This application now attempts to fetch <span className="font-bold">real data from the ICICI Direct Breeze API</span> via the Python backend,
                        and <span className="font-bold">caches this data in a Firestore database</span> for faster retrieval and to reduce API calls.
                        Ensure your `BREEZE_API_KEY`, `BREEZE_SECRET_KEY`, `BREEZE_SESSION_TOKEN`, and `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` are correctly set in the `.env` file at the project root.
                        Remember that the `BREEZE_SESSION_TOKEN` needs to be generated manually every day.
                        Do not use this app for actual financial decisions.
                    </p>
                </div>
            </div>
        </div>
    );
}

// Render the App component into the 'root' div
ReactDOM.render(<App />, document.getElementById('root'));
