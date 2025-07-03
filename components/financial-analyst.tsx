"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  Bitcoin,
  Send,
  Bot,
  User,
  Sparkles,
  Globe,
  Zap,
  AlertTriangle,
  Target,
  PieChart,
  Minimize2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Calendar,
  Shield
} from "lucide-react";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

interface QuickAction {
  label: string;
  query: string;
  icon: React.ReactNode;
  color: string;
}

// Simple Chart Placeholder Component
const ChartPlaceholder = ({ title }: { title: string }) => (
  <div className="h-40 bg-slate-800/50 rounded-lg flex items-center justify-center border border-slate-600">
    <div className="text-center">
      <BarChart3 className="w-8 h-8 text-[#00D4AA] mx-auto mb-2" />
      <div className="text-slate-400 text-sm">{title}</div>
    </div>
  </div>
);

// Enhanced Message Component for structured responses
const StructuredMessage = ({ content }: { content: string }) => {
  // Enhanced JSON parsing - hide raw JSON from user and extract technical data
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  let technicalData = null;
  let cleanTextContent = content;
  
  if (jsonMatch) {
    try {
      const parsedData = JSON.parse(jsonMatch[0]);
      // Remove JSON from display content
      cleanTextContent = content.replace(jsonMatch[0], '').trim();
      
      // Extract technical indicators data
      if (parsedData.symbol) {
        technicalData = parsedData;
      }
    } catch (e) {
      // JSON parsing failed, keep original content
    }
  }

  // Professional Technical Charts Renderer
  const renderTechnicalCharts = (data: any) => {
    if (!data || !data.indicators) return null;
    
    const indicators = data.indicators;
    
    return (
      <div className="mt-6 space-y-4">
        <div className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] rounded-lg p-4 border border-[#00D4AA]/20">
          <h4 className="text-[#00D4AA] font-bold text-lg mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Technical Analysis Dashboard
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* RSI Chart Placeholder */}
            {indicators.rsi && (
              <div className="bg-[#0B1426] rounded-lg p-4 border border-slate-600">
                <h5 className="text-white font-semibold mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-[#00D4AA]" />
                  RSI - Relative Strength Index
                </h5>
                <ChartPlaceholder title="RSI Chart" />
                <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 mt-4">
                  <span className="text-slate-400 text-sm">Current RSI:</span>
                  <span className={`font-bold text-lg ${indicators.rsi > 70 ? 'text-red-400' : indicators.rsi < 30 ? 'text-green-400' : 'text-[#00D4AA]'}`}>
                    {indicators.rsi.toFixed(1)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${indicators.rsi > 70 ? 'bg-red-900 text-red-200' : indicators.rsi < 30 ? 'bg-green-900 text-green-200' : 'bg-[#00D4AA]/20 text-[#00D4AA]'}`}>
                    {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                  </span>
                </div>
              </div>
            )}
            
            {/* MACD Chart Placeholder */}
            {indicators.macd && (
              <div className="bg-[#0B1426] rounded-lg p-4 border border-slate-600">
                <h5 className="text-white font-semibold mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-[#00D4AA]" />
                  MACD - Moving Average Convergence Divergence
                </h5>
                <ChartPlaceholder title="MACD Chart" />
                <div className="grid grid-cols-2 gap-4 bg-slate-800/50 rounded-lg p-3 mt-4">
                  <div className="text-center">
                    <div className="text-slate-400 text-xs">MACD</div>
                    <div className="text-[#00D4AA] font-bold">{indicators.macd.value.toFixed(3)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-xs">Signal</div>
                    <div className="text-yellow-400 font-bold">{indicators.macd.signal.toFixed(3)}</div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${indicators.macd.value > indicators.macd.signal ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                    {indicators.macd.value > indicators.macd.signal ? 'Bullish Signal' : 'Bearish Signal'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Technical Summary */}
          <div className="mt-6 bg-[#0B1426] rounded-lg p-4 border border-slate-600">
            <h5 className="text-white font-semibold mb-4 flex items-center">
              <Target className="w-4 h-4 mr-2 text-[#00D4AA]" />
              Technical Summary
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Trend</div>
                <div className="text-[#00D4AA] font-bold">
                  {data.trend || (indicators.rsi > 50 ? 'Bullish' : 'Bearish')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Momentum</div>
                <div className={`font-bold ${indicators.rsi > 70 ? 'text-red-400' : indicators.rsi < 30 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-slate-400 text-sm mb-1">Recommendation</div>
                <div className={`font-bold ${data.recommendation === 'BUY' ? 'text-green-400' : data.recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {data.recommendation || 'HOLD'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const parseContent = (text: string) => {
    const sections = text.split('\n\n');
    return sections.map((section, index) => {
      // Check for headers (lines starting with ##)
      if (section.startsWith('##')) {
        return (
          <h3 key={index} className="text-xl font-bold text-[#00D4AA] mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2" />
            {section.replace('##', '').trim()}
          </h3>
        );
      }
      
      // Check for bullet points
      if (section.includes('•') || section.includes('-')) {
        const items = section.split('\n').filter(line => line.trim().length > 0);
        return (
          <ul key={index} className="space-y-2 mb-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex items-start space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-[#00D4AA] rounded-full mt-2 flex-shrink-0"></div>
                <span>{item.replace(/^[•\-]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-slate-300 leading-relaxed mb-4">
          {section}
        </p>
      );
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-lg p-6 border border-slate-700 shadow-lg">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-[#00D4AA] font-semibold text-sm">AI Financial Analyst</span>
            <span className="text-slate-400 text-xs ml-2">Professional Analysis</span>
          </div>
          <div className="prose prose-invert max-w-none">
            {parseContent(cleanTextContent)}
          </div>
          {technicalData && renderTechnicalCharts(technicalData)}
        </div>
      </div>
    </div>
  );
};

export default function FinancialAnalyst() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: "/api/financial-agent",
    maxSteps: 15,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real market data from dedicated API
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        console.log('Fetching real-time market data...');
        
        const response = await fetch('/api/market-data', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log(`✅ Market data updated: ${result.message}`);
          setMarketData(result.data);
          setLastUpdate(new Date());
        } else {
          console.warn('⚠️ Using fallback data:', result.message);
          setMarketData(result.data || []);
          setLastUpdate(new Date());
        }
        
      } catch (error) {
        console.error('❌ Failed to fetch market data:', error);
        
        // Enhanced fallback data if API completely fails
        const fallbackData: MarketData[] = [
          { symbol: "AAPL", name: "Apple Inc.", price: 193.97, change: 2.34, changePercent: 1.22, volume: 52476834 },
          { symbol: "GOOGL", name: "Alphabet Inc.", price: 140.93, change: -1.47, changePercent: -1.03, volume: 28394756 },
          { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: 4.23, changePercent: 1.13, volume: 23847563 },
          { symbol: "AMZN", name: "Amazon.com Inc.", price: 155.80, change: -2.15, changePercent: -1.36, volume: 31248765 },
          { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -3.22, changePercent: -1.28, volume: 89374625 },
          { symbol: "NVDA", name: "NVIDIA Corp.", price: 118.76, change: 1.88, changePercent: 1.61, volume: 67492837 },
          { symbol: "META", name: "Meta Platforms Inc.", price: 563.20, change: 8.45, changePercent: 1.52, volume: 18594736 },
          { symbol: "NFLX", name: "Netflix Inc.", price: 695.40, change: -5.60, changePercent: -0.80, volume: 12847365 },
          { symbol: "BTC-USD", name: "Bitcoin", price: 97200, change: 1450, changePercent: 1.51, volume: 28493756 },
          { symbol: "ETH-USD", name: "Ethereum", price: 3445, change: -25, changePercent: -0.72, volume: 15384927 },
          { symbol: "SOL-USD", name: "Solana", price: 192, change: 9.2, changePercent: 5.02, volume: 4857392 }
        ];
        setMarketData(fallbackData);
        setLastUpdate(new Date());
      }
    };

    // Initial fetch
    fetchMarketData();
    
    // Set up periodic updates (every 60 seconds)
    const interval = setInterval(fetchMarketData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const quickActions: QuickAction[] = [
    {
      label: "Technical Analysis",
      query: "Provide comprehensive technical analysis for AAPL including RSI, MACD, moving averages, and trading signals with charts",
      icon: <BarChart3 className="w-5 h-5" />,
      color: "bg-blue-500"
    },
    {
      label: "Bitcoin Analysis",
      query: "Analyze Bitcoin with technical indicators, market sentiment, support/resistance levels, and price predictions",
      icon: <Bitcoin className="w-5 h-5" />,
      color: "bg-orange-500"
    },
    {
      label: "Market Overview",
      query: "Comprehensive market summary with indices performance, sector analysis, top movers, and market sentiment",
      icon: <Globe className="w-5 h-5" />,
      color: "bg-green-500"
    },
    {
      label: "Risk Analysis",
      query: "Perform risk analysis for tech stocks including volatility, beta, VaR, and portfolio recommendations",
      icon: <Shield className="w-5 h-5" />,
      color: "bg-purple-500"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickAction = (query: string) => {
    append({ content: query, role: "user" });
  };

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
    const query = `Analyze ${symbol} - provide comprehensive technical analysis with indicators, price targets, and trading recommendations`;
    append({ content: query, role: "user" });
  };

  const MarketCard = ({ data }: { data: MarketData }) => {
    const isPositive = data.change >= 0;
    const isCrypto = data.symbol.includes("-USD");
    
    return (
      <div 
        className={`bg-[#1E293B] rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-[#334155] border border-slate-700 hover:border-slate-600 ${selectedSymbol === data.symbol ? 'ring-2 ring-[#00D4AA]' : ''}`}
        onClick={() => handleSymbolSelect(data.symbol)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isCrypto ? (
              <Bitcoin className="w-4 h-4 text-orange-400" />
            ) : (
              <BarChart3 className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-white font-semibold text-sm">{data.symbol}</span>
          </div>
          <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="text-xs font-medium">{isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-lg font-bold text-white">${data.price.toFixed(2)}</div>
          <div className="text-xs text-slate-400 truncate">{data.name}</div>
        </div>
      </div>
    );
  };

  const MarketSummaryWidget = () => {
    const gainers = marketData.filter(item => item.changePercent > 0).length;
    const losers = marketData.filter(item => item.changePercent < 0).length;
    
    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Market Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Gainers</span>
            <span className="text-green-400 font-medium">{gainers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Losers</span>
            <span className="text-red-400 font-medium">{losers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Last Update</span>
            <span className="text-slate-300 text-sm">{lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const TopMoversWidget = () => {
    if (marketData.length === 0) {
      return (
        <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-[#00D4AA]" />
            Top Movers
          </h3>
          <div className="text-slate-400 text-sm text-center py-4">
            Loading market data...
          </div>
        </div>
      );
    }

    const topGainer = marketData.reduce((prev, current) => 
      (prev.changePercent > current.changePercent) ? prev : current
    );
    const topLoser = marketData.reduce((prev, current) => 
      (prev.changePercent < current.changePercent) ? prev : current
    );

    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Top Movers
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-400 font-medium">{topGainer.symbol}</div>
              <div className="text-slate-400 text-sm">Top Gainer</div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-medium">+{topGainer.changePercent.toFixed(2)}%</div>
              <div className="text-slate-300 text-sm">${topGainer.price.toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-red-400 font-medium">{topLoser.symbol}</div>
              <div className="text-slate-400 text-sm">Top Loser</div>
            </div>
            <div className="text-right">
              <div className="text-red-400 font-medium">{topLoser.changePercent.toFixed(2)}%</div>
              <div className="text-slate-300 text-sm">${topLoser.price.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Portfolio Performance Widget (Mock)
  const PortfolioWidget = () => {
    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Portfolio Mix
        </h3>
        <div className="h-32">
          <ChartPlaceholder title="Portfolio Chart" />
        </div>
      </div>
    );
  };

  // Market Sentiment Widget
  const MarketSentimentWidget = () => {
    const sentiment = {
      bullish: 67,
      bearish: 33,
      fearGreed: 74
    };

    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Market Sentiment
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-400">Bullish vs Bearish</span>
              <span className="text-[#00D4AA]">{sentiment.bullish}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#00D4AA] to-green-400 h-2 rounded-full"
                style={{ width: `${sentiment.bullish}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Fear & Greed Index</span>
              <span className="text-yellow-400 font-semibold">{sentiment.fearGreed}</span>
            </div>
            <div className="text-center">
              <span className="px-2 py-1 bg-yellow-900 text-yellow-200 rounded text-xs font-medium">
                Greedy
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Crypto Tracker Widget
  const CryptoTrackerWidget = () => {
    const cryptoData = marketData.filter(item => item.symbol.includes('-USD')).slice(0, 3);

    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Bitcoin className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Crypto Watch
        </h3>
        <div className="space-y-3">
          {cryptoData.map((crypto) => (
            <div key={crypto.symbol} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {crypto.symbol.split('-')[0].charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white text-sm font-medium">
                    {crypto.symbol.split('-')[0]}
                  </div>
                  <div className="text-slate-400 text-xs">${crypto.price.toLocaleString()}</div>
                </div>
              </div>
              <div className={`text-sm font-medium ${crypto.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {crypto.changePercent >= 0 ? '+' : ''}{crypto.changePercent.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Economic Calendar Widget
  const EconomicCalendarWidget = () => {
    const events = [
      { time: '14:30', event: 'Fed Rate Decision', impact: 'high' },
      { time: '15:00', event: 'GDP Report', impact: 'medium' },
      { time: '16:30', event: 'Jobless Claims', impact: 'low' }
    ];

    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Economic Calendar
        </h3>
        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="flex items-center space-x-3 py-2">
              <div className="text-[#00D4AA] text-xs font-mono">{event.time}</div>
              <div className="flex-1">
                <div className="text-white text-sm">{event.event}</div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                event.impact === 'high' ? 'bg-red-400' : 
                event.impact === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Quick Analysis Widget
  const QuickAnalysisWidget = () => {
    const tools = [
      { name: 'Options Flow', icon: TrendingUp },
      { name: 'Insider Trading', icon: User },
      { name: 'Earnings Calendar', icon: Calendar },
      { name: 'Sector Analysis', icon: BarChart3 }
    ];

    return (
      <div className="bg-[#1E293B] rounded-lg p-4 border border-slate-700">
        <h3 className="text-white font-semibold mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-[#00D4AA]" />
          Quick Analysis
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool, index) => (
            <button
              key={index}
              className="bg-[#0F172A] hover:bg-slate-700 border border-slate-600 rounded-lg p-3 text-left transition-all duration-200 hover:border-[#00D4AA]/50 group"
            >
              <div className="flex items-center space-x-2 mb-1">
                <div className="text-[#00D4AA] group-hover:scale-110 transition-transform">
                  <tool.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-white text-xs font-medium">{tool.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const selectedStock = marketData.find(d => d.symbol === selectedSymbol);

  return (
    <div className="min-h-screen bg-[#0B1426] text-white">
      {/* Header */}
      <header className="bg-[#1E293B] border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">Financial Analyst</h1>
            </div>
            <div className="flex items-center space-x-1 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Market Data</span>
              <Clock className="w-3 h-3 ml-2" />
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks, crypto..."
                className="bg-[#0F172A] border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D4AA] w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-81px)]">
        {/* Left Sidebar */}
        <div className="w-80 bg-[#1E293B] border-r border-slate-700 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Watchlist */}
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Watchlist</span>
              </h2>
              <div className="space-y-3">
                {marketData.slice(0, 8).map((stock) => (
                  <MarketCard key={stock.symbol} data={stock} />
                ))}
              </div>
            </div>

            {/* Financial Widgets */}
            <MarketSummaryWidget />
            <TopMoversWidget />
            <PortfolioWidget />
            <MarketSentimentWidget />
            <CryptoTrackerWidget />
            <EconomicCalendarWidget />
            <QuickAnalysisWidget />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Stock Chart Section */}
          <div className="bg-[#0F172A] border-b border-slate-700 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-2xl font-bold text-white">{selectedSymbol}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-white">${selectedStock?.price.toFixed(2) || '0.00'}</span>
                    <div className={`flex items-center space-x-1 ${(selectedStock?.changePercent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(selectedStock?.changePercent || 0) >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      <span className="font-semibold">
                        {(selectedStock?.changePercent || 0) >= 0 ? '+' : ''}{(selectedStock?.changePercent || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-sm">Vol: {selectedStock?.volume.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-sm">1D</span>
                    <div className="w-2 h-2 bg-[#00D4AA] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="h-80">
              <ChartPlaceholder title="Price Chart - Chart.js will load here once fully tested" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1E293B] p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3 overflow-x-auto">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.query)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 whitespace-nowrap ${action.color}`}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className={`flex-1 flex flex-col bg-[#0F172A] transition-all duration-300 ${chatMinimized ? 'h-20' : ''}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-[#00D4AA]" />
                <span className="font-semibold text-white">AI Financial Analyst</span>
                <div className="w-2 h-2 bg-[#00D4AA] rounded-full animate-pulse"></div>
              </div>
              <button
                onClick={() => setChatMinimized(!chatMinimized)}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {!chatMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-[#00D4AA] mx-auto mb-4" />
                      <h3 className="text-white text-lg font-semibold mb-2">Professional AI Financial Analyst</h3>
                      <p className="text-slate-400 mb-6">Get structured analysis with charts, technical indicators, and professional insights</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickAction(action.query)}
                            className="px-3 py-1 bg-[#1E293B] text-slate-300 rounded-lg text-sm hover:bg-[#334155] transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === "user" ? (
                        <div className="flex items-start space-x-3 justify-end">
                          <div className="bg-[#00D4AA] rounded-lg p-4 max-w-xl">
                            <p className="text-white">{message.content}</p>
                          </div>
                          <div className="w-8 h-8 bg-[#334155] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <StructuredMessage content={message.content} />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-700">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (input.trim()) {
                        append({ content: input, role: "user" });
                        setInput("");
                      }
                    }}
                    className="flex space-x-3"
                  >
                    <input
                      placeholder="Ask about any stock, crypto, technical analysis, or market insights..."
                      className="flex-1 bg-[#1E293B] border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D4AA]"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-[#00D4AA] hover:bg-[#00B4D8] disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg px-6 py-3 text-white font-medium transition-colors flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 