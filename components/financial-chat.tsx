"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, AlertTriangle, Newspaper, Target, Activity, PieChart, Zap, Star, ThumbsUp, ThumbsDown, Gauge, Minus, Info } from "lucide-react";

interface FinancialMetric {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  pe?: number;
  dividendYield?: number;
  marketCap?: number;
}

export default function FinancialChat() {
  const { messages, input, setInput, append, isLoading } = useChat({
    api: "/api/financial-agent",
    maxSteps: 15,
  });

  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'stock' | 'portfolio' | 'market'>('stock');

  const parseFinancialData = (content: string) => {
    try {
      // Try to extract JSON data from the message
      const jsonMatches = content.match(/\{[\s\S]*?\}(?=\s|$)/g);
      if (jsonMatches) {
        // Parse the last (most complete) JSON object
        const lastMatch = jsonMatches[jsonMatches.length - 1];
        return JSON.parse(lastMatch);
      }
    } catch (e) {
      // If parsing fails, return null
    }
    return null;
  };

  const formatResponseContent = (content: string) => {
    // Remove JSON blocks from the display content
    const cleanContent = content.replace(/\{[\s\S]*?\}(?=\s|$)/g, '').trim();
    
    // Format the content with better structure
    return cleanContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n\n');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

    const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <button
        onClick={() => append({ content: "Get current market overview with comprehensive analysis", role: "user" })}
        className="group relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <BarChart3 className="w-6 h-6" />
          </div>
          <span className="font-semibold">📊 Market Overview</span>
          <span className="text-xs text-blue-100">Live market data & indices</span>
        </div>
      </button>
      
      <button
        onClick={() => append({ content: "Perform comprehensive analysis of AAPL with technical indicators and risk metrics", role: "user" })}
        className="group relative p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <Target className="w-6 h-6" />
          </div>
          <span className="font-semibold">🎯 Stock Analysis</span>
          <span className="text-xs text-green-100">Deep dive into any stock</span>
        </div>
      </button>
      
      <button
        onClick={() => append({ content: "Calculate portfolio metrics and risk analysis for AAPL, GOOGL, MSFT with equal weights", role: "user" })}
        className="group relative p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <PieChart className="w-6 h-6" />
          </div>
          <span className="font-semibold">💼 Portfolio</span>
          <span className="text-xs text-purple-100">Risk & allocation analysis</span>
        </div>
      </button>
      
      <button
        onClick={() => append({ content: "Get latest news sentiment analysis for TSLA with market impact", role: "user" })}
        className="group relative p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <Newspaper className="w-6 h-6" />
          </div>
          <span className="font-semibold">📰 News Analysis</span>
          <span className="text-xs text-orange-100">Sentiment & market impact</span>
        </div>
      </button>
    </div>
  );

  const ProgressBar = ({ value, max, color = "blue" }: { value: number; max: number; color?: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500", 
      red: "bg-red-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500"
    };
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const InteractiveChart = ({ data, title, color = "green", trend }: { 
    data: number[]; 
    title: string; 
    color?: "green" | "red" | "blue"; 
    trend?: "up" | "down" | "flat" 
  }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const isPositive = trend === "up" || (data[data.length - 1] > data[0]);
    
    // Create SVG path for smooth line
    const createPath = () => {
      const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / (max - min)) * 100;
        return `${x},${y}`;
      });
      return `M ${points.join(' L ')}`;
    };

    const chartColor = isPositive ? "rgb(0, 200, 83)" : "rgb(255, 80, 0)";
    const bgColor = isPositive ? "rgba(0, 200, 83, 0.1)" : "rgba(255, 80, 0, 0.1)";

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-500'
          }`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(((data[data.length - 1] / data[0]) - 1) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="relative h-24 mb-2">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartColor} stopOpacity="0.3"/>
                <stop offset="100%" stopColor={chartColor} stopOpacity="0.05"/>
              </linearGradient>
            </defs>
            <path
              d={`${createPath()} L 100,100 L 0,100 Z`}
              fill={`url(#gradient-${title})`}
            />
            <path
              d={createPath()}
              fill="none"
              stroke={chartColor}
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>1D</span>
          <span>1W</span>
          <span>1M</span>
          <span>3M</span>
          <span>1Y</span>
        </div>
      </div>
    );
  };

  const PerformanceCard = ({ symbol, price, change, changePercent, marketCap }: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap?: number;
  }) => {
    const isPositive = change >= 0;
    const mockChartData = Array.from({ length: 20 }, (_, i) => price * (1 + (Math.random() - 0.5) * 0.1));
    
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-lg text-gray-900">{symbol}</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(price)}</p>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{formatCurrency(change)}
              </div>
              <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                ({formatPercent(changePercent)})
              </div>
            </div>
          </div>
          
          <InteractiveChart 
            data={mockChartData} 
            title="" 
            trend={isPositive ? "up" : "down"}
          />
          
          {marketCap && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-medium">{formatCurrency(marketCap)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const StockCard = ({ stock }: { stock: StockData }) => (
    <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-600">{stock.name}</p>
        </div>
        <div className={`p-2 rounded-full ${stock.change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
          {getTrendIcon(stock.change)}
        </div>
      </div>
      
      <div className="space-y-3">
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(stock.price)}</p>
        
        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            stock.changePercent >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {formatPercent(stock.changePercent)}
          </span>
        </div>
        
        {stock.volume && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Volume</span>
              <span className="font-semibold">{(stock.volume / 1000000).toFixed(1)}M</span>
            </div>
            <ProgressBar value={stock.volume} max={10000000} color="blue" />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          {stock.pe && (
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-600">P/E Ratio</p>
              <p className="font-semibold text-gray-900">{stock.pe.toFixed(1)}</p>
            </div>
          )}
          {stock.dividendYield && (
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-gray-600">Dividend</p>
              <p className="font-semibold text-gray-900">{stock.dividendYield.toFixed(2)}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const GaugeChart = ({ value, max, label, color = "green" }: { value: number; max: number; label: string; color?: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const angle = (percentage / 100) * 180;
    
    const colorClasses = {
      green: "text-green-600",
      red: "text-red-600", 
      yellow: "text-yellow-600",
      blue: "text-blue-600"
    };
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-20 h-10 mb-2">
          <div className="absolute inset-0 bg-gray-200 rounded-t-full"></div>
          <div 
            className={`absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-t-full`}
            style={{ 
              clipPath: `polygon(50% 100%, 0 100%, 0 0, ${50 + (angle/180) * 50}% ${100 - (angle/180) * 100}%, 50% 100%)`
            }}
          ></div>
          <div className="absolute inset-2 bg-white rounded-t-full"></div>
          <div className={`absolute bottom-0 left-1/2 w-1 h-8 ${colorClasses[color as keyof typeof colorClasses]} transform -translate-x-1/2 origin-bottom`}
               style={{ transform: `translateX(-50%) rotate(${angle - 90}deg)` }}>
          </div>
        </div>
        <p className="text-xs text-gray-600 text-center">{label}</p>
        <p className={`font-semibold ${colorClasses[color as keyof typeof colorClasses]}`}>{value.toFixed(1)}</p>
      </div>
    );
  };

  const TechnicalAnalysisDisplay = ({ data }: { data: any }) => {
    if (!data.indicators) return null;
    
    return (
      <div className="my-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              Technical Analysis
            </h3>
            <div className="text-sm text-gray-500">
              Real-time indicators
            </div>
          </div>
          <p className="text-gray-600">Advanced technical indicators and trading signals</p>
        </div>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* RSI Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">RSI</h4>
              <div className={`w-3 h-3 rounded-full ${
                data.indicators.rsi > 70 ? 'bg-red-500' : 
                data.indicators.rsi < 30 ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {data.indicators.rsi?.toFixed(1) || '50.0'}
              </div>
              <div className="text-sm text-gray-500">Relative Strength</div>
            </div>
            
            {/* RSI Progress Bar */}
            <div className="relative h-2 bg-gray-100 rounded-full mb-4">
              <div 
                className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                  data.indicators.rsi > 70 ? 'bg-red-500' : 
                  data.indicators.rsi < 30 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${(data.indicators.rsi || 50)}%` }}
              ></div>
            </div>
            
            <div className={`text-center text-sm font-medium ${
              data.indicators.rsi > 70 ? 'text-red-600' : 
              data.indicators.rsi < 30 ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {data.indicators.rsi > 70 ? 'Overbought' : 
               data.indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
            </div>
          </div>
          
          {/* MACD Signal Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">MACD</h4>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                data.indicators.macdSignal === 'BUY' ? 'bg-green-100 text-green-700' :
                data.indicators.macdSignal === 'SELL' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {data.indicators.macdSignal || 'HOLD'}
              </div>
            </div>
            
            <div className="flex items-center justify-center py-6">
              {data.indicators.macdSignal === 'BUY' ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-sm font-medium text-green-600">Bullish Signal</div>
                </div>
              ) : data.indicators.macdSignal === 'SELL' ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <TrendingDown className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-sm font-medium text-red-500">Bearish Signal</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Minus className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-sm font-medium text-gray-500">No Clear Signal</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Moving Averages Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Moving Averages</h4>
              <div className={`w-3 h-3 rounded-full ${
                data.indicators.movingAverages?.sma20 > data.indicators.movingAverages?.sma50 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'MA20', value: data.indicators.movingAverages?.sma20, color: 'bg-blue-500' },
                { label: 'MA50', value: data.indicators.movingAverages?.sma50, color: 'bg-orange-500' },
                { label: 'MA200', value: data.indicators.movingAverages?.sma200, color: 'bg-purple-500' }
              ].map((ma, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${ma.color}`}></div>
                    <span className="text-sm text-gray-600">{ma.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    ${ma.value ? ma.value.toFixed(2) : 'N/A'}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <span className={`text-sm font-medium ${
                data.indicators.movingAverages?.sma20 > data.indicators.movingAverages?.sma50 ? 'text-green-600' : 'text-red-500'
              }`}>
                {data.indicators.movingAverages?.sma20 > data.indicators.movingAverages?.sma50 ? 'Bullish Trend' : 'Bearish Trend'}
              </span>
            </div>
          </div>
          
          {/* Volume Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">Volume</h4>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {data.indicators.volume ? `${(data.indicators.volume / 1000000).toFixed(1)}M` : '2.5M'}
              </div>
              <div className="text-sm text-gray-500">Daily Volume</div>
            </div>
            
            <div className="space-y-2">
              <div className="h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(((data.indicators.volume || 2500000) / 5000000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-center text-gray-500">
                {(data.indicators.volume || 2500000) > 2000000 ? 'High Activity' : 'Normal Activity'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h4 className="font-bold text-gray-900 mb-4">Price Movement</h4>
          <InteractiveChart 
            data={Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i * 0.2) * 10 + (Math.random() - 0.5) * 5)}
            title=""
            trend={data.indicators.macdSignal === 'BUY' ? "up" : data.indicators.macdSignal === 'SELL' ? "down" : "flat"}
          />
        </div>
        
        {/* Summary Insight Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Trading Insight</h4>
              <div className="bg-white rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {data.indicators.rsi > 70 
                    ? "⚠️ RSI indicates potential overbought conditions. Consider profit-taking opportunities or wait for pullback before adding positions."
                    : data.indicators.rsi < 30 
                    ? "💰 RSI suggests oversold conditions, which may present a buying opportunity for value-oriented investors."
                    : "✅ Technical indicators show balanced conditions. Monitor volume and trend confirmation for entry/exit signals."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const NewsAnalysisDisplay = ({ data }: { data: any }) => {
    if (!data.sentimentLabel) return null;
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">News Sentiment Analysis</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-blue-700">Sentiment</p>
            <p className={`font-semibold ${
              data.sentimentLabel === 'Bullish' ? 'text-green-600' :
              data.sentimentLabel === 'Bearish' ? 'text-red-600' : 'text-gray-600'
            }`}>{data.sentimentLabel}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Score</p>
            <p className="font-semibold text-blue-900">{data.sentimentScore?.toFixed(2) || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Articles</p>
            <p className="font-semibold text-blue-900">{data.articles?.length || 0}</p>
          </div>
        </div>
        {data.articles && data.articles.slice(0, 2).map((article: any, index: number) => (
          <div key={index} className="bg-white rounded p-3 mb-2 border">
            <h4 className="font-medium text-gray-900 text-sm mb-1">{article.title}</h4>
            <p className="text-xs text-gray-600 mb-1">{article.source} • {new Date(article.publishedAt).toLocaleDateString()}</p>
            <p className="text-sm text-gray-700">{article.summary}</p>
          </div>
        ))}
      </div>
    );
  };

  const PortfolioDashboard = ({ stocks }: { stocks: StockData[] }) => {
    const totalValue = stocks.reduce((sum, stock) => sum + stock.price, 0);
    const totalChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
    const totalChangePercent = (totalChange / (totalValue - totalChange)) * 100;
    const isPositive = totalChange >= 0;

    return (
      <div className="space-y-4">
        {/* Portfolio Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Portfolio Performance</h2>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <div className={`text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(totalChange)} ({formatPercent(totalChangePercent)})
              </div>
            </div>
          </div>
          
          {/* Performance Chart */}
          <div className="h-32 bg-black/20 rounded-lg p-4">
            <InteractiveChart 
              data={Array.from({ length: 30 }, (_, i) => totalValue * (1 + (Math.random() - 0.48) * 0.1))}
              title=""
              trend={isPositive ? "up" : "down"}
            />
          </div>
        </div>

        {/* Individual Stocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stocks.map((stock: StockData, index: number) => (
            <PerformanceCard key={index} {...stock} />
          ))}
        </div>

        {/* Performance Summary Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Today's Movers</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stocks
              .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
              .slice(0, 5)
              .map((stock, index) => (
                <div key={index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      stock.change >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {stock.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{stock.symbol}</div>
                      <div className="text-sm text-gray-600">{stock.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">{formatCurrency(stock.price)}</div>
                    <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  const ComparisonTable = ({ stocks }: { stocks: StockData[] }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Stock Comparison
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Volume</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">P/E</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stocks.map((stock, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                      stock.change >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {stock.symbol.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-900">
                  {formatCurrency(stock.price)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className={`${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    <div className="font-semibold">{stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}</div>
                    <div className="text-sm">({formatPercent(stock.changePercent)})</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {stock.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right text-gray-900">
                  {stock.pe ? stock.pe.toFixed(1) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const FinancialDataDisplay = ({ data }: { data: any }) => {
    if (!data) return null;

    // Market Data Display with Modern UI
    if (data.stocks && Array.isArray(data.stocks)) {
              return (
          <div className="my-6 space-y-6">
            <PortfolioDashboard stocks={data.stocks} />
            <ComparisonTable stocks={data.stocks} />
          </div>
        );
    }

    // Individual Stock Display
    if (data.symbol && data.price) {
      return (
        <div className="my-4">
          <StockCard stock={data} />
        </div>
      );
    }

    // Risk Analysis Display
    if (data.riskRating || data.beta || data.volatility) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Risk Analysis - {data.symbol}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.beta && (
              <div>
                <p className="text-sm text-yellow-700">Beta</p>
                <p className="font-semibold text-yellow-900">{data.beta.toFixed(2)}</p>
                <p className="text-xs text-yellow-600">vs Market</p>
              </div>
            )}
            {data.volatility && (
              <div>
                <p className="text-sm text-yellow-700">Volatility</p>
                <p className="font-semibold text-yellow-900">{(data.volatility * 100).toFixed(1)}%</p>
                <p className="text-xs text-yellow-600">Annual</p>
              </div>
            )}
            {data.sharpeRatio && (
              <div>
                <p className="text-sm text-yellow-700">Sharpe Ratio</p>
                <p className="font-semibold text-yellow-900">{data.sharpeRatio.toFixed(2)}</p>
                <p className="text-xs text-yellow-600">Risk-Adjusted</p>
              </div>
            )}
            {data.riskRating && (
              <div>
                <p className="text-sm text-yellow-700">Risk Rating</p>
                <p className={`font-semibold ${
                  data.riskRating === 'Low' ? 'text-green-600' :
                  data.riskRating === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>{data.riskRating}</p>
                <p className="text-xs text-yellow-600">Overall</p>
              </div>
            )}
          </div>
          {data.var95 && (
            <div className="mt-3 p-2 bg-white rounded border">
              <span className="text-sm text-yellow-700">Value at Risk (95%): </span>
              <span className="font-semibold text-red-600">{(data.var95 * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      );
    }

    // Technical Analysis Display
    if (data.indicators) {
      return <TechnicalAnalysisDisplay data={data} />;
    }

    // News Analysis Display
    if (data.sentimentLabel) {
      return <NewsAnalysisDisplay data={data} />;
    }

    // Comprehensive Analysis Display
    if (data.primaryStock || data.riskMetrics || data.technicalIndicators) {
      return (
        <div className="space-y-4 my-4">
          {data.primaryStock && <StockCard stock={data.primaryStock} />}
          {data.riskMetrics && <FinancialDataDisplay data={data.riskMetrics} />}
          {data.technicalIndicators && <TechnicalAnalysisDisplay data={data.technicalIndicators} />}
          {data.sentimentAnalysis && <NewsAnalysisDisplay data={data.sentimentAnalysis} />}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-7xl mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Zap className="w-8 h-8" />
              </div>
              🚀 Financial Analyst AI
            </h1>
            <p className="text-blue-100">Multi-agent financial analysis with real-time data and insights</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">6</div>
              <div className="text-xs text-blue-200">AI Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-xs text-blue-200">Real-time Data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-white border-b">
        <QuickActions />
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Financial Analyst AI</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Ask me about stocks, market analysis, portfolio optimization, risk assessment, or financial news. 
              I'll use multiple specialized agents to provide comprehensive insights.
            </p>
            <div className="text-sm text-gray-400">
              Try: "Analyze AAPL stock" or "What's the market overview today?"
            </div>
          </div>
        )}
        
        {messages.map((message, index) => {
          const financialData = parseFinancialData(message.content);
          
          return (
            <div
              key={index}
              className={`rounded-lg p-4 max-w-4xl ${
                message.role === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-white border shadow-sm mr-auto"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  message.role === "user" 
                    ? "bg-blue-600 text-blue-100" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  {message.role === "user" ? "U" : "AI"}
                </div>
                <span className="text-sm font-medium capitalize">
                  {message.role === "user" ? "You" : "Financial Analyst"}
                </span>
              </div>
              
              <div className="prose prose-sm max-w-none">
                {message.role === "assistant" ? 
                  <div className="space-y-2">
                    {formatResponseContent(message.content).split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="text-gray-800 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                  : message.content
                }
              </div>
              
              {message.role === "assistant" && financialData && (
                <FinancialDataDisplay data={financialData} />
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-gray-600">Analyzing financial data...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-3">
          <input
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Ask about stocks, market analysis, portfolio optimization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim()) {
                  append({ content: input, role: "user" });
                  setInput("");
                }
              }
            }}
            disabled={isLoading}
          />
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            onClick={() => {
              if (input.trim()) {
                append({ content: input, role: "user" });
                setInput("");
              }
            }}
            disabled={isLoading || !input.trim()}
          >
            Analyze
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 This is for educational purposes only and not financial advice. Always consult with qualified financial advisors.
        </p>
      </div>
    </div>
  );
} 