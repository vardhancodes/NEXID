const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

type StockListItem = {
  symbol: string;
  name: string;
  exchangeShortName?: string; // Keep this for sorting
};

// This function fetches a list of all stocks and relies on Next.js's fetch cache.
export async function getStockIndex(): Promise<StockListItem[]> {
  const url = `${FMP_API_URL}/stock/list?apikey=${API_KEY}`;
  
  try {
    // This fetch request is automatically cached by Next.js/Vercel.
    const response = await fetch(url, { next: { revalidate: 86400 } }); // Cache for 24 hours

    if (!response.ok) {
      // If the fetch fails, throw an error to be caught by the API route.
      throw new Error(`Failed to fetch stock index from FMP. Status: ${response.status}`);
    }

    const data: StockListItem[] = await response.json();
    
    // FMP can return an error object instead of an array. We must check for this.
    if (!Array.isArray(data)) {
      console.error("FMP API did not return an array for the stock list:", data);
      throw new Error('Invalid data format received from the stock list API.');
    }

    // Filter for valid entries that have both a name and a symbol.
    return data.filter(stock => stock.symbol && stock.name);

  } catch (error) {
    console.error("Error in getStockIndex:", error);
    // Re-throw the error so the calling API route knows the fetch failed.
    throw error;
  }
}
