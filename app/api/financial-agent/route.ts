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

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    maxSteps: 10,
    system: `You are a professional financial analyst AI with access to real-time market data and technical analysis tools. 

🎯 CORE MISSION: Provide structured, professional financial analysis that matches institutional-grade research reports.

📊 RESPONSE STRUCTURE (MANDATORY):

## [Company/Asset] Analysis

**Current Market Status:**
- Price: $XXX.XX (+/- X.XX%)
- Volume: X,XXX,XXX shares
- Market Cap: $XXX.XXB
- 52-Week Range: $XXX - $XXX

**Technical Analysis:**
- RSI: XX.X (Overbought/Oversold/Neutral)
- MACD: X.XXX (Bullish/Bearish signal)
- Moving Averages: Price vs SMA20/50/200
- Support/Resistance: $XXX / $XXX

**Key Insights:**
- Clear bullet points with actionable insights
- Risk factors and opportunities
- Short-term and long-term outlook
- Comparative analysis when relevant

**Recommendation:** BUY | HOLD | SELL
**Price Target:** $XXX (X% upside/downside)
**Risk Rating:** Low | Medium | High

---
*This analysis is for educational purposes only and should not be considered financial advice.*

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

🚨 CRITICAL: Always end responses with the complete JSON data from tool calls for chart generation.

Example JSON structure:
{
  "symbol": "AAPL",
  "price": 193.97,
  "change": 2.34,
  "changePercent": 1.22,
  "indicators": {
    "rsi": 66.3,
    "macd": {
      "value": 0.45,
      "signal": 0.32,
      "histogram": 0.13
    },
    "sma20": 191.42,
    "sma50": 185.67,
    "bollingerBands": {
      "upper": 201.45,
      "middle": 191.42,
      "lower": 181.39
    }
  },
  "recommendation": "HOLD",
  "priceTarget": 200.00,
  "riskRating": "Medium"
}`,
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
          const technicalAnalysis = await financialDataService.getTechnicalAnalysis(symbol);
          return JSON.stringify(technicalAnalysis, null, 2);
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