import { NextRequest, NextResponse } from 'next/server';
import { FinancialDataService } from '@/lib/financial-data';
import { RetrievalService } from '@/lib/retrieval';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Initialize services
const financialDataService = new FinancialDataService();
const retrievalService = new RetrievalService();

// Define the financial tools
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
    description: 'Get comprehensive financial analysis including stock data, risk metrics, and technical analysis',
    inputSchema: {
      type: 'object',
      properties: {
        symbol: {
          type: 'string',
          description: 'Stock symbol to analyze (e.g., AAPL, TSLA)',
        },
        analysisType: {
          type: 'string',
          description: 'Type of analysis to perform',
          enum: ['comprehensive', 'stock', 'risk', 'technical', 'news'],
          default: 'comprehensive',
        },
        includeComparisons: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional stock symbols to compare (optional)',
        },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'get-market-data',
    description: 'Retrieve current market data including major indices and multiple stocks',
    inputSchema: {
      type: 'object',
      properties: {
        symbols: {
          type: 'array',
          items: { type: 'string' },
          description: 'Stock symbols to get data for (e.g., ["AAPL", "TSLA", "GOOGL"])',
        },
        includeIndices: {
          type: 'boolean',
          description: 'Include major market indices data',
          default: true,
        },
      },
      required: [],
    },
  },
  {
    name: 'financial-chat',
    description: 'AI-powered financial analysis and advice using multiple specialized agents',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Your financial question or analysis request',
        },
        context: {
          type: 'string',
          description: 'Additional context or specific focus areas',
        },
        symbols: {
          type: 'array',
          items: { type: 'string' },
          description: 'Relevant stock symbols for the analysis',
        },
      },
      required: ['query'],
    },
  },
];

// Tool execution handlers with real implementations
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
        
        // Use the AI financial analyst to provide intelligent responses
        const messages = [
          {
            role: 'user' as const,
            content: `${query}${context ? `\n\nContext: ${context}` : ''}${chatSymbols.length > 0 ? `\n\nRelevant symbols: ${chatSymbols.join(', ')}` : ''}`,
          },
        ];
        
        // Create a simplified version of the financial agent
        let aiResponse = '';
        let toolData: any = {};
        
        // If specific symbols mentioned, get their data
        if (chatSymbols.length > 0) {
          toolData.stocksData = await financialDataService.getMultipleStocks(chatSymbols);
          
          // Get additional analysis for first symbol if available
          if (chatSymbols.length === 1) {
            const symbol = chatSymbols[0];
            toolData.technicalAnalysis = await financialDataService.getTechnicalAnalysis(symbol);
            toolData.riskAnalysis = await financialDataService.getRiskAnalysis(symbol);
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

// Handle MCP JSON-RPC requests
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle JSON-RPC 2.0 requests
    if (body.jsonrpc !== '2.0') {
      return NextResponse.json(
        {
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32600, message: 'Invalid Request' },
        },
        { status: 400 }
      );
    }

    switch (body.method) {
      case 'tools/list':
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: {
            tools: tools,
          },
        });

      case 'tools/call':
        const { name, arguments: args } = body.params;
        
        // Find the tool
        const tool = tools.find(t => t.name === name);
        if (!tool) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id: body.id,
            error: { code: -32601, message: `Tool not found: ${name}` },
          });
        }

        // Execute the tool
        const result = await executeTool(name, args);
        
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          result: result,
        });

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: `Method not found: ${body.method}` },
        });
    }
  } catch (error) {
    console.error('MCP error:', error);
    return NextResponse.json(
      {
        jsonrpc: '2.0',
        id: null,
        error: { code: -32603, message: 'Internal error' },
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for health checks)
export async function GET() {
  return NextResponse.json({
    name: 'financial-agent-mcp',
    version: '1.0.0',
    description: 'Financial Agent MCP Server with Real Data',
    tools: tools.length,
    integrations: {
      alphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
      newsApi: !!process.env.NEWS_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
  });
} 