#!/usr/bin/env node

import https from 'https';
import http from 'http';

const baseUrl = process.argv[2] || 'http://localhost:3000';
const url = new URL('/api/mcp', baseUrl);

console.log(`🧪 Testing MCP HTTP endpoint: ${url.href}`);

// Test 1: List tools
async function testListTools() {
  console.log('\n📋 Testing tools/list...');
  
  const response = await makeRequest({
    jsonrpc: '2.0',
    id: 'test-1',
    method: 'tools/list',
    params: {}
  });
  
  if (response.result?.tools) {
    console.log(`✅ Found ${response.result.tools.length} tools:`);
    response.result.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    return response.result.tools;
  } else {
    console.error('❌ No tools found in response');
    return [];
  }
}

// Test 2: Echo tool
async function testEchoTool() {
  console.log('\n🔊 Testing echo tool...');
  
  const response = await makeRequest({
    jsonrpc: '2.0',
    id: 'test-2',
    method: 'tools/call',
    params: {
      name: 'echo',
      arguments: {
        message: 'Hello from Financial Agent MCP!'
      }
    }
  });
  
  if (response.result?.content) {
    console.log('✅ Echo tool response:');
    response.result.content.forEach(item => {
      console.log(`   ${item.text}`);
    });
  } else {
    console.error('❌ Echo tool failed');
  }
}

// Test 3: Financial analysis tool
async function testFinancialAnalysis() {
  console.log('\n📈 Testing financial analysis tool...');
  
  const response = await makeRequest({
    jsonrpc: '2.0',
    id: 'test-3',
    method: 'tools/call',
    params: {
      name: 'get-financial-analysis',
      arguments: {
        query: 'AAPL',
        analysisType: 'stock'
      }
    }
  });
  
  if (response.result?.content) {
    console.log('✅ Financial analysis response:');
    response.result.content.forEach(item => {
      console.log(`   ${item.text.substring(0, 100)}...`);
    });
  } else {
    console.error('❌ Financial analysis tool failed');
  }
}

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

// Run all tests
async function runTests() {
  try {
    const tools = await testListTools();
    if (tools.length > 0) {
      await testEchoTool();
      await testFinancialAnalysis();
    }
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    process.exit(1);
  }
}

runTests(); 