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

// Check if the request is for news analysis
function isNewsRequest(message: string): boolean {
  const newsKeywords = ['news', 'sentiment', 'articles', 'headlines', 'market news', 'recent news'];
  const lowerMessage = message.toLowerCase();
  return newsKeywords.some(keyword => lowerMessage.includes(keyword));
}

export async function POST(req: Request) {
  const { messages, symbol, marketData }: { 
    messages: Message[]; 
    symbol?: string;
    marketData?: any;
  } = await req.json();
  
  // Extract symbol from the request or messages
  const requestedSymbol = symbol || extractSymbolFromMessages(messages) || 'AAPL';
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  console.log(`Financial Agent analyzing symbol: ${requestedSymbol}`);

  // Handle news requests with streaming response containing JSON data
  if (isNewsRequest(lastMessage)) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/news-sentiment?symbol=${requestedSymbol}`);
      
      if (response.ok) {
        const newsData = await response.json();
        
        // Create enhanced articles JSON 
        const articlesJson = JSON.stringify({
          type: "ENHANCED_NEWS_ARTICLES",
          symbol: requestedSymbol.toUpperCase(),
          sentimentScore: newsData.sentimentScore,
          overallSentiment: newsData.overallSentiment,
          articles: newsData.articles,
          timestamp: new Date().toISOString()
        });

        // Return streaming response with JSON embedded in text
        const result = streamText({
          model: openai("gpt-4o"),
          prompt: `Return exactly this JSON data without any modifications: ${articlesJson}`,
        });

        return result.toDataStreamResponse();
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
    }
  }

  // For non-news requests, use the regular streaming response
  const result = streamText({
    model: openai("gpt-4o"),
    maxSteps: 10,
    system: `You are a professional financial analyst AI.

TARGET SYMBOL: ${requestedSymbol}
${marketData ? `CURRENT DATA: Price $${marketData.price}, Volume ${marketData.volume.toLocaleString()}, Change ${marketData.changePercent}%` : ''}

INSTRUCTIONS:
- Provide comprehensive financial analysis for ${requestedSymbol}
- Use professional language and actionable insights
- Include specific price targets and recommendations
- Call appropriate tools based on the request type
- Focus on technical analysis, risk assessment, and market trends

For technical analysis: Use getTechnicalAnalysis tool
For stock data: Use getStockData tool  
For market overview: Use getMarketData tool
For comprehensive analysis: Use performComprehensiveAnalysis tool

Format responses with clear headings and bullet points.
Include professional disclaimers about educational use.`,
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
      getTechnicalAnalysis: {
        description: "Get technical analysis including RSI, MACD, moving averages, and trading signals",
        parameters: z.object({
          symbol: z.string().describe("Stock symbol for technical analysis"),
        }),
        execute: async ({ symbol }) => {
          console.log(`Getting technical analysis for ${symbol}`);
          const technicalAnalysis = await financialDataService.getTechnicalAnalysis(symbol);
          
          const validatedAnalysis = {
            ...technicalAnalysis,
            symbol: symbol.toUpperCase(),
            timestamp: new Date().toISOString()
          };
          
          console.log(`Technical analysis for ${symbol}:`, validatedAnalysis);
          return JSON.stringify(validatedAnalysis, null, 2);
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
          
          // Get comparison data if requested
          let comparisonData: any[] = [];
          if (includeComparisons.length > 0) {
            comparisonData = await financialDataService.getMultipleStocks(includeComparisons);
          }

          const comprehensiveReport = {
            primaryStock: stockData,
            riskMetrics: riskAnalysis,
            technicalIndicators: technicalAnalysis,
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