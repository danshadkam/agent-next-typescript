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
    system: `You are a sophisticated financial analyst AI with access to multiple specialized agents. 

You have access to the following financial analysis tools:
1. Market Data Agent - Real-time stock prices, market data, and trading information
2. Risk Analysis Agent - Risk metrics including Beta, VaR, Sharpe ratio, and volatility analysis
3. Technical Analysis Agent - Technical indicators like RSI, MACD, moving averages, and trading signals
4. News Sentiment Agent - Financial news analysis and sentiment scoring
5. Portfolio Analysis Agent - Portfolio composition, performance metrics, and asset allocation
6. Document Retrieval Agent - Search through financial documents, SEC filings, and analyst reports

When analyzing financial queries:
- Use multiple agents to provide comprehensive analysis
- Always consider risk factors and provide balanced perspectives
- Include specific data and sources when possible
- Provide actionable insights while noting that this is not financial advice
- Synthesize information from multiple sources for well-rounded analysis

Format your responses professionally with clear sections for different types of analysis.`,
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
          let comparisonData = [];
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
            holdings.map(async (holding) => {
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