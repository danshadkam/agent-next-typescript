import { createMcpHandler } from '@vercel/mcp-adapter';
import { z } from 'zod';
import { FinancialDataService } from '@/lib/financial-data';

// Initialize services
const financialDataService = new FinancialDataService();

const handler = createMcpHandler(server => {
  // Echo tool for testing
  server.tool(
    'echo',
    'Echo a message for testing purposes',
    {
      message: z.string(),
    },
    async ({ message }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${message}`,
          },
        ],
      };
    }
  );

  // Financial analysis tool
  server.tool(
    'get-financial-analysis',
    'Get financial analysis and market insights for stocks, companies, or market trends',
    {
      symbol: z.string(),
    },
    async ({ symbol }) => {
      try {
        const stockData = await financialDataService.getStockData(symbol);
        
        let responseText = `## Financial Analysis: ${symbol.toUpperCase()}\n\n`;
        responseText += `**${stockData.name}** (${stockData.symbol})\n`;
        responseText += `• Price: $${stockData.price.toFixed(2)} (${stockData.change >= 0 ? '+' : ''}${stockData.change.toFixed(2)}, ${stockData.changePercent.toFixed(2)}%)\n`;
        responseText += `• Volume: ${stockData.volume.toLocaleString()}\n`;
        if (stockData.marketCap) responseText += `• Market Cap: $${(stockData.marketCap / 1e9).toFixed(2)}B\n`;
        responseText += `\n*Analysis generated at ${new Date().toISOString()}*`;
        
        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error analyzing ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Market data tool
  server.tool(
    'get-market-data',
    'Retrieve current market data and stock prices',
    {
      symbols: z.array(z.string()).optional(),
    },
    async ({ symbols = ['AAPL', 'GOOGL', 'MSFT'] }) => {
      try {
        const stocks = await financialDataService.getMultipleStocks(symbols);
        
        let responseText = `## Market Data Summary\n\n**Stock Data:**\n`;
        stocks.forEach((stock: any) => {
          responseText += `• **${stock.symbol}**: $${stock.price.toFixed(2)} (${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}, ${stock.changePercent.toFixed(2)}%)\n`;
        });
        responseText += `\n*Data updated at ${new Date().toISOString()}*`;
        
        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error retrieving market data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Financial chat tool
  server.tool(
    'financial-chat',
    'Chat with the financial analyst AI about investments, market trends, and financial advice',
    {
      query: z.string(),
    },
    async ({ query }) => {
      try {
        const responseText = `## Financial Assistant Response\n\n**Query:** ${query}\n\n**Analysis:** I've received your financial question. Based on current market conditions, here's my analysis:\n\n**Recommendation:** Please consult with a qualified financial advisor for personalized investment advice. This analysis is for informational purposes only.\n\n*Response generated at ${new Date().toISOString()}*`;
        
        return {
          content: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
});

export { handler as GET, handler as POST }; 