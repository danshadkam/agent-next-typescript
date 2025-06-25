import Link from "next/link";
import { ArrowRight, BarChart3, TrendingUp, Shield, Brain, Newspaper, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Multi-Agent Financial Analyst
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Powered by specialized AI agents working together to provide comprehensive financial analysis, 
            risk assessment, and investment insights using real-time data and advanced analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/financial"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Start Financial Analysis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/vectorize"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-lg"
            >
              Document Search
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Agents Grid */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Specialized Financial Agents
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">Market Data Agent</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Real-time stock prices, market indices, trading volumes, and comprehensive market overview data.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Live stock quotes and market data</li>
              <li>• Major market indices tracking</li>
              <li>• Trading volume analysis</li>
              <li>• Market cap and valuation metrics</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">Risk Analysis Agent</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Advanced risk metrics including Beta, VaR, Sharpe ratio, volatility analysis, and portfolio risk assessment.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Beta and correlation analysis</li>
              <li>• Value at Risk (VaR) calculations</li>
              <li>• Sharpe ratio and risk-adjusted returns</li>
              <li>• Portfolio diversification metrics</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">Technical Analysis Agent</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Technical indicators, chart patterns, moving averages, and algorithmic trading signals.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• RSI, MACD, and momentum indicators</li>
              <li>• Moving averages and trend analysis</li>
              <li>• Bollinger Bands and volatility bands</li>
              <li>• Buy/Hold/Sell recommendations</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">News Sentiment Agent</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Financial news analysis, sentiment scoring, and market-moving events detection.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Real-time news sentiment analysis</li>
              <li>• Market impact assessment</li>
              <li>• Earnings and announcement tracking</li>
              <li>• Social media sentiment monitoring</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">Document Retrieval Agent</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Search through SEC filings, analyst reports, financial statements, and research documents.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• SEC filings and regulatory documents</li>
              <li>• Analyst reports and research</li>
              <li>• Financial statements analysis</li>
              <li>• Company fundamentals data</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 ml-4">Portfolio Analysis Agent</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Portfolio optimization, asset allocation, performance tracking, and rebalancing recommendations.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Portfolio performance metrics</li>
              <li>• Asset allocation optimization</li>
              <li>• Diversification analysis</li>
              <li>• Rebalancing recommendations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Advanced Financial Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Agent Coordination</h3>
              <p className="text-gray-600">
                Multiple specialized AI agents work together to provide comprehensive financial analysis from different perspectives.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Data</h3>
              <p className="text-gray-600">
                Access to live market data, real-time price feeds, and up-to-the-minute financial information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Risk-Aware Analysis</h3>
              <p className="text-gray-600">
                Comprehensive risk assessment with advanced metrics to help you make informed investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Transform Your Financial Analysis?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven financial insights with our multi-agent system. 
            Get started with comprehensive market analysis today.
          </p>
          <Link 
            href="/financial"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Launch Financial Analyst
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">FinAnalyst AI</h3>
              <p className="text-gray-400">
                Advanced multi-agent financial analysis system powered by AI and real-time data.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Multi-Agent Analysis</li>
                <li>Real-Time Data</li>
                <li>Risk Assessment</li>
                <li>Portfolio Optimization</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Agents</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Market Data</li>
                <li>Risk Analysis</li>
                <li>Technical Analysis</li>
                <li>News Sentiment</li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-3">Disclaimer</h4>
              <p className="text-gray-400 text-sm">
                This tool is for educational purposes only. Not financial advice. 
                Please consult qualified financial advisors.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FinAnalyst AI. Educational use only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
