const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

type StockListItem = {
  symbol: string;
  name: string;
};

let cachedStockList: StockListItem[] = [];
let lastFetchTime: number = 0;

// This function fetches a list of all stocks and caches it for 24 hours.
export async function getStockIndex(): Promise<StockListItem[]> {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  // Use the cached list if it's less than a day old.
  if (cachedStockList.length > 0 && (now - lastFetchTime) < oneDay) {
    return cachedStockList;
  }

  try {
    const url = `${FMP_API_URL}/stock/list?apikey=${API_KEY}`;
    const response = await fetch(url, {
      // This Next.js feature caches the data on the server.
      next: { revalidate: 86400 }, // Revalidate once every 24 hours
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stock index from FMP');
    }

    const data: StockListItem[] = await response.json();
    
    // Filter for valid entries and cache them
    cachedStockList = data.filter(stock => stock.symbol && stock.name);
    lastFetchTime = now;

    return cachedStockList;
  } catch (error) {
    console.error("Error fetching stock index:", error);
    // Return the old cache if the new fetch fails
    return cachedStockList; 
  }
}
