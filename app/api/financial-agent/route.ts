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
    system: `You are a sophisticated financial analyst AI with access to multiple specialized agents. 

CRITICAL INSTRUCTIONS FOR VISUAL UI:

🚨 MANDATORY: You MUST use the available tools AND include the complete JSON output in your response.

📋 REQUIRED STEPS:
1. Call the appropriate tool(s) based on the user's request
2. Write your analysis in natural language  
3. COPY THE COMPLETE TOOL OUTPUT JSON and include it at the end
4. The frontend will parse this JSON to show beautiful charts and tables

🎯 FOR MARKET OVERVIEW: Always call getMarketData() tool
🎯 FOR STOCK ANALYSIS: Always call getStockData() tool  
🎯 FOR TECHNICAL ANALYSIS: Always call getTechnicalAnalysis() tool
🎯 FOR PORTFOLIO: Always call getMultipleStocks() tool

📊 RESPONSE FORMAT (MANDATORY):

## [Your Analysis Title]

[Your natural language analysis here with clear structure...]

**Key Insights:**
- TSLA shows strong momentum with BUY signals
- RSI at 45.2 indicates neutral territory 
- Price target: $245 with BULLISH outlook
- Technical indicators support HOLD recommendation

**Financial Metrics:**
- Current Price: $238.45 (+2.4%)
- P/E Ratio: 65.2x
- Beta: 2.1 (high volatility)
- Market Cap: $758B

**Recommendation:** BUY | HOLD | SELL

This analysis is for educational purposes only.

[COMPLETE JSON DATA FROM TOOL CALLS GOES HERE]

⚠️ EXAMPLE - Market Overview Response:

## Market Overview

The current market shows mixed signals with technology stocks leading gains...

**Key Highlights:**
- S&P 500 up 0.5% 
- Tech sector outperforming
- Strong volume in AAPL

This analysis is for educational purposes only.

{"stocks": [{"symbol": "AAPL", "name": "Apple Inc.", "price": 150.25, "change": 2.10, "changePercent": 1.42}]}

🎯 ANALYSIS APPROACH:
- Use multiple tools to gather comprehensive data
- Synthesize information from different perspectives
- Always mention risk factors and limitations
- Provide context for all metrics and numbers

🔧 AVAILABLE TOOLS:
• Market Data Agent - Stock prices, indices, trading data
• Risk Analysis Agent - Beta, VaR, Sharpe ratio, volatility
• Technical Analysis Agent - RSI, MACD, moving averages, signals
• News Sentiment Agent - Financial news analysis and scoring
• Portfolio Analysis Agent - Asset allocation and performance
• Document Retrieval Agent - SEC filings and analyst reports

⚠️ DISCLAIMERS:
Always conclude with: "This analysis is for educational purposes only and should not be considered financial advice. Please consult with qualified financial advisors before making investment decisions."`,
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
      calculatePortfolioMetrics: {
        description: "Calculate portfolio-level risk and performance metrics",
        parameters: z.object({
          holdings: z.array(z.object({
            symbol: z.string(),
            weight: z.number().min(0).max(1),
          })).describe("Portfolio holdings with weights (weights should sum to 1)"),
        }),
        execute: async ({ holdings }) => {
          // Get individual stock data for portfolio holdings
          const stocksData = await Promise.all(
            holdings.map(async (holding: { symbol: string; weight: number }) => {
              const stockData = await financialDataService.getStockData(holding.symbol);
              const riskData = await financialDataService.getRiskAnalysis(holding.symbol);
              return { ...stockData, ...riskData, weight: holding.weight };
            })
          );

          // Calculate portfolio metrics
          const totalValue = stocksData.reduce((sum, stock) => sum + (stock.price * stock.weight * 100), 0);
          const portfolioBeta = stocksData.reduce((sum, stock) => sum + (stock.beta * stock.weight), 0);
          const weightedReturn = stocksData.reduce((sum, stock) => sum + (stock.changePercent * stock.weight), 0);

          const portfolioAnalysis = {
            totalValue,
            dailyChange: weightedReturn,
            portfolioBeta,
            holdings: stocksData.map(stock => ({
              symbol: stock.symbol,
              weight: stock.weight,
              value: stock.price * stock.weight * 100,
              riskRating: stock.riskRating,
            })),
            riskMetrics: {
              portfolioBeta,
              weightedVolatility: stocksData.reduce((sum, stock) => sum + (stock.volatility * stock.weight), 0),
              diversificationScore: holdings.length > 1 ? Math.min(holdings.length / 10, 1) : 0,
            },
            timestamp: new Date().toISOString(),
          };

          return JSON.stringify(portfolioAnalysis, null, 2);
        },
      },
    },
  });

  return result.toDataStreamResponse();
} 