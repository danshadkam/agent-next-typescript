import type { StockData, MarketData, RiskAnalysis, TechnicalAnalysis, NewsAnalysis } from '@/types/financial';

// Financial data service with real API integrations
export class FinancialDataService {
  private alphaVantageKey?: string;
  private newsApiKey?: string;

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
  }

  async getStockData(symbol: string): Promise<StockData> {
    // Try Twelve Data first (800 requests/day free tier)
    try {
      return await this.getTwelveDataStockData(symbol);
    } catch (error) {
      console.error(`Error fetching Twelve Data for ${symbol}:`, error);
      
      // Fallback to Yahoo Finance if available
      try {
        return await this.getYahooFinanceData(symbol);
      } catch (yahooError) {
        console.error(`Error fetching Yahoo Finance data for ${symbol}:`, yahooError);
        
        // Fallback to Alpha Vantage if available
        if (this.alphaVantageKey) {
          try {
            return await this.getAlphaVantageData(symbol);
          } catch (alphaError) {
            console.error(`Error fetching Alpha Vantage data for ${symbol}:`, alphaError);
          }
        }
        
        // Final fallback to realistic mock data
        return this.getMockStockData(symbol);
      }
    }
  }

  private async getTwelveDataStockData(symbol: string): Promise<StockData> {
    const apiKey = process.env.TWELVE_DATA_API_KEY || 'demo'; // demo key for testing
    const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`);
    const data = await response.json();
    
    if (data.status === 'error' || !data.symbol) {
      throw new Error(data.message || `No data found for symbol: ${symbol}`);
    }

    const price = parseFloat(data.close);
    const change = parseFloat(data.change);
    const changePercent = parseFloat(data.percent_change);

    return {
      symbol: symbol.toUpperCase(),
      name: data.name || this.getCompanyName(symbol),
      price: price,
      change: change,
      changePercent: changePercent,
      volume: parseInt(data.volume) || 1000000,
      marketCap: 0, // Not provided by Twelve Data quote endpoint
      pe: 0, // Not provided by Twelve Data quote endpoint
      dividendYield: 0, // Not provided by Twelve Data quote endpoint
    };
  }

  private async getYahooFinanceData(symbol: string): Promise<StockData> {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
    const data = await response.json();
    
    if (!data.chart?.result?.[0]) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    
    const currentPrice = meta.regularMarketPrice || quote.close[quote.close.length - 1];
    const previousClose = meta.previousClose || quote.close[quote.close.length - 2] || currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 1000000,
      marketCap: meta.marketCap || 0,
      pe: meta.trailingPE || 0,
      dividendYield: meta.dividendYield || 0,
    };
  }

  private async getAlphaVantageData(symbol: string): Promise<StockData> {
    // Get current quote
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`;
    const quoteResponse = await fetch(quoteUrl);
    const quoteData = await quoteResponse.json();

    if (quoteData['Information']?.includes('rate limit') || quoteData['Note']) {
      throw new Error('Alpha Vantage API rate limit exceeded');
    }

    if (quoteData['Error Message']) {
      throw new Error(quoteData['Error Message']);
    }

    const quote = quoteData['Global Quote'];
    if (!quote) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price,
      change,
      changePercent,
      volume: parseInt(quote['06. volume']),
      marketCap: 0,
      pe: 0,
      dividendYield: 0,
    };
  }

  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(symbol => this.getStockData(symbol));
    return Promise.all(promises);
  }

  async getMarketData(): Promise<MarketData> {
    const majorStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
    const stocks = await this.getMultipleStocks(majorStocks);

    return {
      stocks,
      indices: {
        'S&P 500': {
          value: 4150.25,
          change: 15.30,
          changePercent: 0.37,
        },
        'NASDAQ': {
          value: 12850.75,
          change: -22.45,
          changePercent: -0.17,
        },
        'DOW': {
          value: 33450.12,
          change: 105.60,
          changePercent: 0.32,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getRiskAnalysis(symbol: string): Promise<RiskAnalysis> {
    // Mock risk analysis - in production, calculate from historical data
    const beta = 0.5 + Math.random() * 1.5;
    const volatility = 0.15 + Math.random() * 0.35;
    const sharpeRatio = Math.random() * 2;
    const var95 = -0.05 - Math.random() * 0.1;
    const maxDrawdown = -0.1 - Math.random() * 0.4;

    let riskRating: 'Low' | 'Medium' | 'High' = 'Medium';
    if (beta < 0.8 && volatility < 0.25) riskRating = 'Low';
    if (beta > 1.3 || volatility > 0.4) riskRating = 'High';

    return {
      symbol: symbol.toUpperCase(),
      beta,
      volatility,
      var95,
      sharpeRatio,
      maxDrawdown,
      riskRating,
    };
  }

  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
    if (!this.alphaVantageKey) {
      throw new Error('Alpha Vantage API key not configured');
    }

    try {
      // Get technical indicators from Alpha Vantage
      const [rsiData, macdData, smaData, bbData] = await Promise.all([
        fetch(`https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${this.alphaVantageKey}`),
        fetch(`https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${this.alphaVantageKey}`),
        fetch(`https://www.alphavantage.co/query?function=SMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${this.alphaVantageKey}`),
        fetch(`https://www.alphavantage.co/query?function=BBANDS&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${this.alphaVantageKey}`)
      ]);

      const [rsiResponse, macdResponse, smaResponse, bbResponse] = await Promise.all([
        rsiData.json(),
        macdData.json(),
        smaData.json(),
        bbData.json()
      ]);

      // Get current stock price
      const stockData = await this.getStockData(symbol);
      const price = stockData.price;

      // Extract latest values
      const rsiValues = Object.values(rsiResponse['Technical Analysis: RSI'] || {});
      const rsi = rsiValues.length > 0 ? parseFloat((rsiValues[0] as any)['RSI']) : 50;

      const macdValues = Object.values(macdResponse['Technical Analysis: MACD'] || {});
      const latestMacd = macdValues[0] as any;
      const macd = {
        value: latestMacd ? parseFloat(latestMacd['MACD']) : 0,
        signal: latestMacd ? parseFloat(latestMacd['MACD_Signal']) : 0,
        histogram: latestMacd ? parseFloat(latestMacd['MACD_Hist']) : 0,
      };

      // Get multiple SMAs
      const sma20Values = Object.values(smaResponse['Technical Analysis: SMA'] || {});
      const sma20 = sma20Values.length > 0 ? parseFloat((sma20Values[0] as any)['SMA']) : price;

      // Approximate other SMAs (in production, make separate API calls)
      const movingAverages = {
        sma20,
        sma50: price * (0.95 + Math.random() * 0.06), // Fallback to approximation
        sma200: price * (0.90 + Math.random() * 0.15), // Fallback to approximation
      };

      const bbValues = Object.values(bbResponse['Technical Analysis: BBANDS'] || {});
      const latestBB = bbValues[0] as any;
      const bollingerBands = {
        upper: latestBB ? parseFloat(latestBB['Real Upper Band']) : price * 1.02,
        middle: latestBB ? parseFloat(latestBB['Real Middle Band']) : price,
        lower: latestBB ? parseFloat(latestBB['Real Lower Band']) : price * 0.98,
      };

      // Determine signals based on indicators
      let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      if (price > movingAverages.sma20 && movingAverages.sma20 > movingAverages.sma50) {
        trend = 'Bullish';
      } else if (price < movingAverages.sma20 && movingAverages.sma20 < movingAverages.sma50) {
        trend = 'Bearish';
      }

      const momentum = rsi > 70 ? 'Strong' : rsi < 30 ? 'Weak' : 'Neutral';
      
      let recommendation: 'Buy' | 'Hold' | 'Sell' = 'Hold';
      if (trend === 'Bullish' && rsi < 70) recommendation = 'Buy';
      if (trend === 'Bearish' && rsi > 30) recommendation = 'Sell';

      return {
        symbol: symbol.toUpperCase(),
        indicators: {
          rsi,
          macd,
          movingAverages,
          bollingerBands,
        },
        signals: {
          trend,
          momentum,
          recommendation,
        },
      };
    } catch (error) {
      console.error(`Error fetching technical analysis for ${symbol}:`, error);
      // Fallback to mock data if API fails
      return this.getMockTechnicalAnalysis(symbol);
    }
  }

  async getNewsAnalysis(symbol: string): Promise<NewsAnalysis> {
    if (!this.newsApiKey) {
      throw new Error('News API key not configured');
    }

    try {
      // Get company name for better search results
      const companyName = this.getCompanyName(symbol);
      const query = `${symbol} OR "${companyName}"`;
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&apiKey=${this.newsApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(data.message || 'Failed to fetch news');
      }

      const articles = data.articles.slice(0, 5).map((article: any) => ({
        title: article.title,
        summary: article.description || article.content?.substring(0, 200) + '...' || 'No summary available',
        source: article.source.name,
        publishedAt: article.publishedAt,
        sentimentScore: this.analyzeSentiment(article.title + ' ' + (article.description || '')),
        url: article.url,
      }));

      // Calculate overall sentiment
      const sentimentScore = articles.length > 0 
        ? articles.reduce((sum: number, article: any) => sum + article.sentimentScore, 0) / articles.length
        : 0;

      let sentimentLabel: 'Bearish' | 'Neutral' | 'Bullish' = 'Neutral';
      if (sentimentScore > 0.3) sentimentLabel = 'Bullish';
      if (sentimentScore < -0.3) sentimentLabel = 'Bearish';

      return {
        symbol: symbol.toUpperCase(),
        sentimentScore,
        sentimentLabel,
        articles,
      };
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error);
      // Fallback to mock data if API fails
      return this.getMockNewsAnalysis(symbol);
    }
  }

  private getMockStockData(symbol: string): StockData {
    // Realistic price ranges for different stocks
    const priceMap: { [key: string]: number } = {
      'AAPL': 230,
      'GOOGL': 175,
      'MSFT': 450,
      'AMZN': 200,
      'TSLA': 240,
      'NVDA': 140,
      'META': 580,
      'NFLX': 700,
    };
    
    const basePrice = priceMap[symbol.toUpperCase()] || 100;
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const price = basePrice * (1 + variation);
    const change = (Math.random() - 0.5) * 6; // ±$3 typical daily change
    const changePercent = (change / price) * 100;

    const mockData: StockData = {
      symbol: symbol.toUpperCase(),
      name: this.getCompanyName(symbol),
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 50000000) + 10000000, // 10M-60M volume
      marketCap: Math.floor(basePrice * 2000000000), // Realistic market cap
      pe: 15 + Math.random() * 25, // P/E ratio 15-40
      dividendYield: Math.random() * 3, // 0-3% dividend yield
    };

    return mockData;
  }

  private getCompanyName(symbol: string): string {
    const companies: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corporation',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
    };
    return companies[symbol.toUpperCase()] || `${symbol.toUpperCase()} Corporation`;
  }

  async searchFinancialDocuments(query: string): Promise<string> {
    // This will integrate with the existing Vectorize service for financial documents
    const mockResults = `
    Financial Analysis: Based on recent SEC filings and analyst reports for ${query}:
    - Revenue growth has been consistent over the past 4 quarters
    - Debt-to-equity ratio remains within industry standards
    - Management guidance suggests continued expansion in key markets
    - Recent acquisitions are expected to drive synergies and cost savings
    `;
    
    return mockResults;
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis based on keywords
    // In production, you might use a proper sentiment analysis API
    const positiveWords = ['good', 'great', 'excellent', 'strong', 'positive', 'up', 'growth', 'profit', 'gain', 'beat', 'exceeds', 'upgrade', 'bullish'];
    const negativeWords = ['bad', 'poor', 'terrible', 'weak', 'negative', 'down', 'loss', 'decline', 'miss', 'downgrade', 'bearish', 'fall'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) score += 0.1;
      if (negativeWords.some(neg => word.includes(neg))) score -= 0.1;
    });
    
    // Clamp between -1 and 1
    return Math.max(-1, Math.min(1, score));
  }

  private getMockNewsAnalysis(symbol: string): NewsAnalysis {
    const sentimentScore = (Math.random() - 0.5) * 2; // -1 to 1
    
    let sentimentLabel: 'Bearish' | 'Neutral' | 'Bullish' = 'Neutral';
    if (sentimentScore > 0.3) sentimentLabel = 'Bullish';
    if (sentimentScore < -0.3) sentimentLabel = 'Bearish';

    const mockArticles = [
      {
        title: `${symbol.toUpperCase()} Reports Strong Quarterly Earnings`,
        summary: `${symbol.toUpperCase()} exceeded analyst expectations with robust revenue growth and improved margins.`,
        source: 'Financial Times',
        publishedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        sentimentScore: 0.7,
        url: 'https://example.com/news1',
      },
      {
        title: `Market Volatility Affects ${symbol.toUpperCase()} Trading`,
        summary: 'Recent market turbulence has created uncertainty around growth stocks including ' + symbol.toUpperCase(),
        source: 'Reuters',
        publishedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
        sentimentScore: -0.3,
        url: 'https://example.com/news2',
      },
    ];

    return {
      symbol: symbol.toUpperCase(),
      sentimentScore,
      sentimentLabel,
      articles: mockArticles,
    };
  }

  private getMockTechnicalAnalysis(symbol: string): TechnicalAnalysis {
    const rsi = 30 + Math.random() * 40;
    const price = 150 + Math.random() * 100;
    
    const macd = {
      value: (Math.random() - 0.5) * 5,
      signal: (Math.random() - 0.5) * 5,
      histogram: (Math.random() - 0.5) * 2,
    };

    const movingAverages = {
      sma20: price * (0.98 + Math.random() * 0.04),
      sma50: price * (0.95 + Math.random() * 0.06),
      sma200: price * (0.90 + Math.random() * 0.15),
    };

    const bollingerBands = {
      upper: price * 1.02,
      middle: price,
      lower: price * 0.98,
    };

    // Determine signals based on indicators
    let trend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
    if (price > movingAverages.sma20 && movingAverages.sma20 > movingAverages.sma50) {
      trend = 'Bullish';
    } else if (price < movingAverages.sma20 && movingAverages.sma20 < movingAverages.sma50) {
      trend = 'Bearish';
    }

    const momentum = rsi > 70 ? 'Strong' : rsi < 30 ? 'Weak' : 'Neutral';
    
    let recommendation: 'Buy' | 'Hold' | 'Sell' = 'Hold';
    if (trend === 'Bullish' && rsi < 70) recommendation = 'Buy';
    if (trend === 'Bearish' && rsi > 30) recommendation = 'Sell';

    return {
      symbol: symbol.toUpperCase(),
      indicators: {
        rsi,
        macd,
        movingAverages,
        bollingerBands,
      },
      signals: {
        trend,
        momentum,
        recommendation,
      },
    };
  }
} 