import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Cloud API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'financial_agent_verify_token';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Function to call our existing MCP server
async function callMCPTool(toolName: string, args: any) {
  try {
    const response = await fetch('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `whatsapp-${Date.now()}`,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args,
        },
      }),
    });

    const data = await response.json();
    return data.result?.content?.[0]?.text || 'Sorry, I couldn\'t process that request.';
  } catch (error) {
    console.error('Error calling MCP server:', error);
    return 'Sorry, there was an error processing your request. Please try again.';
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

// Function to format response for WhatsApp
function formatForWhatsApp(text: string): string {
  // Remove markdown formatting for WhatsApp
  let formatted = text
    .replace(/#{1,6}\s/g, '') // Remove header markdown
    .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold: ** to *
    .replace(/```[\s\S]*?```/g, '[Raw data available - use web interface for detailed view]') // Remove code blocks
    .replace(/`([^`]+)`/g, '_$1_') // Inline code to italic
    .replace(/\n{3,}/g, '\n\n'); // Reduce multiple newlines
  
  // Truncate if too long (WhatsApp has limits)
  if (formatted.length > 4000) {
    formatted = formatted.substring(0, 3800) + '\n\n_Message truncated. Use web interface for full analysis._';
  }
  
  return formatted;
}

// Handle WhatsApp webhook verification (GET request)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WhatsApp webhook verified successfully');
    return new Response(challenge, { status: 200 });
  } else {
    console.error('WhatsApp webhook verification failed');
    return new Response('Verification failed', { status: 403 });
  }
}

// Handle incoming WhatsApp messages (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log incoming webhook for debugging
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));
    
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
                const messageId = message.id;
                
                console.log(`Received message from ${userPhone}: ${userMessage}`);
                
                // Parse the user's message
                const parsed = parseUserMessage(userMessage);
                let response = '';
                
                try {
                  switch (parsed.action) {
                    case 'analyze':
                      response = await callMCPTool('get-financial-analysis', {
                        symbol: parsed.symbol,
                        analysisType: 'comprehensive',
                      });
                      break;
                      
                    case 'market':
                      response = await callMCPTool('get-market-data', {
                        symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
                        includeIndices: true,
                      });
                      break;
                      
                    case 'chat':
                      response = await callMCPTool('financial-chat', {
                        query: parsed.query || userMessage,
                        context: 'WhatsApp conversation',
                      });
                      break;
                      
                    case 'help':
                      response = `🏦 *Financial Analysis Bot*\n\nI can help you with:\n\n📊 *Stock Analysis*\n• "analyze AAPL"\n• "TSLA analysis"\n• "get MSFT"\n\n📈 *Market Data*\n• "market summary"\n• "indices"\n\n💬 *Financial Advice*\n• "should I invest in tech stocks?"\n• "portfolio advice"\n• "market trends"\n\n🔧 *Powered by real financial data*\nAlpha Vantage • News API • Technical Analysis\n\nJust type your question!`;
                      break;
                      
                    default:
                      response = 'I didn\'t understand that. Type "help" for available commands.';
                  }
                  
                  // Format and send response
                  const formattedResponse = formatForWhatsApp(response);
                  await sendWhatsAppMessage(userPhone, formattedResponse);
                  
                } catch (error) {
                  console.error('Error processing message:', error);
                  await sendWhatsAppMessage(
                    userPhone, 
                    'Sorry, I encountered an error processing your request. Please try again later.'
                  );
                }
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'success' });
    
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 