import { NextResponse } from 'next/server';
import { FALLBACK_CRYPTOS } from '@/lib/crypto-data';

const FMP_API_URL = 'https://financialmodelingprep.com/api/v3';
const API_KEY = process.env.FMP_API_KEY;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('search')?.trim().toLowerCase();

  if (API_KEY) {
    try {
      let fetchUrl = '';
      if (query) {
        fetchUrl = `${FMP_API_URL}/search?query=${query}&limit=40&exchange=CRYPTO&apikey=${API_KEY}`;
      } else {
        const defaultSymbols = 'BTCUSD,ETHUSD,BNBUSD,SOLUSD,XRPUSD,DOGEUSD,ADAUSD,AVAXUSD,SHIBUSD,DOTUSD,TRXUSD,LINKUSD,MATICUSD,LTCUSD,BCHUSD';
        fetchUrl = `${FMP_API_URL}/quote/${defaultSymbols}?apikey=${API_KEY}`;
      }

      const response = await fetch(fetchUrl, { next: { revalidate: 300 } });
      if (response.ok) {
        const cryptos = await response.json();
        if (Array.isArray(cryptos) && cryptos.length > 0) {
          const formattedCryptos = cryptos
            .filter(crypto => crypto && typeof crypto.price === 'number' && crypto.symbol)
            .map(crypto => ({
              symbol: crypto.symbol,
              name: crypto.name,
              price: crypto.price,
              change: crypto.change,
              changePercent: crypto.changesPercentage,
            }));
          if (formattedCryptos.length > 0) {
            return NextResponse.json(formattedCryptos);
          }
        }
      }
    } catch (error) {
      console.warn('FMP API unavailable, using fallback crypto list:', error);
    }
  }

  // Fallback filtering
  const allList = Object.values(FALLBACK_CRYPTOS).map(c => ({
    symbol: c.symbol,
    name: c.name,
    price: c.price,
    change: c.change,
    changePercent: c.changesPercentage,
  }));

  if (query) {
    const filtered = allList.filter(
      c => c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
    );
    return NextResponse.json(filtered);
  }

  return NextResponse.json(allList);
}
