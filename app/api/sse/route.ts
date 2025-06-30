import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { FinancialDataService } from '@/lib/financial-data';
import { RetrievalService } from '@/lib/retrieval';

// Define the financial tools (same as MCP route)
const tools = [
  {
    name: 'echo',
    description: 'Echo a message for testing purposes',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to echo back',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'get-financial-analysis',
    description: 'Get financial analysis and market insights for stocks, companies, or market trends',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The financial query or stock symbol to analyze',
        },
        analysisType: {
          type: 'string',
          description: 'Type of analysis to perform',
          enum: ['stock', 'market', 'company', 'trend'],
          default: 'stock',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get-market-data',
    description: 'Retrieve current market data and stock prices',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to get data for (e.g., AAPL, TSLA)',
        },
        dataType: {
          type: 'string',
          description: 'Type of market data to retrieve',
          enum: ['price', 'volume', 'chart', 'fundamentals'],
          default: 'price',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'financial-chat',
    description: 'Chat with the financial analyst AI about investments, market trends, and financial advice',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Your financial question or topic for discussion',
        },
        context: {
          type: 'string',
          description: 'Additional context for the financial discussion',
        },
      },
      required: ['message'],
    },
  },
];

// Initialize services
const financialDataService = new FinancialDataService();
const retrievalService = new RetrievalService();

// Initialize Redis client (use Vercel's KV environment variables)
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Tool execution with real implementations
async function executeTool(name: string, args: any) {
  try {
    switch (name) {
      case 'echo':
        return {
          content: [
            {
              type: 'text',
              text: `Echo: ${args.message}`,
            },
          ],
        };
        
      case 'get-financial-analysis':
        const { symbol, analysisType = 'comprehensive', includeComparisons = [] } = args;
        
        let analysisData: any = {};
        
        if (analysisType === 'comprehensive' || analysisType === 'stock') {
          analysisData.stockData = await financialDataService.getStockData(symbol);
        }
        
        if (analysisType === 'comprehensive' || analysisType === 'risk') {
          analysisData.riskAnalysis = await financialDataService.getRiskAnalysis(symbol);
        }
        
        if (analysisType === 'comprehensive' || analysisType === 'technical') {
          analysisData.technicalAnalysis = await financialDataService.getTechnicalAnalysis(symbol);
        }
        
        if (analysisType === 'comprehensive' || analysisType === 'news') {
          analysisData.newsAnalysis = await financialDataService.getNewsAnalysis(symbol);
        }
        
        if (includeComparisons.length > 0) {
          analysisData.comparisons = await financialDataService.getMultipleStocks(includeComparisons);
        }
        
        // Format the response with both readable text and structured data
        const stock = analysisData.stockData;
        const risk = analysisData.riskAnalysis;
        const technical = analysisData.technicalAnalysis;
        const news = analysisData.newsAnalysis;
        
        let responseText = `## Financial Analysis: ${symbol.toUpperCase()}\n\n`;
        
        if (stock) {
          responseText += `**${stock.name}** (${stock.symbol})\n`;
          responseText += `• Price: $${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}, ${stock.changePercent.toFixed(2)}%)\n`;
          responseText += `• Volume: ${stock.volume.toLocaleString()}\n`;
          if (stock.marketCap) responseText += `• Market Cap: $${(stock.marketCap / 1e9).toFixed(2)}B\n`;
          if (stock.pe) responseText += `• P/E Ratio: ${stock.pe.toFixed(2)}\n`;
          responseText += `\n`;
        }
        
        if (risk) {
          responseText += `**Risk Analysis:**\n`;
          responseText += `• Risk Rating: ${risk.riskRating}\n`;
          responseText += `• Beta: ${risk.beta.toFixed(2)}\n`;
          responseText += `• Volatility: ${(risk.volatility * 100).toFixed(1)}%\n`;
          responseText += `• Sharpe Ratio: ${risk.sharpeRatio.toFixed(2)}\n`;
          responseText += `\n`;
        }
        
        if (technical) {
          responseText += `**Technical Analysis:**\n`;
          responseText += `• Trend: ${technical.signals.trend}\n`;
          responseText += `• Recommendation: ${technical.signals.recommendation}\n`;
          responseText += `• RSI: ${technical.indicators.rsi.toFixed(1)}\n`;
          responseText += `• Price vs SMA20: ${stock ? ((stock.price / technical.indicators.movingAverages.sma20 - 1) * 100).toFixed(1) : 'N/A'}%\n`;
          responseText += `\n`;
        }
        
        if (news) {
          responseText += `**Market Sentiment:**\n`;
          responseText += `• Sentiment: ${news.sentimentLabel} (${news.sentimentScore.toFixed(2)})\n`;
          responseText += `• Recent Articles: ${news.articles.length}\n`;
          responseText += `\n`;
        }
        
        responseText += `*Analysis generated at ${new Date().toISOString()}*\n\n`;
        responseText += `**Raw Data:**\n\`\`\`json\n${JSON.stringify(analysisData, null, 2)}\n\`\`\``;
        
        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
        
      case 'get-market-data':
        const { symbols: marketSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'], includeIndices = true } = args;
        
        let marketData: any = {};
        
        if (marketSymbols.length > 0) {
          marketData.stocks = await financialDataService.getMultipleStocks(marketSymbols);
        }
        
        if (includeIndices) {
          const fullMarketData = await financialDataService.getMarketData();
          marketData.indices = fullMarketData.indices;
          marketData.timestamp = fullMarketData.timestamp;
        }
        
        let marketText = `## Market Data Overview\n\n`;
        
        if (marketData.indices) {
          marketText += `**Major Indices:**\n`;
          Object.entries(marketData.indices).forEach(([name, data]: [string, any]) => {
            marketText += `• ${name}: ${data.value.toFixed(2)} (${data.change >= 0 ? '+' : ''}${data.change.toFixed(2)}, ${data.changePercent.toFixed(2)}%)\n`;
          });
          marketText += `\n`;
        }
        
        if (marketData.stocks && marketData.stocks.length > 0) {
          marketText += `**Individual Stocks:**\n`;
          marketData.stocks.forEach((stock: any) => {
            marketText += `• ${stock.symbol}: $${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)\n`;
          });
          marketText += `\n`;
        }
        
        marketText += `*Data retrieved at ${marketData.timestamp || new Date().toISOString()}*\n\n`;
        marketText += `**Raw Data:**\n\`\`\`json\n${JSON.stringify(marketData, null, 2)}\n\`\`\``;
        
        return {
          content: [
            {
              type: 'text',
              text: marketText,
            },
          ],
        };
        
      case 'financial-chat':
        const { query, context = '', symbols: chatSymbols = [] } = args;
        
        // Create a simplified version of the financial agent
        let aiResponse = '';
        let toolData: any = {};
        
        // If specific symbols mentioned, get their data
        if (chatSymbols.length > 0) {
          toolData.stocksData = await financialDataService.getMultipleStocks(chatSymbols);
          
          // Get additional analysis for first symbol if available
          if (chatSymbols.length === 1) {
            const firstSymbol = chatSymbols[0];
            toolData.technicalAnalysis = await financialDataService.getTechnicalAnalysis(firstSymbol);
            toolData.riskAnalysis = await financialDataService.getRiskAnalysis(firstSymbol);
          }
        }
        
        // Search for relevant documents if query seems research-oriented
        if (query.toLowerCase().includes('research') || query.toLowerCase().includes('report') || query.toLowerCase().includes('filing')) {
          try {
            toolData.documentSearch = await financialDataService.searchFinancialDocuments(query);
          } catch (error) {
            console.log('Document search not available:', error);
          }
        }
        
        // Generate AI response
        aiResponse = `## Financial Assistant Response\n\n**Query:** ${query}\n\n`;
        
        // Provide intelligent analysis based on available data
        if (toolData.stocksData && toolData.stocksData.length > 0) {
          aiResponse += `**Stock Analysis:**\n`;
          toolData.stocksData.forEach((stock: any) => {
            aiResponse += `• ${stock.name} (${stock.symbol}): $${stock.price.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)\n`;
          });
          aiResponse += `\n`;
        }
        
        if (toolData.technicalAnalysis) {
          const tech = toolData.technicalAnalysis;
          aiResponse += `**Technical Perspective:**\n`;
          aiResponse += `The current technical outlook is ${tech.signals.trend.toLowerCase()} with a ${tech.signals.recommendation.toLowerCase()} recommendation. `;
          aiResponse += `RSI at ${tech.indicators.rsi.toFixed(1)} suggests ${tech.signals.momentum.toLowerCase()} momentum.\n\n`;
        }
        
        if (toolData.riskAnalysis) {
          const risk = toolData.riskAnalysis;
          aiResponse += `**Risk Assessment:**\n`;
          aiResponse += `Risk rating is ${risk.riskRating.toLowerCase()} with a beta of ${risk.beta.toFixed(2)}. `;
          aiResponse += `Volatility at ${(risk.volatility * 100).toFixed(1)}% indicates ${risk.riskRating === 'High' ? 'higher' : 'moderate'} price swings.\n\n`;
        }
        
        // Provide general financial guidance
        aiResponse += `**Analysis:**\n`;
        if (query.toLowerCase().includes('invest') || query.toLowerCase().includes('buy')) {
          aiResponse += `Investment decisions should consider your risk tolerance, time horizon, and overall portfolio allocation. `;
        }
        if (query.toLowerCase().includes('portfolio')) {
          aiResponse += `Diversification across sectors and asset classes is key to managing portfolio risk. `;
        }
        if (query.toLowerCase().includes('market') || query.toLowerCase().includes('trend')) {
          aiResponse += `Market trends are influenced by economic indicators, earnings reports, and geopolitical events. `;
        }
        
        aiResponse += `\n**Disclaimer:** This analysis is for educational purposes only and should not be considered financial advice.\n\n`;
        
        if (Object.keys(toolData).length > 0) {
          aiResponse += `**Supporting Data:**\n\`\`\`json\n${JSON.stringify(toolData, null, 2)}\n\`\`\``;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: aiResponse,
            },
          ],
        };
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or check the parameters.`,
        },
      ],
    };
  }
}

// Handle SSE requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle JSON-RPC 2.0 requests via SSE
    if (body.jsonrpc !== '2.0') {
      return new Response(
        `data: ${JSON.stringify({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32600, message: 'Invalid Request' },
        })}\n\n`,
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
          },
        }
      );
    }

    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send connection established message
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'SSE MCP server ready' })}\n\n`)
          );

          switch (body.method) {
            case 'tools/list':
              const toolsResponse = {
                jsonrpc: '2.0',
                id: body.id,
                result: { tools: tools },
              };
              
              // Store in Redis if available
              if (redis) {
                await redis.set(`session:${body.id}:tools`, JSON.stringify(toolsResponse), { ex: 3600 });
              }
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(toolsResponse)}\n\n`)
              );
              break;

            case 'tools/call':
              const { name, arguments: args } = body.params;
              
              // Find the tool
              const tool = tools.find(t => t.name === name);
              if (!tool) {
                const errorResponse = {
                  jsonrpc: '2.0',
                  id: body.id,
                  error: { code: -32601, message: `Tool not found: ${name}` },
                };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`)
                );
                break;
              }

              // Send processing message
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'processing', tool: name })}\n\n`)
              );

              // Execute the tool
              const result = await executeTool(name, args);
              
              const successResponse = {
                jsonrpc: '2.0',
                id: body.id,
                result: result,
              };
              
              // Store in Redis if available
              if (redis) {
                await redis.set(`session:${body.id}:result`, JSON.stringify(successResponse), { ex: 3600 });
              }
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(successResponse)}\n\n`)
              );
              break;

            default:
              const methodErrorResponse = {
                jsonrpc: '2.0',
                id: body.id,
                error: { code: -32601, message: `Method not found: ${body.method}` },
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(methodErrorResponse)}\n\n`)
              );
              break;
          }
          
          // Close the stream
          controller.close();
          
        } catch (error) {
          console.error('SSE processing error:', error);
          const errorResponse = {
            jsonrpc: '2.0',
            id: body.id,
            error: { code: -32603, message: 'Internal error' },
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorResponse)}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('SSE request error:', error);
    return new Response(
      `data: ${JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: 'Internal error' },
      })}\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    );
  }
}

// Handle GET requests for SSE health check
export async function GET() {
  return new Response(
    JSON.stringify({
      name: 'financial-agent-mcp-sse',
      version: '1.0.0',
      description: 'Financial Agent MCP Server - SSE Transport',
      tools: tools.length,
      redis: redis ? 'connected' : 'not configured',
      upstash: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'not configured',
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 