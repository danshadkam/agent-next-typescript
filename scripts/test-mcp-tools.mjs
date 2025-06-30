#!/usr/bin/env node

import https from 'https';
import http from 'http';

const baseUrl = process.argv[2] || 'http://localhost:3000';
const url = new URL('/api/mcp', baseUrl);

console.log(`🧪 Testing Financial Agent MCP Tools: ${url.href}`);

// Helper function to make HTTP requests
function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.error) {
            console.error(`❌ RPC Error: ${response.error.message}`);
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', responseData);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request failed: ${e.message}`);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Test all financial tools
async function testAllFinancialTools() {
  console.log('\n🔧 Testing all financial MCP tools...\n');

  // Test 1: Echo tool
  console.log('1️⃣ Testing echo tool...');
  try {
    const echoResponse = await makeRequest({
      jsonrpc: '2.0',
      id: 'echo-test',
      method: 'tools/call',
      params: {
        name: 'echo',
        arguments: {
          message: 'Financial Agent MCP is working!'
        }
      }
    });
    
    if (echoResponse.result?.content?.[0]?.text) {
      console.log(`✅ Echo: ${echoResponse.result.content[0].text}`);
    } else {
      console.log('❌ Echo tool failed');
    }
  } catch (error) {
    console.log(`❌ Echo tool error: ${error.message}`);
  }

  // Test 2: Financial Analysis
  console.log('\n2️⃣ Testing financial analysis tool...');
  try {
    const analysisResponse = await makeRequest({
      jsonrpc: '2.0',
      id: 'analysis-test',
      method: 'tools/call',
      params: {
        name: 'get-financial-analysis',
        arguments: {
          symbol: 'TSLA',
          analysisType: 'comprehensive'
        }
      }
    });
    
    if (analysisResponse.result?.content?.[0]?.text) {
      const text = analysisResponse.result.content[0].text;
      console.log(`✅ Analysis generated (${text.length} chars)`);
      console.log(`   Preview: ${text.substring(0, 100)}...`);
    } else {
      console.log('❌ Financial analysis failed');
    }
  } catch (error) {
    console.log(`❌ Financial analysis error: ${error.message}`);
  }

  // Test 3: Market Data
  console.log('\n3️⃣ Testing market data tool...');
  try {
    const marketResponse = await makeRequest({
      jsonrpc: '2.0',
      id: 'market-test',
      method: 'tools/call',
      params: {
        name: 'get-market-data',
        arguments: {
          symbols: ['AAPL', 'TSLA', 'GOOGL'],
          includeIndices: true
        }
      }
    });
    
    if (marketResponse.result?.content?.[0]?.text) {
      const text = marketResponse.result.content[0].text;
      console.log(`✅ Market data retrieved (${text.length} chars)`);
      console.log(`   Preview: ${text.substring(0, 100)}...`);
    } else {
      console.log('❌ Market data failed');
    }
  } catch (error) {
    console.log(`❌ Market data error: ${error.message}`);
  }

  // Test 4: Financial Chat
  console.log('\n4️⃣ Testing financial chat tool...');
  try {
    const chatResponse = await makeRequest({
      jsonrpc: '2.0',
      id: 'chat-test',
      method: 'tools/call',
      params: {
        name: 'financial-chat',
        arguments: {
          query: 'Should I invest in renewable energy stocks?',
          context: 'Looking for long-term investment opportunities',
          symbols: ['TSLA', 'ENPH']
        }
      }
    });
    
    if (chatResponse.result?.content?.[0]?.text) {
      const text = chatResponse.result.content[0].text;
      console.log(`✅ Chat response generated (${text.length} chars)`);
      console.log(`   Preview: ${text.substring(0, 100)}...`);
    } else {
      console.log('❌ Financial chat failed');
    }
  } catch (error) {
    console.log(`❌ Financial chat error: ${error.message}`);
  }

  // Test 5: Verify all tools are listed
  console.log('\n5️⃣ Verifying all tools are available...');
  try {
    const toolsResponse = await makeRequest({
      jsonrpc: '2.0',
      id: 'tools-test',
      method: 'tools/list',
      params: {}
    });
    
    if (toolsResponse.result?.tools) {
      const tools = toolsResponse.result.tools;
      const expectedTools = ['echo', 'get-financial-analysis', 'get-market-data', 'financial-chat'];
      const foundTools = tools.map(t => t.name);
      
      console.log(`✅ Found ${tools.length} tools: ${foundTools.join(', ')}`);
      
      const missing = expectedTools.filter(tool => !foundTools.includes(tool));
      if (missing.length > 0) {
        console.log(`⚠️  Missing tools: ${missing.join(', ')}`);
      } else {
        console.log('✅ All expected tools are available');
      }
    } else {
      console.log('❌ Could not list tools');
    }
  } catch (error) {
    console.log(`❌ Tools list error: ${error.message}`);
  }

  console.log('\n🎉 Financial Agent MCP tool testing complete!');
  console.log('\n💡 Next steps:');
  console.log('   - Integrate real financial APIs in the tool handlers');
  console.log('   - Connect to your existing financial analysis agents');
  console.log('   - Test with Claude Desktop or Cursor');
}

testAllFinancialTools().catch(error => {
  console.error('\n💥 Test suite failed:', error.message);
  process.exit(1);
}); 