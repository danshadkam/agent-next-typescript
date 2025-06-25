"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, AlertTriangle, News, Target } from "lucide-react";

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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, return null
    }
    return null;
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      <button
        onClick={() => append({ content: "Get current market overview", role: "user" })}
        className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 transition-colors"
      >
        <BarChart3 className="w-4 h-4" />
        Market Overview
      </button>
      <button
        onClick={() => append({ content: "Analyze AAPL stock performance", role: "user" })}
        className="flex items-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm font-medium text-green-700 transition-colors"
      >
        <Target className="w-4 h-4" />
        Stock Analysis
      </button>
      <button
        onClick={() => append({ content: "Show portfolio risk analysis for AAPL, GOOGL, MSFT with equal weights", role: "user" })}
        className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm font-medium text-purple-700 transition-colors"
      >
        <DollarSign className="w-4 h-4" />
        Portfolio
      </button>
      <button
        onClick={() => append({ content: "Get latest news sentiment for TSLA", role: "user" })}
        className="flex items-center gap-2 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm font-medium text-orange-700 transition-colors"
      >
        <News className="w-4 h-4" />
        News Analysis
      </button>
    </div>
  );

  const StockCard = ({ stock }: { stock: StockData }) => (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
          <p className="text-sm text-gray-600">{stock.name}</p>
        </div>
        {getTrendIcon(stock.change)}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{formatCurrency(stock.price)}</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(stock.change))}
          </span>
          <span className={`text-sm ${stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({formatPercent(stock.changePercent)})
          </span>
        </div>
      </div>
    </div>
  );

  const FinancialDataDisplay = ({ data }: { data: any }) => {
    if (!data) return null;

    if (data.stocks && Array.isArray(data.stocks)) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
          {data.stocks.map((stock: StockData, index: number) => (
            <StockCard key={index} stock={stock} />
          ))}
        </div>
      );
    }

    if (data.symbol && data.price) {
      return (
        <div className="my-4">
          <StockCard stock={data} />
        </div>
      );
    }

    if (data.riskRating || data.beta || data.volatility) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Risk Analysis</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.beta && (
              <div>
                <p className="text-sm text-yellow-700">Beta</p>
                <p className="font-semibold text-yellow-900">{data.beta.toFixed(2)}</p>
              </div>
            )}
            {data.volatility && (
              <div>
                <p className="text-sm text-yellow-700">Volatility</p>
                <p className="font-semibold text-yellow-900">{(data.volatility * 100).toFixed(1)}%</p>
              </div>
            )}
            {data.sharpeRatio && (
              <div>
                <p className="text-sm text-yellow-700">Sharpe Ratio</p>
                <p className="font-semibold text-yellow-900">{data.sharpeRatio.toFixed(2)}</p>
              </div>
            )}
            {data.riskRating && (
              <div>
                <p className="text-sm text-yellow-700">Risk Rating</p>
                <p className={`font-semibold ${
                  data.riskRating === 'Low' ? 'text-green-600' :
                  data.riskRating === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>{data.riskRating}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-[90vh] max-w-6xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Financial Analyst AI</h1>
        <p className="text-gray-600">Multi-agent financial analysis with real-time data and insights</p>
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
                {message.content}
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