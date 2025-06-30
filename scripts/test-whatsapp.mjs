#!/usr/bin/env node

import http from 'http';
import https from 'https';

const baseUrl = process.argv[2] || 'http://localhost:3000';
const url = new URL('/api/whatsapp', baseUrl);

console.log(`🧪 Testing WhatsApp webhook: ${url.href}`);

// Test 1: Webhook verification (GET request)
async function testWebhookVerification() {
  console.log('\n1️⃣ Testing webhook verification...');
  
  const verifyUrl = new URL(url.href);
  verifyUrl.searchParams.set('hub.mode', 'subscribe');
  verifyUrl.searchParams.set('hub.verify_token', 'financial_agent_verify_token');
  verifyUrl.searchParams.set('hub.challenge', 'test_challenge_123');
  
  try {
    const response = await makeRequest(verifyUrl.href, 'GET');
    
    if (response === 'test_challenge_123') {
      console.log('✅ Webhook verification successful');
      return true;
    } else {
      console.log('❌ Webhook verification failed:', response);
      return false;
    }
  } catch (error) {
    console.log('❌ Webhook verification error:', error.message);
    return false;
  }
}

// Test 2: Simulate WhatsApp message
async function testWhatsAppMessage() {
  console.log('\n2️⃣ Testing WhatsApp message processing...');
  
  const testMessage = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'test_entry',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550199955',
                phone_number_id: 'test_phone_id'
              },
              messages: [
                {
                  from: '15551234567',
                  id: 'test_message_id',
                  timestamp: '1234567890',
                  text: {
                    body: 'help'
                  },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };
  
  try {
    const response = await makeRequest(url.href, 'POST', testMessage);
    console.log('✅ WhatsApp message processed:', response);
    return true;
  } catch (error) {
    console.log('❌ WhatsApp message error:', error.message);
    return false;
  }
}

// Test 3: Test different message types
async function testMessageParsing() {
  console.log('\n3️⃣ Testing message parsing patterns...');
  
  const testCases = [
    { input: 'analyze AAPL', expected: 'Stock analysis for AAPL' },
    { input: 'TSLA analysis', expected: 'Stock analysis for TSLA' },
    { input: 'market summary', expected: 'Market data' },
    { input: 'help', expected: 'Help message' },
    { input: 'should I invest in tech?', expected: 'Financial chat' }
  ];
  
  for (const testCase of testCases) {
    try {
      const message = createTestMessage(testCase.input);
      const response = await makeRequest(url.href, 'POST', message);
      console.log(`✅ "${testCase.input}" → Processed`);
    } catch (error) {
      console.log(`❌ "${testCase.input}" → Error:`, error.message);
    }
  }
}

// Test 4: Check MCP server connectivity
async function testMCPConnectivity() {
  console.log('\n4️⃣ Testing MCP server connectivity...');
  
  try {
    const mcpUrl = baseUrl + '/api/mcp';
    const response = await makeRequest(mcpUrl, 'GET');
    const data = JSON.parse(response);
    
    if (data.name && data.tools) {
      console.log(`✅ MCP server connected: ${data.tools} tools available`);
      return true;
    } else {
      console.log('❌ MCP server response invalid:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ MCP server connection failed:', error.message);
    return false;
  }
}

// Helper function to create test WhatsApp message
function createTestMessage(messageText) {
  return {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'test_entry',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550199955',
                phone_number_id: 'test_phone_id'
              },
              messages: [
                {
                  from: '15551234567',
                  id: `test_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: {
                    body: messageText
                  },
                  type: 'text'
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };
}

// Helper function to make HTTP requests
function makeRequest(url, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Run all tests
async function runAllTests() {
  console.log('🧪 WhatsApp Bot Test Suite\n');
  
  const results = {
    verification: await testWebhookVerification(),
    mcp: await testMCPConnectivity(),
    message: await testWhatsAppMessage(),
    parsing: await testMessageParsing()
  };
  
  console.log('\n📊 Test Results:');
  console.log(`   Webhook Verification: ${results.verification ? '✅' : '❌'}`);
  console.log(`   MCP Server: ${results.mcp ? '✅' : '❌'}`);
  console.log(`   Message Processing: ${results.message ? '✅' : '❌'}`);
  console.log(`   Message Parsing: ${results.parsing ? '✅' : '❌'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  if (passed === total) {
    console.log(`\n🎉 All tests passed (${passed}/${total})!`);
    console.log('Your WhatsApp bot is ready to connect!');
  } else {
    console.log(`\n⚠️  ${passed}/${total} tests passed. Check the issues above.`);
  }
  
  console.log('\n💡 Next steps:');
  console.log('1. Follow the setup guide: docs/whatsapp-setup.md');
  console.log('2. Configure Meta Developer Console');
  console.log('3. Deploy to production (Vercel recommended)');
  console.log('4. Add your phone number for testing');
  console.log('5. Send "help" to your bot!');
}

runAllTests().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
}); 