#!/usr/bin/env node

import https from 'https';
import http from 'http';

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log(`🚀 WhatsApp Financial Bot Deployment Verification`);
console.log(`🔍 Testing: ${baseUrl}\n`);

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
          resolve({ status: res.statusCode, data: responseData });
        } else {
          resolve({ status: res.statusCode, data: responseData, error: true });
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

// Test webhook verification for WhatsApp
async function testWebhookVerification(endpoint, verifyToken) {
  console.log(`🔐 Testing webhook verification: ${endpoint}`);
  
  const verifyUrl = new URL(endpoint, baseUrl);
  verifyUrl.searchParams.set('hub.mode', 'subscribe');
  verifyUrl.searchParams.set('hub.verify_token', verifyToken);
  verifyUrl.searchParams.set('hub.challenge', 'test_challenge_123');
  
  try {
    const response = await makeRequest(verifyUrl.href);
    
    if (response.status === 200 && response.data === 'test_challenge_123') {
      console.log(`✅ Webhook verification successful for ${endpoint}`);
      return true;
    } else {
      console.log(`❌ Webhook verification failed for ${endpoint}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Webhook verification error for ${endpoint}: ${error.message}`);
    return false;
  }
}

// Test WhatsApp message processing
async function testWhatsAppMessage(endpoint, testMessage) {
  console.log(`📱 Testing message processing: ${endpoint}`);
  
  const whatsappMessage = {
    object: 'whatsapp_business_account',
    entry: [{
      id: 'test_entry',
      changes: [{
        value: {
          messaging_product: 'whatsapp',
          metadata: {
            display_phone_number: '15550199955',
            phone_number_id: 'test_phone_id'
          },
          messages: [{
            from: '15551234567',
            id: `test_${Date.now()}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: { body: testMessage },
            type: 'text'
          }]
        },
        field: 'messages'
      }]
    }]
  };
  
  try {
    const response = await makeRequest(new URL(endpoint, baseUrl).href, 'POST', whatsappMessage);
    
    if (response.status === 200) {
      console.log(`✅ Message processing successful for ${endpoint}`);
      return true;
    } else {
      console.log(`❌ Message processing failed for ${endpoint}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Message processing error for ${endpoint}: ${error.message}`);
    return false;
  }
}

// Test MCP server connectivity
async function testMCPServer() {
  console.log(`🔧 Testing MCP server connectivity`);
  
  try {
    // Test tools listing
    const toolsResponse = await makeRequest(new URL('/api/mcp', baseUrl).href, 'POST', {
      jsonrpc: '2.0',
      id: 'tools-test',
      method: 'tools/list',
      params: {}
    });
    
    if (toolsResponse.status === 200) {
      const data = JSON.parse(toolsResponse.data);
      if (data.result?.tools) {
        const toolNames = data.result.tools.map(t => t.name);
        console.log(`✅ MCP server running with ${toolNames.length} tools: ${toolNames.join(', ')}`);
        return true;
      }
    }
    
    console.log(`❌ MCP server tools listing failed: ${toolsResponse.status}`);
    return false;
  } catch (error) {
    console.log(`❌ MCP server error: ${error.message}`);
    return false;
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log(`🔑 Checking environment variables`);
  
  const requiredVars = [
    'WHATSAPP_ACCESS_TOKEN',
    'WHATSAPP_PHONE_NUMBER_ID', 
    'WHATSAPP_VERIFY_TOKEN'
  ];
  
  const optionalVars = [
    'OPENAI_API_KEY',
    'ALPHA_VANTAGE_API_KEY',
    'FINANCIAL_MODELING_PREP_API_KEY'
  ];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`❌ ${varName}: Missing (required for WhatsApp)`);
      allRequired = false;
    }
  });
  
  optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set (${value.substring(0, 10)}...)`);
    } else {
      console.log(`⚠️  ${varName}: Missing (optional)`);
    }
  });
  
  return allRequired;
}

// Main verification function
async function runVerification() {
  console.log(`Starting deployment verification...\n`);
  
  const results = {
    envVars: false,
    mcpServer: false,
    webhooks: {
      direct: false,
      mcp: false,
      pureMcp: false
    },
    messages: {
      direct: false,
      mcp: false,
      pureMcp: false
    }
  };
  
  // 1. Check environment variables
  console.log(`\n1️⃣ Environment Variables`);
  results.envVars = testEnvironmentVariables();
  
  // 2. Test MCP server
  console.log(`\n2️⃣ MCP Server`);
  results.mcpServer = await testMCPServer();
  
  // 3. Test webhook verifications
  console.log(`\n3️⃣ Webhook Verifications`);
  results.webhooks.direct = await testWebhookVerification('/api/webhook', 'danielverifytoken');
  results.webhooks.mcp = await testWebhookVerification('/api/whatsapp', 'financial_agent_verify_token');
  results.webhooks.pureMcp = await testWebhookVerification('/api/whatsapp-mcp', 'danielverifytoken');
  
  // 4. Test message processing
  console.log(`\n4️⃣ Message Processing`);
  results.messages.direct = await testWhatsAppMessage('/api/webhook', 'help');
  results.messages.mcp = await testWhatsAppMessage('/api/whatsapp', 'help');
  results.messages.pureMcp = await testWhatsAppMessage('/api/whatsapp-mcp', 'help');
  
  // 5. Summary
  console.log(`\n📊 DEPLOYMENT VERIFICATION SUMMARY`);
  console.log(`════════════════════════════════════`);
  console.log(`Environment Variables: ${results.envVars ? '✅ Ready' : '❌ Missing required vars'}`);
  console.log(`MCP Server: ${results.mcpServer ? '✅ Running' : '❌ Not responding'}`);
  console.log(`\nWebhook Endpoints:`);
  console.log(`• Direct (/api/webhook): ${results.webhooks.direct ? '✅' : '❌'}`);
  console.log(`• MCP (/api/whatsapp): ${results.webhooks.mcp ? '✅' : '❌'}`);
  console.log(`• Pure MCP (/api/whatsapp-mcp): ${results.webhooks.pureMcp ? '✅' : '❌'}`);
  
  console.log(`\nMessage Processing:`);
  console.log(`• Direct: ${results.messages.direct ? '✅' : '❌'}`);
  console.log(`• MCP: ${results.messages.mcp ? '✅' : '❌'}`);
  console.log(`• Pure MCP: ${results.messages.pureMcp ? '✅' : '❌'}`);
  
  const totalTests = 8;
  const passedTests = [
    results.envVars,
    results.mcpServer,
    ...Object.values(results.webhooks),
    ...Object.values(results.messages)
  ].filter(Boolean).length;
  
  console.log(`\n📈 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 ALL TESTS PASSED! Your WhatsApp bot is ready for deployment!`);
  } else if (passedTests >= 6) {
    console.log(`⚠️  Most tests passed. Check failed tests above.`);
  } else {
    console.log(`❌ Multiple issues found. Please review the setup guide.`);
  }
  
  console.log(`\n📚 Next Steps:`);
  console.log(`1. Set up your .env.local file with WhatsApp credentials`);
  console.log(`2. Test locally: npm run test:whatsapp`);
  console.log(`3. Deploy: npx vercel --prod`);
  console.log(`4. Configure webhook in Meta Developer Console`);
  
  return passedTests === totalTests;
}

// Run the verification
runVerification().catch(console.error); 