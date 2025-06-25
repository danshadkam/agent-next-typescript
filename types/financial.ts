export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  dividendYield?: number;
}

export interface MarketData {
  stocks: StockData[];
  indices: {
    [key: string]: {
      value: number;
      change: number;
      changePercent: number;
    };
  };
  timestamp: string;
}

export interface RiskAnalysis {
  symbol: string;
  beta: number;
  volatility: number;
  var95: number; // Value at Risk 95%
  sharpeRatio: number;
  maxDrawdown: number;
  riskRating: 'Low' | 'Medium' | 'High';
}

export interface PortfolioAnalysis {
  totalValue: number;
  dailyChange: number;
  totalReturn: number;
  allocation: {
    [sector: string]: number;
  };
  topHoldings: {
    symbol: string;
    weight: number;
    value: number;
  }[];
  riskMetrics: {
    portfolioBeta: number;
    sharpeRatio: number;
    volatility: number;
  };
}

export interface NewsAnalysis {
  symbol: string;
  sentimentScore: number; // -1 to 1
  sentimentLabel: 'Bearish' | 'Neutral' | 'Bullish';
  articles: {
    title: string;
    summary: string;
    source: string;
    publishedAt: string;
    sentimentScore: number;
    url: string;
  }[];
}

export interface TechnicalAnalysis {
  symbol: string;
  indicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    movingAverages: {
      sma20: number;
      sma50: number;
      sma200: number;
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
    };
  };
  signals: {
    trend: 'Bullish' | 'Bearish' | 'Neutral';
    momentum: 'Strong' | 'Weak' | 'Neutral';
    recommendation: 'Buy' | 'Hold' | 'Sell';
  };
}

export interface FinancialAgent {
  id: string;
  name: string;
  type: 'market_data' | 'risk_analysis' | 'portfolio' | 'news_sentiment' | 'technical_analysis';
  description: string;
  tools: string[];
}

export interface AgentResponse {
  agentId: string;
  agentName: string;
  analysis: any;
  confidence: number;
  timestamp: string;
  sources?: string[];
}

export interface FinancialReport {
  requestId: string;
  query: string;
  timestamp: string;
  agentResponses: AgentResponse[];
  synthesis: string;
  recommendations: string[];
  riskWarnings: string[];
  charts?: {
    type: string;
    data: any;
  }[];
} 