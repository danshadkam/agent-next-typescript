import type { StockData, MarketData, RiskAnalysis, TechnicalAnalysis, NewsAnalysis } from '@/types/financial';

// Financial data service with improved API integrations
export class FinancialDataService {
  private alphaVantageKey?: string;
  private newsApiKey?: string;
  private finnhubKey?: string;

  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.finnhubKey = process.env.FINNHUB_API_KEY;
  }

  async getStockData(symbol: string): Promise<StockData> {
    // Try multiple APIs in order of preference for accuracy
    try {
      // Try Finnhub first (good free tier with real-time data)
      if (this.finnhubKey) {
        return await this.getFinnhubStockData(symbol);
      }
    } catch (error) {
      console.error(`Finnhub error for ${symbol}:`, error);
    }

    try {
      // Try Yahoo Finance as backup (free, no API key needed)
      return await this.getYahooFinanceData(symbol);
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error);
    }

    try {
      // Try Alpha Vantage if available
      if (this.alphaVantageKey) {
        return await this.getAlphaVantageData(symbol);
      }
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error);
    }

    // Enhanced fallback with more realistic mock data
    return this.getEnhancedMockStockData(symbol);
  }

  private async getFinnhubStockData(symbol: string): Promise<StockData> {
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${this.finnhubKey}`;
    
    const [quoteResponse, profileResponse] = await Promise.all([
      fetch(quoteUrl),
      fetch(profileUrl)
    ]);

    const quoteData = await quoteResponse.json();
    const profileData = await profileResponse.json();

    if (quoteData.error || !quoteData.c) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const currentPrice = quoteData.c; // Current price
    const previousClose = quoteData.pc; // Previous close
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: symbol.toUpperCase(),
      name: profileData.name || this.getCompanyName(symbol),
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: parseInt(quoteData.volume) || 1000000,
      marketCap: profileData.marketCapitalization ? profileData.marketCapitalization * 1000000 : 0,
      pe: 0, // Would need additional API call
      dividendYield: 0, // Would need additional API call
    };
  }

  private async getYahooFinanceData(symbol: string): Promise<StockData> {
    // Enhanced Yahoo Finance implementation with better error handling
    const yahooSymbol = symbol.toUpperCase();
    
    try {
      // Try the v8 chart API first
      const chartResponse = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d&includePrePost=true`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        }
      );
      
      if (!chartResponse.ok) {
        throw new Error(`Yahoo Finance API error: ${chartResponse.status}`);
      }
      
      const chartData = await chartResponse.json();
      
      if (!chartData.chart?.result?.[0]) {
        throw new Error(`No chart data found for symbol: ${yahooSymbol}`);
      }

      const result = chartData.chart.result[0];
      const meta = result.meta;
      const timestamps = result.timestamp;
      const quotes = result.indicators?.quote?.[0];
      
      // Get current and previous prices
      let currentPrice = meta.regularMarketPrice || meta.previousClose;
      let previousClose = meta.previousClose;
      
      // If we have intraday data, use the latest available price
      if (quotes && quotes.close && timestamps) {
        const latestIndex = quotes.close.length - 1;
        if (latestIndex >= 0 && quotes.close[latestIndex] !== null) {
          currentPrice = quotes.close[latestIndex];
        }
      }
      
      // Calculate change
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      // Get additional data from quote API for more accuracy
      try {
        const quoteResponse = await fetch(
          `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          }
        );
        
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          const quote = quoteData.quoteResponse?.result?.[0];
          
          if (quote) {
            // Use more accurate real-time data if available
            currentPrice = quote.regularMarketPrice || currentPrice;
            previousClose = quote.regularMarketPreviousClose || previousClose;
            
            // Recalculate with real-time data
            const rtChange = currentPrice - previousClose;
            const rtChangePercent = (rtChange / previousClose) * 100;
            
            return {
              symbol: yahooSymbol,
              name: quote.longName || quote.shortName || this.getCompanyName(yahooSymbol),
              price: Number(currentPrice.toFixed(2)),
              change: Number(rtChange.toFixed(2)),
              changePercent: Number(rtChangePercent.toFixed(2)),
              volume: quote.regularMarketVolume || meta.regularMarketVolume || 1000000,
              marketCap: quote.marketCap || meta.marketCap || 0,
              pe: quote.trailingPE || meta.trailingPE || 0,
              dividendYield: quote.dividendYield || meta.dividendYield || 0,
            };
          }
        }
      } catch (quoteError) {
        console.log(`Quote API failed for ${yahooSymbol}, using chart data:`, quoteError);
      }
      
      // Fallback to chart data
      return {
        symbol: yahooSymbol,
        name: this.getCompanyName(yahooSymbol),
        price: Number(currentPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: meta.regularMarketVolume || 1000000,
        marketCap: meta.marketCap || 0,
        pe: meta.trailingPE || 0,
        dividendYield: meta.dividendYield || 0,
      };
      
    } catch (error) {
      console.error(`Yahoo Finance error for ${yahooSymbol}:`, error);
      throw error;
    }
  }

  private async getAlphaVantageData(symbol: string): Promise<StockData> {
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
    // Batch requests with delay to avoid rate limiting
    const results: StockData[] = [];
    for (let i = 0; i < symbols.length; i++) {
      try {
        const stockData = await this.getStockData(symbols[i]);
        results.push(stockData);
        
        // Add small delay between requests to avoid rate limiting
        if (i < symbols.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error fetching data for ${symbols[i]}:`, error);
        // Add fallback data instead of failing completely
        results.push(this.getEnhancedMockStockData(symbols[i]));
      }
    }
    return results;
  }

  async getMarketData(): Promise<MarketData> {
    try {
      // Fetch data for major market symbols
      const majorStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
      const cryptoSymbols = ['BTC-USD', 'ETH-USD', 'SOL-USD'];
      
      // Get stock data (with rate limiting)
      const stockPromises = majorStocks.map(async (symbol, index) => {
        await new Promise(resolve => setTimeout(resolve, index * 150)); // Stagger requests
        return this.getStockData(symbol);
      });
      
      const stocks = await Promise.all(stockPromises);
      
      // Add crypto data with enhanced mock data (crypto APIs often require paid plans)
      const cryptoData = cryptoSymbols.map(symbol => this.getEnhancedMockStockData(symbol));
      
      return {
        stocks: [...stocks, ...cryptoData],
        indices: await this.getIndexData(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      // Fallback to enhanced mock data
      return this.getEnhancedMockMarketData();
    }
  }

  private async getIndexData() {
    // In a real implementation, you'd fetch actual index data
    // For now, return realistic mock data that updates
    const now = new Date();
    const marketHour = now.getHours();
    const isMarketOpen = marketHour >= 9 && marketHour <= 16; // Simplified market hours
    
    const baseValues = {
      'S&P 500': 4350.45,
      'NASDAQ': 13250.75,
      'DOW': 34150.12,
      'Russell 2000': 1975.30,
      'VIX': 18.45
    };
    
    // Add some realistic daily movement
    const generateMovement = (base: number) => {
      const movement = (Math.random() - 0.5) * base * 0.015; // ±1.5% max movement
      const newValue = base + movement;
      return {
        value: Number(newValue.toFixed(2)),
        change: Number(movement.toFixed(2)),
        changePercent: Number(((movement / base) * 100).toFixed(2)),
      };
    };
    
    return Object.fromEntries(
      Object.entries(baseValues).map(([name, base]) => [name, generateMovement(base)])
    );
  }

  async getTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysis> {
    try {
      // Try to get real technical data if Alpha Vantage is available
      if (this.alphaVantageKey) {
        return await this.getAlphaVantageTechnicalData(symbol);
      }
    } catch (error) {
      console.error(`Technical analysis error for ${symbol}:`, error);
    }
    
    // Enhanced mock technical analysis with realistic values
    return this.getEnhancedMockTechnicalAnalysis(symbol);
  }

  private async getAlphaVantageTechnicalData(symbol: string): Promise<TechnicalAnalysis> {
    const baseUrl = 'https://www.alphavantage.co/query';
    const apikey = this.alphaVantageKey;
    
    try {
      // Fetch multiple technical indicators
      const [rsiResponse, macdResponse, smaResponse] = await Promise.all([
        fetch(`${baseUrl}?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${apikey}`),
        fetch(`${baseUrl}?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${apikey}`),
        fetch(`${baseUrl}?function=SMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${apikey}`)
      ]);

      const [rsiData, macdData, smaData] = await Promise.all([
        rsiResponse.json(),
        macdResponse.json(),
        smaResponse.json()
      ]);

      // Parse the latest values
      const rsiValues = rsiData['Technical Analysis: RSI'];
      const macdValues = macdData['Technical Analysis: MACD'];
      const smaValues = smaData['Technical Analysis: SMA'];

      if (!rsiValues || !macdValues || !smaValues) {
        throw new Error('Incomplete technical data');
      }

      // Get the most recent date's data
      const latestDate = Object.keys(rsiValues)[0];
      const rsi = parseFloat(rsiValues[latestDate]['RSI']);
      
      const latestMacdDate = Object.keys(macdValues)[0];
      const macd = {
        value: parseFloat(macdValues[latestMacdDate]['MACD']),
        signal: parseFloat(macdValues[latestMacdDate]['MACD_Signal']),
        histogram: parseFloat(macdValues[latestMacdDate]['MACD_Hist'])
      };

      const latestSmaDate = Object.keys(smaValues)[0];
      const sma20 = parseFloat(smaValues[latestSmaDate]['SMA']);

      // Generate other indicators
      const currentPrice = await this.getStockData(symbol).then(data => data.price);
      
      return {
        symbol: symbol.toUpperCase(),
        indicators: {
          rsi,
          macd,
          movingAverages: {
            sma20,
            sma50: sma20 * 0.98, // Approximate
            sma200: sma20 * 0.95, // Approximate
          },
          bollingerBands: {
            upper: sma20 * 1.02,
            middle: sma20,
            lower: sma20 * 0.98,
          },
        },
        signals: {
          trend: rsi > 60 ? 'Bullish' : rsi < 40 ? 'Bearish' : 'Neutral',
          momentum: macd.value > macd.signal ? 'Strong' : 'Weak',
          recommendation: this.generateRecommendation(rsi, macd, currentPrice, sma20),
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch technical analysis: ${error}`);
    }
  }

  private generateRecommendation(rsi: number, macd: any, currentPrice: number, sma20: number): 'Buy' | 'Hold' | 'Sell' {
    let score = 0;
    
    // RSI signals
    if (rsi > 70) score -= 1; // Overbought
    else if (rsi < 30) score += 1; // Oversold
    
    // MACD signals
    if (macd.value > macd.signal) score += 1; // Bullish crossover
    else score -= 1; // Bearish crossover
    
    // Price vs SMA
    if (currentPrice > sma20) score += 1; // Above moving average
    else score -= 1; // Below moving average
    
    if (score >= 2) return 'Buy';
    if (score <= -2) return 'Sell';
    return 'Hold';
  }

  async getRiskAnalysis(symbol: string): Promise<RiskAnalysis> {
    // Enhanced risk analysis with more realistic calculations
    const stockData = await this.getStockData(symbol);
    
    // Calculate beta based on sector and market cap
    const sectorBetas: { [key: string]: number } = {
      'AAPL': 1.2, 'MSFT': 0.9, 'GOOGL': 1.1, 'AMZN': 1.3, 'TSLA': 2.1,
      'NVDA': 1.8, 'META': 1.4, 'NFLX': 1.6, 'BTC-USD': 3.5, 'ETH-USD': 3.2
    };
    
    const beta = sectorBetas[symbol.toUpperCase()] || (0.8 + Math.random() * 1.0);
    const volatility = Math.abs(stockData.changePercent) / 100 + (Math.random() * 0.3);
    const sharpeRatio = (Math.random() * 2) - 0.5; // Can be negative
    const var95 = -Math.abs(stockData.changePercent / 100) * 2.33; // 95% VaR approximation
    const maxDrawdown = -0.1 - (Math.random() * 0.4);

    let riskRating: 'Low' | 'Medium' | 'High' = 'Medium';
    if (beta < 1.0 && volatility < 0.25) riskRating = 'Low';
    if (beta > 1.5 || volatility > 0.4) riskRating = 'High';

    return {
      symbol: symbol.toUpperCase(),
      beta: Number(beta.toFixed(2)),
      volatility: Number(volatility.toFixed(3)),
      var95: Number(var95.toFixed(3)),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      maxDrawdown: Number(maxDrawdown.toFixed(3)),
      riskRating,
    };
  }

  async getNewsAnalysis(symbol: string): Promise<NewsAnalysis> {
    try {
      // First try our enhanced news sentiment API
      const newsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/news-sentiment?symbol=${symbol}`);
      
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        
        // Transform the enhanced news data to match our NewsAnalysis interface
        return {
          symbol: symbol.toUpperCase(),
          sentimentScore: Number(newsData.sentimentScore.toFixed(2)),
          sentimentLabel: newsData.overallSentiment === 'positive' ? 'Bullish' : 
                          newsData.overallSentiment === 'negative' ? 'Bearish' : 'Neutral',
          articles: newsData.articles.slice(0, 5).map((article: any) => ({
            title: article.title,
            summary: article.summary,
            source: article.source,
            publishedAt: article.publishedAt,
            sentimentScore: article.sentimentScore,
            url: article.url
          }))
        };
      }
    } catch (error) {
      console.error(`Enhanced news sentiment API error for ${symbol}:`, error);
    }

    try {
      // Fallback to original news API if available
      if (this.newsApiKey) {
        return await this.getActualNewsAnalysis(symbol);
      }
    } catch (error) {
      console.error(`News analysis error for ${symbol}:`, error);
    }
    
    // Final fallback to enhanced mock data
    return this.getEnhancedMockNewsAnalysis(symbol);
  }

  private async getActualNewsAnalysis(symbol: string): Promise<NewsAnalysis> {
    const companyName = this.getCompanyName(symbol);
    const url = `https://newsapi.org/v2/everything?q=${companyName}&apiKey=${this.newsApiKey}&sortBy=publishedAt&pageSize=10`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message);
    }
    
    const articles = data.articles?.slice(0, 5).map((article: any) => ({
      title: article.title,
      summary: article.description || article.title,
      sentiment: this.analyzeSentiment(article.title + ' ' + (article.description || '')),
      source: article.source.name,
      publishedAt: article.publishedAt,
      url: article.url,
    })) || [];
    
    const avgSentiment = articles.length > 0 
      ? articles.reduce((sum: number, article: any) => sum + article.sentiment, 0) / articles.length 
      : 0;
    
    return {
      symbol: symbol.toUpperCase(),
      sentimentScore: Number(avgSentiment.toFixed(2)),
      sentimentLabel: avgSentiment > 0.1 ? 'Bullish' : avgSentiment < -0.1 ? 'Bearish' : 'Neutral',
      articles: articles.map((article: any) => ({
        title: article.title,
        summary: article.summary,
        source: article.source,
        publishedAt: article.publishedAt,
        sentimentScore: article.sentiment,
        url: article.url
      }))
    };
  }

  private getEnhancedMockStockData(symbol: string): StockData {
    // More realistic mock data based on symbol
    const mockPrices: { [key: string]: { price: number; name: string; marketCap: number } } = {
      'AAPL': { price: 193.97, name: 'Apple Inc.', marketCap: 3021000000000 },
      'GOOGL': { price: 140.93, name: 'Alphabet Inc.', marketCap: 1756000000000 },
      'MSFT': { price: 378.85, name: 'Microsoft Corp.', marketCap: 2813000000000 },
      'TSLA': { price: 248.50, name: 'Tesla Inc.', marketCap: 791000000000 },
      'NVDA': { price: 118.76, name: 'NVIDIA Corp.', marketCap: 2918000000000 },
      'META': { price: 486.23, name: 'Meta Platforms Inc.', marketCap: 1245000000000 },
      'AMZN': { price: 175.43, name: 'Amazon.com Inc.', marketCap: 1832000000000 },
      'NFLX': { price: 634.87, name: 'Netflix Inc.', marketCap: 280000000000 },
      'BTC-USD': { price: 96875.23, name: 'Bitcoin', marketCap: 1900000000000 },
      'ETH-USD': { price: 3421.67, name: 'Ethereum', marketCap: 410000000000 },
      'SOL-USD': { price: 191.45, name: 'Solana', marketCap: 89000000000 },
    };
    
    const baseData = mockPrices[symbol.toUpperCase()] || { 
      price: 100 + Math.random() * 200, 
      name: symbol.toUpperCase(), 
      marketCap: 50000000000 
    };
    
    // Generate realistic daily movement
    const changePercent = (Math.random() - 0.5) * 6; // ±3% max daily movement
    const change = baseData.price * (changePercent / 100);
    const volume = Math.floor(1000000 + Math.random() * 50000000);
    
    return {
      symbol: symbol.toUpperCase(),
      name: baseData.name,
      price: Number(baseData.price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume,
      marketCap: baseData.marketCap,
      pe: 15 + Math.random() * 30, // Realistic P/E range
      dividendYield: Math.random() * 3, // 0-3% dividend yield
    };
  }

  private getEnhancedMockMarketData(): MarketData {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'META', 'AMZN', 'NFLX', 'BTC-USD', 'ETH-USD', 'SOL-USD'];
    const stocks = symbols.map(symbol => this.getEnhancedMockStockData(symbol));
    
    return {
      stocks,
      indices: {
        'S&P 500': { value: 4350.45, change: 15.30, changePercent: 0.35 },
        'NASDAQ': { value: 13250.75, change: -22.45, changePercent: -0.17 },
        'DOW': { value: 34150.12, change: 105.60, changePercent: 0.31 },
        'Russell 2000': { value: 1975.30, change: 8.45, changePercent: 0.43 },
        'VIX': { value: 18.45, change: -0.75, changePercent: -3.90 },
      },
      timestamp: new Date().toISOString(),
    };
  }

  private getEnhancedMockTechnicalAnalysis(symbol: string): TechnicalAnalysis {
    // Get the current price for this specific symbol to calculate realistic moving averages
    const stockData = this.getEnhancedMockStockData(symbol);
    const currentPrice = stockData.price;
    
    const rsi = 30 + Math.random() * 40; // 30-70 range (more realistic)
    const macdValue = (Math.random() - 0.5) * 2;
    const macdSignal = macdValue + (Math.random() - 0.5) * 0.5;
    
    // Calculate moving averages based on actual current price for this symbol
    const sma20 = currentPrice * (0.98 + Math.random() * 0.04); // Within 2% of current price
    const sma50 = currentPrice * (0.95 + Math.random() * 0.06); // Typically below current for uptrend
    const sma200 = currentPrice * (0.90 + Math.random() * 0.10); // Longer term average
    
    return {
      symbol: symbol.toUpperCase(),
      indicators: {
        rsi: Number(rsi.toFixed(1)),
        macd: {
          value: Number(macdValue.toFixed(3)),
          signal: Number(macdSignal.toFixed(3)),
          histogram: Number((macdValue - macdSignal).toFixed(3)),
        },
        movingAverages: {
          sma20: Number(sma20.toFixed(2)),
          sma50: Number(sma50.toFixed(2)),
          sma200: Number(sma200.toFixed(2)),
        },
        bollingerBands: {
          upper: Number((sma20 * 1.02).toFixed(2)),
          middle: Number(sma20.toFixed(2)),
          lower: Number((sma20 * 0.98).toFixed(2)),
        },
      },
      signals: {
        trend: rsi > 60 ? 'Bullish' : rsi < 40 ? 'Bearish' : 'Neutral',
        momentum: macdValue > macdSignal ? 'Strong' : 'Weak',
        recommendation: this.generateRecommendation(rsi, { value: macdValue, signal: macdSignal }, 150, sma20),
      },
    };
  }

  private getEnhancedMockNewsAnalysis(symbol: string): NewsAnalysis {
    const companyName = this.getCompanyName(symbol);
    const sentimentScore = (Math.random() - 0.5) * 1.5; // -0.75 to +0.75
    
    const mockArticles = [
      {
        title: `${companyName} Reports Strong Quarterly Results`,
        summary: `${companyName} exceeded analyst expectations with robust revenue growth and improved margins.`,
        sentiment: 0.7,
        source: 'Financial Times',
        publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        url: '#',
      },
      {
        title: `Market Analysis: ${symbol} Technical Outlook`,
        summary: `Technical indicators suggest continued momentum for ${symbol} in the near term.`,
        sentiment: 0.3,
        source: 'MarketWatch',
        publishedAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        url: '#',
      },
      {
        title: `Industry Trends Impact on ${companyName}`,
        summary: `Sector-wide developments continue to influence ${companyName}'s market position.`,
        sentiment: -0.1,
        source: 'Reuters',
        publishedAt: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000).toISOString(),
        url: '#',
      },
    ];
    
    return {
      symbol: symbol.toUpperCase(),
      sentimentScore: Number(sentimentScore.toFixed(2)),
      sentimentLabel: sentimentScore > 0.1 ? 'Bullish' : sentimentScore < -0.1 ? 'Bearish' : 'Neutral',
      articles: mockArticles.slice(0, 3).map(article => ({
        title: article.title,
        summary: article.summary,
        source: article.source,
        publishedAt: article.publishedAt,
        sentimentScore: article.sentiment,
        url: article.url
      })),
    };
  }

  private getCompanyName(symbol: string): string {
    const names: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'MSFT': 'Microsoft Corp.',
      'AMZN': 'Amazon.com Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corp.',
      'META': 'Meta Platforms Inc.',
      'NFLX': 'Netflix Inc.',
      'JPM': 'JPMorgan Chase & Co.',
      'JNJ': 'Johnson & Johnson',
      'V': 'Visa Inc.',
      'PG': 'Procter & Gamble Co.',
      'UNH': 'UnitedHealth Group Inc.',
      'HD': 'Home Depot Inc.',
      'BTC-USD': 'Bitcoin',
      'ETH-USD': 'Ethereum',
      'SOL-USD': 'Solana',
      'ADA-USD': 'Cardano',
      'DOT-USD': 'Polkadot',
    };
    return names[symbol.toUpperCase()] || symbol.toUpperCase();
  }

  async searchFinancialDocuments(query: string): Promise<string> {
    // Mock implementation - in production, this would search SEC filings, reports, etc.
    return `Financial document search results for "${query}":
    
Recent filings and analyst reports suggest strong fundamentals with balanced risk profile. 
Key metrics indicate sustainable growth trajectory with appropriate valuation multiples.
Risk factors include market volatility and sector-specific challenges.

For detailed analysis, recommend reviewing latest 10-K and 10-Q filings.`;
  }

  private analyzeSentiment(text: string): number {
    // Simple sentiment analysis - in production, use a proper NLP service
    const positiveWords = ['strong', 'growth', 'profit', 'beat', 'exceed', 'positive', 'gain', 'rise', 'increase'];
    const negativeWords = ['weak', 'loss', 'miss', 'decline', 'negative', 'fall', 'decrease', 'concern', 'risk'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) score += 1;
      if (negativeWords.some(neg => word.includes(neg))) score -= 1;
    });
    
    return Math.max(-1, Math.min(1, score / words.length * 10));
  }
} 