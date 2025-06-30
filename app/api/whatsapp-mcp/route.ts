import { NextRequest, NextResponse } from 'next/server';

// Pure MCP-only WhatsApp webhook
export const runtime = 'edge';

// WhatsApp Cloud API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'danielverifytoken';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// MCP server URL - use tunnel URL in production, localhost in dev
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/api/mcp';

// Pure MCP function - ONLY talks to MCP server
async function callMCPServer(method: string, params?: any) {
  try {
    console.log(`📡 Calling MCP Server: ${method}`, params);
    
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: `mcp-${Date.now()}`,
        method: method,
        params: params,
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP Server error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }
    
    console.log(`✅ MCP Response received for ${method}`);
    return data.result;
  } catch (error) {
    console.error('❌ MCP Server call failed:', error);
    throw error;
  }
}

// WhatsApp message sending (only via MCP if needed)
async function sendWhatsAppMessage(to: string, message: string) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp credentials not configured');
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
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ WhatsApp API error:', errorText);
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    console.log('✅ WhatsApp message sent successfully');
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
    throw error;
  }
}

// Parse user message and determine MCP tool to call
function parseMessageForMCP(message: string) {
  const lowerMessage = message.toLowerCase().trim();
  
  // Stock analysis commands
  const stockMatch = message.match(/^(?:analyze?|get|stock)\s+([a-z]{1,5})$/i) || 
                    message.match(/^([a-z]{1,5})\s+(?:analysis?|stock)$/i);
  
  if (stockMatch) {
    return {
      tool: 'get-financial-analysis',
      args: {
        symbol: stockMatch[1].toUpperCase(),
        analysisType: 'comprehensive'
      }
    };
  }
  
  // Market data commands
  if (lowerMessage.includes('market') || lowerMessage.includes('indices') || lowerMessage.includes('summary')) {
    return {
      tool: 'get-market-data',
      args: {
        symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
        dataType: 'summary'
      }
    };
  }
  
  // Financial chat/advice
  if (lowerMessage.includes('invest') || lowerMessage.includes('portfolio') || 
      lowerMessage.includes('advice') || lowerMessage.includes('should i') ||
      lowerMessage.includes('buy') || lowerMessage.includes('sell')) {
    return {
      tool: 'financial-chat',
      args: {
        message: message,
        context: 'WhatsApp financial advice'
      }
    };
  }
  
  // Help command
  if (lowerMessage.includes('help') || lowerMessage === 'hi' || lowerMessage === 'hello') {
    return {
      tool: 'echo',
      args: {
        message: `🏦 *MCP Financial Analysis Bot*

📊 *Stock Analysis* (via MCP)
• "analyze AAPL" 
• "TSLA analysis"
• "get MSFT"

📈 *Market Data* (via MCP)  
• "market summary"
• "indices"

💬 *Financial Chat* (via MCP)
• "should I invest in tech?"
• "portfolio advice"

🔧 *Powered by MCP Server*
All responses generated through Model Context Protocol

Type any command to test the MCP connection!`
      }
    };
  }
  
  // Default to financial chat
  return {
    tool: 'financial-chat',
    args: {
      message: message,
      context: 'WhatsApp general inquiry'
    }
  };
}

// Format MCP response for WhatsApp
function formatMCPResponseForWhatsApp(mcpResult: any): string {
  try {
    // Handle different MCP response formats
    if (mcpResult?.content?.[0]?.text) {
      let text = mcpResult.content[0].text;
      
      // Clean up formatting for WhatsApp
      text = text
        .replace(/#{1,6}\s/g, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '*$1*') // Bold formatting
        .replace(/```[\s\S]*?```/g, '[Technical data - view on web]') // Code blocks
        .replace(/\n{3,}/g, '\n\n'); // Reduce excessive newlines
      
      // Add MCP indicator
      text += '\n\n_🔗 Generated via MCP Server_';
      
      // Truncate if too long
      if (text.length > 4000) {
        text = text.substring(0, 3800) + '\n\n_Message truncated - use web interface for full analysis_';
      }
      
      return text;
    }
    
    // Fallback for unexpected format
    return `MCP Response received: ${JSON.stringify(mcpResult)}`;
  } catch (error) {
    console.error('Error formatting MCP response:', error);
    return 'Sorry, I received a response from MCP but couldn\'t format it properly.';
  }
}

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  console.log('🔍 Webhook verification attempt:', { mode, token, challenge });
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ WhatsApp MCP webhook verified successfully');
    return new Response(challenge, { status: 200 });
  } else {
    console.error('❌ Webhook verification failed - expected token:', VERIFY_TOKEN);
    return new Response('Verification failed', { status: 403 });
  }
}

// Handle WhatsApp messages via MCP (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📱 WhatsApp MCP webhook received:', JSON.stringify(body, null, 2));
    
    // Process WhatsApp business account messages
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const messages = change.value?.messages || [];
            
            for (const message of messages) {
              if (message.type === 'text') {
                const userMessage = message.text.body;
                const userPhone = message.from;
                
                console.log(`📨 Processing message via MCP: "${userMessage}" from ${userPhone}`);
                
                try {
                  // Parse message to determine MCP tool and arguments
                  const { tool, args } = parseMessageForMCP(userMessage);
                  
                  console.log(`🔧 Calling MCP tool: ${tool}`, args);
                  
                  // Call MCP server
                  const mcpResult = await callMCPServer('tools/call', {
                    name: tool,
                    arguments: args
                  });
                  
                  // Format response for WhatsApp
                  const response = formatMCPResponseForWhatsApp(mcpResult);
                  
                  // Send via WhatsApp
                  await sendWhatsAppMessage(userPhone, response);
                  
                  console.log(`✅ MCP response sent to ${userPhone}`);
                  
                } catch (error) {
                  console.error('❌ Error processing MCP message:', error);
                  
                  const errorMessage = `Sorry, I encountered an error processing your request via MCP server: ${error instanceof Error ? error.message : 'Unknown error'}

🔧 Try these commands:
• "help" - See available commands  
• "analyze AAPL" - Test stock analysis
• "market summary" - Test market data

_All responses powered by MCP_`;
                  
                  await sendWhatsAppMessage(userPhone, errorMessage);
                }
              }
            }
          }
        }
      }
    }
    
    return NextResponse.json({ status: 'success', mcp: true });
    
  } catch (error) {
    console.error('❌ WhatsApp MCP webhook error:', error);
    return NextResponse.json({ 
      error: 'MCP webhook error', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 