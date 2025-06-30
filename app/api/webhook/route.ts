import { NextRequest, NextResponse } from 'next/server';
import { FinancialDataService } from '@/lib/financial-data';
import { RetrievalService } from '@/lib/retrieval';

// Use Edge Runtime for public access
export const runtime = 'edge';

// WhatsApp Cloud API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'danielverifytoken';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Initialize services
const financialService = new FinancialDataService();
const retrievalService = new RetrievalService();

// Direct financial tools (avoiding MCP authentication issues)
async function getFinancialAnalysis(symbol: string) {
  try {
    const [stockData, riskData, techData] = await Promise.all([
      financialService.getStockData(symbol),
      financialService.getRiskAnalysis(symbol),
      financialService.getTechnicalAnalysis(symbol)
    ]);
    
    return `📊 Financial Analysis: ${symbol}\n\n*${stockData.name}* (${symbol})\n• Price: $${stockData.price} (${stockData.changePercent.toFixed(2)}%)\n• Volume: ${stockData.volume.toLocaleString()}\n• Market Cap: $${stockData.marketCap ? (stockData.marketCap / 1e9).toFixed(2) : 'N/A'}B\n• P/E Ratio: ${stockData.pe || 'N/A'}\n\n*Risk Analysis:*\n• Risk Rating: ${riskData.riskRating}\n• Beta: ${riskData.beta.toFixed(2)}\n• Volatility: ${(riskData.volatility * 100).toFixed(1)}%\n\n*Technical Analysis:*\n• Trend: ${techData.signals.trend}\n• Recommendation: ${techData.signals.recommendation}\n• RSI: ${techData.indicators.rsi.toFixed(1)}\n\n*Analysis generated at ${new Date().toISOString()}*`;
  } catch (error) {
    return `Sorry, I couldn't analyze ${symbol}. Please check the symbol and try again.`;
  }
}

async function getMarketData() {
  try {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
    const results = await financialService.getMultipleStocks(symbols);
    
    let response = '📈 Market Summary:\n\n';
    results.forEach((stock, index) => {
      response += `*${symbols[index]}*: $${stock.price} (${stock.changePercent.toFixed(2)}%)\n`;
    });
    
    return response + `\n*Updated: ${new Date().toLocaleString()}*`;
  } catch (error) {
    return 'Sorry, I couldn\'t fetch market data at the moment.';
  }
}

async function getFinancialChat(message: string) {
  try {
    const response = await retrievalService.searchDocuments(message);
    return `💡 Financial Advice:\n\n${response}\n\n*This is general information and not personalized financial advice.*`;
  } catch (error) {
    return 'I can help with financial questions! Try asking about investing, stocks, or market trends.';
  }
}

// Function to send WhatsApp message
async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials not configured');
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', await response.text());
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
  }
}

// Function to parse user message and determine what to do
function parseUserMessage(message: string) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Stock analysis patterns
  const stockAnalysisPatterns = [
    /^analyze?\s+([a-z]{1,5})$/i,
    /^([a-z]{1,5})\s+analysis?$/i,
    /^get\s+([a-z]{1,5})$/i,
    /^stock\s+([a-z]{1,5})$/i,
  ];
  
  for (const pattern of stockAnalysisPatterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        action: 'analyze',
        symbol: match[1].toUpperCase(),
      };
    }
  }
  
  // Market data patterns
  if (lowerMessage.includes('market') || lowerMessage.includes('indices')) {
    return {
      action: 'market',
    };
  }
  
  // Financial chat patterns
  if (lowerMessage.includes('invest') || lowerMessage.includes('portfolio') || 
      lowerMessage.includes('buy') || lowerMessage.includes('sell') || 
      lowerMessage.includes('advice')) {
    return {
      action: 'chat',
      query: message,
    };
  }
  
  // Help patterns
  if (lowerMessage.includes('help') || lowerMessage === 'hi' || lowerMessage === 'hello') {
    return {
      action: 'help',
    };
  }
  
  // Default to financial chat
  return {
    action: 'chat',
    query: message,
  };
}

// Handle WhatsApp webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  console.log('Webhook verification attempt:', { mode, token, challenge });
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified successfully');
    return new Response(challenge, { status: 200 });
  } else {
    console.error('❌ WhatsApp webhook verification failed:', { mode, token, expected: VERIFY_TOKEN });
    return new Response('Verification failed', { status: 403 });
  }
}

// Handle incoming WhatsApp messages (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log incoming webhook for debugging
    console.log('📱 WhatsApp webhook received:', JSON.stringify(body, null, 2));
    
    // Check if this is a message notification
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const messages = change.value?.messages || [];
            
            for (const message of messages) {
              if (message.type === 'text') {
                const userMessage = message.text.body;
                const userPhone = message.from;
                
                console.log(`📨 Message from ${userPhone}: ${userMessage}`);
                
                // Parse the user's message
                const parsed = parseUserMessage(userMessage);
                let response = '';
                
                try {
                  switch (parsed.action) {
                    case 'analyze':
                      response = parsed.symbol ? await getFinancialAnalysis(parsed.symbol) : 'Please specify a stock symbol to analyze.';
                      break;
                      
                    case 'market':
                      response = await getMarketData();
                      break;
                      
                    case 'chat':
                      response = parsed.query ? await getFinancialChat(parsed.query) : 'Please ask a financial question.';
                      break;
                      
                    case 'help':
                      response = `🤖 *Financial Analysis Bot*\n\nCommands:\n• "analyze AAPL" - Stock analysis\n• "market summary" - Market overview\n• "should I invest in tech?" - Financial advice\n\nJust text me your financial questions!`;
                      break;
                      
                    default:
                      response = 'I can help with financial analysis! Try "analyze AAPL" or "market summary".';
                  }
                  
                  // Send response back to user
                  await sendWhatsAppMessage(userPhone, response);
                  console.log(`✅ Response sent to ${userPhone}`);
                  
                } catch (error) {
                  console.error('Error processing message:', error);
                  await sendWhatsAppMessage(userPhone, 'Sorry, I encountered an error. Please try again.');
                }
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'ok' });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 