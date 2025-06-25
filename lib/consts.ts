export const loadingMessages = [
  "Thinking",
  "Analyzing sources",
  "Searching knowledge base",
  "Processing your request",
  "Crafting response",
  "Consulting the archives",
  "Gathering insights",
  "Connecting the dots",
  "Diving deep",
  "Synthesizing information",
  "Contemplating",
  "Researching",
  "Formulating answer",
  "Accessing memory banks",
  "Computing response",
];

// Financial-specific loading messages
export const financialLoadingMessages = [
  "Analyzing market data",
  "Calculating risk metrics",
  "Processing financial indicators",
  "Gathering market intelligence",
  "Running technical analysis",
  "Evaluating portfolio performance",
  "Assessing market volatility",
  "Reviewing financial statements",
  "Checking news sentiment",
  "Computing correlation matrices",
  "Analyzing trading patterns",
  "Evaluating economic indicators",
  "Synthesizing financial insights",
  "Consulting market experts",
  "Generating investment thesis",
];

// Financial agent configurations
export const financialAgents = [
  {
    id: 'market_data',
    name: 'Market Data Agent',
    description: 'Provides real-time stock prices, market indices, and trading information',
    tools: ['getMarketData', 'getStockData', 'getMultipleStocks'],
    color: 'blue',
  },
  {
    id: 'risk_analysis',
    name: 'Risk Analysis Agent',
    description: 'Calculates risk metrics including Beta, VaR, Sharpe ratio, and volatility',
    tools: ['analyzeRisk', 'calculatePortfolioMetrics'],
    color: 'yellow',
  },
  {
    id: 'technical_analysis',
    name: 'Technical Analysis Agent',
    description: 'Provides technical indicators, chart patterns, and trading signals',
    tools: ['getTechnicalAnalysis'],
    color: 'green',
  },
  {
    id: 'news_sentiment',
    name: 'News Sentiment Agent',
    description: 'Analyzes financial news and sentiment for informed decision making',
    tools: ['getNewsAnalysis'],
    color: 'orange',
  },
  {
    id: 'document_retrieval',
    name: 'Document Retrieval Agent',
    description: 'Searches through financial documents, SEC filings, and analyst reports',
    tools: ['searchFinancialDocuments'],
    color: 'purple',
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Analysis Agent',
    description: 'Orchestrates multiple agents for complete financial analysis',
    tools: ['performComprehensiveAnalysis'],
    color: 'indigo',
  },
];

// Common financial symbols for quick access
export const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust' },
];

// Market indices
export const marketIndices = [
  { symbol: 'SPX', name: 'S&P 500 Index' },
  { symbol: 'IXIC', name: 'NASDAQ Composite' },
  { symbol: 'DJI', name: 'Dow Jones Industrial Average' },
  { symbol: 'RUT', name: 'Russell 2000 Index' },
  { symbol: 'VIX', name: 'CBOE Volatility Index' },
];

// Risk categories
export const riskCategories = {
  low: { label: 'Low Risk', color: 'green', range: [0, 0.8] },
  medium: { label: 'Medium Risk', color: 'yellow', range: [0.8, 1.3] },
  high: { label: 'High Risk', color: 'red', range: [1.3, Infinity] },
};

// Technical indicator thresholds
export const technicalThresholds = {
  rsi: {
    oversold: 30,
    overbought: 70,
  },
  macd: {
    bullish: 0,
    bearish: 0,
  },
  momentum: {
    strong: 70,
    weak: 30,
  },
};
