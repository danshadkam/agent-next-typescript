import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { FinancialDataService } from "@/lib/financial-data";
import { RetrievalService } from "@/lib/retrieval";
import type { AgentResponse, FinancialReport } from "@/types/financial";

interface Message {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: any[];
}

const financialDataService = new FinancialDataService();
const retrievalService = new RetrievalService();

// Helper function to extract stock symbol from messages
function extractSymbolFromMessages(messages: Message[]): string | null {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Look for "REAL MARKET DATA for [SYMBOL]" pattern first
  const realDataMatch = lastMessage.match(/REAL MARKET DATA for ([A-Z]{2,5}):/);
  if (realDataMatch) {
    return realDataMatch[1];
  }
  
  // Look for common stock symbols specifically
  const knownSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'BTC', 'ETH', 'SOL'];
  const symbolMatch = lastMessage.match(/\b([A-Z]{2,5})\b/g);
  
  if (symbolMatch) {
    // Prioritize known symbols
    const knownSymbolMatch = symbolMatch.find(symbol => knownSymbols.includes(symbol));
    if (knownSymbolMatch) {
      return knownSymbolMatch;
    }
    
    // Filter out common words that might match the pattern
    const commonWords = ['THE', 'AND', 'FOR', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HIS', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'USE', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'HIM', 'TWO', 'HOW', 'ITS', 'WHO', 'DID', 'YES', 'HAS', 'HAD', 'LET', 'PUT', 'TOO', 'SAY', 'SHE', 'MAY', 'WAY', 'BUY', 'OWN', 'REAL'];
    const filteredSymbols = symbolMatch.filter(symbol => !commonWords.includes(symbol));
    
    if (filteredSymbols.length > 0) {
      return filteredSymbols[0];
    }
  }
  
  return null;
}

export async function POST(req: Request) {
  const { messages, symbol, marketData }: { 
    messages: Message[]; 
    symbol?: string;
    marketData?: any;
  } = await req.json();
  
  // Extract symbol from the request or messages
  const requestedSymbol = symbol || extractSymbolFromMessages(messages) || 'AAPL';
  console.log(`Financial Agent analyzing symbol: ${requestedSymbol}`);

  const result = streamText({
    model: openai("gpt-4o"),
    maxSteps: 10,
    system: `You are a professional financial analyst AI with access to real-time market data and technical analysis tools.

🎯 CURRENT ANALYSIS TARGET: ${requestedSymbol}
${marketData ? `📊 REAL MARKET DATA PROVIDED: Price: $${marketData.price}, Volume: ${marketData.volume.toLocaleString()}, Change: ${marketData.changePercent}%` : ''}

🔧 ENHANCED ANALYSIS REQUIREMENTS FOR ${requestedSymbol}:
1. ALWAYS provide comprehensive analysis specific to ${requestedSymbol}
2. Include real-time market context and sector analysis
3. ALWAYS call getTechnicalAnalysis("${requestedSymbol}") for indicators
4. ALWAYS call getStockData("${requestedSymbol}") for current data  
5. Provide actionable insights with specific price targets
6. Include risk assessment and portfolio recommendations
7. Compare to sector benchmarks and market trends

🎯 CORE MISSION: Provide structured, professional financial analysis that matches institutional-grade research reports.

📊 ENHANCED RESPONSE STRUCTURE (MANDATORY):

## ${requestedSymbol} Professional Analysis

**📈 Current Market Position**
- Current Price: $XXX.XX (${marketData ? marketData.changePercent.toFixed(2) : 'X.XX'}% today)
- Trading Volume: ${marketData ? marketData.volume.toLocaleString() : 'X,XXX,XXX'} shares
- Market Capitalization: $XXX.XXB
- 52-Week Performance Range
- Pre/After Market Activity

**🔍 Technical Indicators & Signals**
- RSI (14): XX.X → Momentum interpretation
- MACD: X.XXX → Trend direction signal  
- Moving Averages: SMA20/50/200 analysis
- Bollinger Bands: Volatility assessment
- Support/Resistance Levels: $XXX / $XXX
- Volume Analysis: Institutional vs Retail

**💡 Professional Assessment**
- Market Sentiment: Bullish/Bearish/Neutral with reasoning
- Sector Performance: Relative strength analysis
- Catalyst Events: Upcoming earnings, product launches, etc.
- Risk Factors: Company-specific and market-wide
- Opportunity Analysis: Entry/exit points

**📋 Investment Recommendations**
- **Primary Recommendation:** BUY | HOLD | SELL
- **Price Target:** $XXX (X% potential movement)
- **Time Horizon:** Short-term (1-3 months) | Long-term (6-12 months)
- **Risk Rating:** Low | Medium | High
- **Position Sizing:** Suggested allocation %

**🎯 Action Items**
- Specific entry/exit strategies
- Stop-loss recommendations  
- Portfolio integration suggestions
- Monitoring key metrics

---
*Professional analysis for educational purposes. Consult licensed financial advisors for investment decisions.*

🔧 TOOL USAGE REQUIREMENTS:
1. ALWAYS call appropriate tools based on request type
2. For technical analysis: Use getTechnicalAnalysis() tool
3. For stock data: Use getStockData() tool
4. For market overview: Use getMarketData() tool
5. Include the complete JSON from tool calls at the end

📈 VISUAL ENHANCEMENT:
- When technical indicators are requested, ensure JSON output includes:
  - RSI values for chart generation
  - MACD data (value, signal, histogram)
  - Moving averages (SMA20, SMA50, SMA200)
  - Bollinger Bands (upper, middle, lower)
  - Volume data
  - Recommendation (BUY/HOLD/SELL)

🎨 FORMATTING STANDARDS:
- Use clear headings with ##
- Bold important metrics with **text**
- Use bullet points with - for lists
- Include professional disclaimers
- Maintain institutional tone throughout

🚨 CRITICAL: 
- NEVER include JSON code blocks, raw JSON, or technical data structures in responses
- Keep responses clean and user-friendly 
- All technical data should be embedded naturally in the analysis text
- Focus on actionable insights, not raw data dumps

📝 RESPONSE GUIDELINES:
- Use clear, professional language
- Include specific price targets and recommendations
- Explain technical indicators in plain English
- Provide actionable investment insights
- Always specify which company/symbol you're analyzing
- Include risk disclaimers`,
    messages,
    tools: {
      getMarketData: {
        description: "Get current market data including major indices and stock prices",
        parameters: z.object({}),
        execute: async () => {
          const marketData = await financialDataService.getMarketData();
          return JSON.stringify(marketData, null, 2);
        },
      },
      getStockData: {
        description: "Get detailed information for a specific stock symbol",
        parameters: z.object({
          symbol: z.string().describe("Stock symbol (e.g., AAPL, GOOGL)"),
        }),
        execute: async ({ symbol }) => {
          const stockData = await financialDataService.getStockData(symbol);
          return JSON.stringify(stockData, null, 2);
        },
      },
      getMultipleStocks: {
        description: "Get data for multiple stock symbols at once",
        parameters: z.object({
          symbols: z.array(z.string()).describe("Array of stock symbols"),
        }),
        execute: async ({ symbols }) => {
          const stocksData = await financialDataService.getMultipleStocks(symbols);
          return JSON.stringify(stocksData, null, 2);
        },
      },
      analyzeRisk: {
        description: "Perform risk analysis for a specific stock including Beta, VaR, and volatility",
        parameters: z.object({
          symbol: z.string().describe("Stock symbol to analyze"),
        }),
        execute: async ({ symbol }) => {
          const riskAnalysis = await financialDataService.getRiskAnalysis(symbol);
          return JSON.stringify(riskAnalysis, null, 2);
        },
      },
      getTechnicalAnalysis: {
        description: "Get technical analysis including RSI, MACD, moving averages, and trading signals",
        parameters: z.object({
          symbol: z.string().describe("Stock symbol for technical analysis"),
        }),
        execute: async ({ symbol }) => {
          console.log(`Getting technical analysis for ${symbol}`);
          const technicalAnalysis = await financialDataService.getTechnicalAnalysis(symbol);
          
          // Ensure data consistency and realistic values
          const validatedAnalysis = {
            ...technicalAnalysis,
            symbol: symbol.toUpperCase(),
            timestamp: new Date().toISOString()
          };
          
          console.log(`Technical analysis for ${symbol}:`, validatedAnalysis);
          return JSON.stringify(validatedAnalysis, null, 2);
        },
      },
      getNewsAnalysis: {
        description: "Get news sentiment analysis and recent articles for a stock",
        parameters: z.object({
          symbol: z.string().describe("Stock symbol for news analysis"),
        }),
        execute: async ({ symbol }) => {
          const newsAnalysis = await financialDataService.getNewsAnalysis(symbol);
          return JSON.stringify(newsAnalysis, null, 2);
        },
      },
      searchFinancialDocuments: {
        description: "Search through financial documents, SEC filings, and analyst reports",
        parameters: z.object({
          query: z.string().describe("Search query for financial documents"),
        }),
        execute: async ({ query }) => {
          // Use existing vectorize service for document search
          const documents = await retrievalService.searchDocuments(query);
          
          // Also search for financial-specific content
          const financialDocs = await financialDataService.searchFinancialDocuments(query);
          
          return `Document Search Results:\n${documents}\n\nFinancial Analysis:\n${financialDocs}`;
        },
      },
      performComprehensiveAnalysis: {
        description: "Perform a comprehensive multi-agent analysis of a stock or portfolio",
        parameters: z.object({
          symbol: z.string().describe("Primary stock symbol to analyze"),
          includeComparisons: z.array(z.string()).optional().describe("Additional stocks to compare"),
          analysisType: z.enum(["stock", "portfolio", "sector"]).describe("Type of analysis to perform"),
        }),
        execute: async ({ symbol, includeComparisons = [], analysisType }) => {
          // Gather data from multiple agents
          const stockData = await financialDataService.getStockData(symbol);
          const riskAnalysis = await financialDataService.getRiskAnalysis(symbol);
          const technicalAnalysis = await financialDataService.getTechnicalAnalysis(symbol);
          const newsAnalysis = await financialDataService.getNewsAnalysis(symbol);
          
          // Get comparison data if requested
          let comparisonData: any[] = [];
          if (includeComparisons.length > 0) {
            comparisonData = await financialDataService.getMultipleStocks(includeComparisons);
          }

          const comprehensiveReport = {
            primaryStock: stockData,
            riskMetrics: riskAnalysis,
            technicalIndicators: technicalAnalysis,
            sentimentAnalysis: newsAnalysis,
            comparisons: comparisonData,
            analysisType,
            timestamp: new Date().toISOString(),
          };

          return JSON.stringify(comprehensiveReport, null, 2);
        },
      },
    },
  });

  return result.toDataStreamResponse();
} 