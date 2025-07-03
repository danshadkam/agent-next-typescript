import { BarChart3, TrendingUp, Bitcoin, Globe, Zap, MessageSquare, Activity } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1426] via-[#1E293B] to-[#0B1426]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] rounded-2xl flex items-center justify-center shadow-2xl">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              AI Financial
              <span className="block bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] bg-clip-text text-transparent">
                Analyst
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get comprehensive market analysis, stock insights, and crypto intelligence 
              through interactive AI-powered conversations
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/financial"
                className="bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Start Analyzing
              </Link>
              <Link
                href="/vectorize"
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                RAG Chat
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Professional Trading Analysis
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Advanced AI tools for comprehensive market research and financial decision-making
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Stock Analysis */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#00D4AA]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Stock Analysis</h3>
            <p className="text-slate-400 leading-relaxed">
              Deep technical and fundamental analysis of stocks with price targets, key metrics, and performance insights
            </p>
          </div>

          {/* Crypto Intelligence */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#00D4AA]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-6">
              <Bitcoin className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Crypto Intelligence</h3>
            <p className="text-slate-400 leading-relaxed">
              Real-time cryptocurrency analysis including market sentiment, technical indicators, and trend forecasting
            </p>
          </div>

          {/* Market Overview */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#00D4AA]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
            <p className="text-slate-400 leading-relaxed">
              Comprehensive market summaries including major indices, sector performance, and economic drivers
            </p>
          </div>

          {/* Live Data */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#00D4AA]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Live Market Data</h3>
            <p className="text-slate-400 leading-relaxed">
              Real-time price feeds, interactive charts, and watchlist management for informed trading decisions
            </p>
          </div>

          {/* AI Chat */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#00D4AA]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Interactive AI Chat</h3>
            <p className="text-slate-400 leading-relaxed">
              Natural language conversations for market analysis, trading strategies, and financial insights
            </p>
          </div>

          {/* Tech Analysis */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#00D4AA]/50 transition-all duration-300">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Sector Analysis</h3>
            <p className="text-slate-400 leading-relaxed">
              Specialized analysis of technology stocks, FAANG performance, growth prospects, and sector trends
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-[#00D4AA]/10 to-[#00B4D8]/10 rounded-3xl p-12 text-center border border-[#00D4AA]/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Access professional-grade financial analysis powered by advanced AI. 
            Get insights on stocks, crypto, and market trends in real-time.
          </p>
          <Link
            href="/financial"
            className="inline-flex items-center bg-gradient-to-r from-[#00D4AA] to-[#00B4D8] text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Launch Financial Analyst
          </Link>
        </div>
      </div>
    </div>
  );
}
