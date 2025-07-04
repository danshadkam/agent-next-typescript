import { NextRequest, NextResponse } from 'next/server';
import { FinancialDataService } from '@/lib/financial-data';

const financialService = new FinancialDataService();

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

// Enhanced stock data with more realistic values and variation
const generateRealtimeStockData = (): StockData[] => {
  const baseStocks = [
    { symbol: "AAPL", name: "Apple Inc.", basePrice: 193.97, marketCap: 3021000000000 },
    { symbol: "MSFT", name: "Microsoft Corp.", basePrice: 378.85, marketCap: 2813000000000 },
    { symbol: "GOOGL", name: "Alphabet Inc.", basePrice: 140.93, marketCap: 1756000000000 },
    { symbol: "AMZN", name: "Amazon.com Inc.", basePrice: 175.43, marketCap: 1832000000000 },
    { symbol: "TSLA", name: "Tesla Inc.", basePrice: 248.50, marketCap: 791000000000 },
    { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 118.76, marketCap: 2918000000000 },
    { symbol: "META", name: "Meta Platforms Inc.", basePrice: 486.23, marketCap: 1245000000000 },
    { symbol: "NFLX", name: "Netflix Inc.", basePrice: 634.87, marketCap: 280000000000 },
    { symbol: "BTC-USD", name: "Bitcoin", basePrice: 96875.23, marketCap: 1900000000000 },
    { symbol: "ETH-USD", name: "Ethereum", basePrice: 3445.67, marketCap: 414000000000 },
    { symbol: "SOL-USD", name: "Solana", basePrice: 192.45, marketCap: 91000000000 }
  ];

  const now = new Date();
  const marketOpen = now.getHours() >= 9 && now.getHours() <= 16;
  
  return baseStocks.map(stock => {
    // Generate realistic price movement based on time and market conditions
    const timeBasedVariation = Math.sin(now.getMinutes() * 0.1) * 0.005; // Small time-based variation
    const marketVariation = marketOpen ? (Math.random() - 0.5) * 0.03 : (Math.random() - 0.5) * 0.01; // Higher variation during market hours
    const cryptoMultiplier = stock.symbol.includes('-USD') ? 2 : 1; // Crypto is more volatile
    
    const priceVariation = (timeBasedVariation + marketVariation) * cryptoMultiplier;
    const currentPrice = stock.basePrice * (1 + priceVariation);
    const change = currentPrice - stock.basePrice;
    const changePercent = (change / stock.basePrice) * 100;
    
    // Generate realistic volume based on market cap and time
    const baseVolume = Math.sqrt(stock.marketCap / 1000000) * 100000;
    const volumeVariation = 0.7 + Math.random() * 0.6; // 70%-130% of base volume
    const volume = Math.floor(baseVolume * volumeVariation);
    
    const stockData: StockData = {
      symbol: stock.symbol,
      name: stock.name,
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: Number(volume)
    };
    
    if (stock.marketCap) {
      stockData.marketCap = Number(stock.marketCap);
    }
    
    return stockData;
  });
};

// Function to fetch real data from external APIs
const fetchRealStockData = async (symbol?: string): Promise<StockData[]> => {
  const symbols = symbol ? [symbol] : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA'];
  
  try {
    // Try Yahoo Finance API (free, no API key needed)
    const promises = symbols.map(async (sym): Promise<StockData | null> => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Financial-App/1.0)',
            },
            signal: AbortSignal.timeout(5000) // 5 second timeout
          }
        );
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const result = data.chart?.result?.[0];
        
        if (!result) throw new Error('No data');
        
        const meta = result.meta;
        const currentPrice = Number(meta.regularMarketPrice || meta.previousClose || 0);
        const previousClose = Number(meta.previousClose || currentPrice);
        const change = currentPrice - previousClose;
        const changePercent = previousClose ? (change / previousClose) * 100 : 0;
        
        const stockData: StockData = {
          symbol: sym,
          name: getCompanyName(sym),
          price: Number(currentPrice.toFixed(2)),
          change: Number(change.toFixed(2)),
          changePercent: Number(changePercent.toFixed(2)),
          volume: Number(meta.regularMarketVolume || 1000000)
        };
        
        if (meta.marketCap && meta.marketCap > 0) {
          stockData.marketCap = Number(meta.marketCap);
        }
        
        return stockData;
      } catch (error) {
        console.warn(`Failed to fetch real data for ${sym}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    return results.filter((result): result is StockData => result !== null);
  } catch (error) {
    console.error('Failed to fetch real stock data:', error);
    return [];
  }
};

const getCompanyName = (symbol: string): string => {
  const names: { [key: string]: string } = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corp.',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corp.',
    'META': 'Meta Platforms Inc.',
    'NFLX': 'Netflix Inc.',
    'BTC-USD': 'Bitcoin',
    'ETH-USD': 'Ethereum',
    'SOL-USD': 'Solana'
  };
  return names[symbol] || symbol;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  
  try {
    console.log('📊 Market data request:', { symbol, timestamp: new Date().toISOString() });
    
    // Try to fetch real data first
    let realData: StockData[] = [];
    try {
      realData = await fetchRealStockData(symbol || undefined);
      console.log(`✅ Fetched ${realData.length} real stock data points`);
    } catch (error) {
      console.warn('⚠️ Real data fetch failed, using generated data:', error);
    }
    
    // Generate mock data as fallback or supplement
    const mockData = generateRealtimeStockData();
    
    // Combine real data with mock data, preferring real data
    const combinedData = mockData.map(mock => {
      const real = realData.find(r => r.symbol === mock.symbol);
      return real || mock;
    });
    
    // If requesting specific symbol, filter and return single stock
    if (symbol) {
      const normalizedSymbol = symbol.toUpperCase();
      
      // First try exact match
      let stockData = combinedData.find(stock => 
        stock.symbol.toUpperCase() === normalizedSymbol
      );
      
      // If not found, try common crypto aliases
      if (!stockData) {
        const cryptoAliases: { [key: string]: string } = {
          'BITCOIN': 'BTC-USD',
          'BTC': 'BTC-USD',
          'ETHEREUM': 'ETH-USD', 
          'ETH': 'ETH-USD',
          'SOLANA': 'SOL-USD',
          'SOL': 'SOL-USD'
        };
        
        const aliasSymbol = cryptoAliases[normalizedSymbol];
        if (aliasSymbol) {
          stockData = combinedData.find(stock => 
            stock.symbol.toUpperCase() === aliasSymbol
          );
        }
      }
      
      // If still not found, try name search
      if (!stockData) {
        stockData = combinedData.find(stock => 
          stock.name.toUpperCase().includes(normalizedSymbol)
        );
      }
      
      if (!stockData) {
        // Create a dynamic stock for any searched symbol
        console.log(`Creating dynamic stock data for: ${symbol}`);
        const basePrice = 50 + Math.random() * 200;
        const dynamicStock: StockData = {
          symbol: normalizedSymbol,
          name: `${symbol} (Searched)`,
          price: Number(basePrice.toFixed(2)),
          change: Number(((Math.random() - 0.5) * 10).toFixed(2)),
          changePercent: Number(((Math.random() - 0.5) * 5).toFixed(2)),
          volume: Math.floor(Math.random() * 10000000),
          marketCap: Math.floor(Math.random() * 1000000000000)
        };
        
        return NextResponse.json(dynamicStock, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      }
      
      return NextResponse.json(stockData, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    // Return all stocks
    const response = {
      stocks: combinedData,
      timestamp: new Date().toISOString(),
      source: realData.length > 0 ? 'mixed' : 'generated',
      count: combinedData.length
    };
    
    console.log(`📈 Returning ${combinedData.length} stocks (${realData.length} real, ${combinedData.length - realData.length} generated)`);
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Market data API error:', error);
    
    // Return fallback data with error indication
    const fallbackData = generateRealtimeStockData();
    
    return NextResponse.json({
      stocks: fallbackData,
      timestamp: new Date().toISOString(),
      source: 'fallback',
      count: fallbackData.length,
      error: 'Using fallback data due to API issues'
    }, {
      status: 200, // Still return 200 so app doesn't break
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();
    
    if (!Array.isArray(symbols)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected array of symbols.' },
        { status: 400 }
      );
    }
    
    const data = generateRealtimeStockData();
    const requestedStocks = data.filter(stock => 
      symbols.includes(stock.symbol.toUpperCase())
    );
    
    return NextResponse.json({
      stocks: requestedStocks,
      timestamp: new Date().toISOString(),
      requested: symbols.length,
      returned: requestedStocks.length
    });
    
  } catch (error) {
    console.error('Market data POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 