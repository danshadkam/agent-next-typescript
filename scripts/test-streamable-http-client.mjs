#!/usr/bin/env node

import https from 'https';
import http from 'http';

const baseUrl = process.argv[2] || 'http://localhost:3000';
const url = new URL('/api/sse', baseUrl);

console.log(`🧪 Testing MCP SSE endpoint: ${url.href}`);

// Helper function to make SSE requests
function makeSSERequest(data) {
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
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = client.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      let buffer = '';
      let result = null;

      res.on('data', (chunk) => {
        buffer += chunk.toString();
        
        // Parse SSE data
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last partial line
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.jsonrpc && data.id === 'test') {
                result = data;
              }
            } catch (e) {
              console.log('📡 SSE data:', line.slice(6));
            }
          }
        }
      });
      
      res.on('end', () => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('No valid JSON-RPC response received'));
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

// Test 1: List tools via SSE
async function testSSEListTools() {
  console.log('\n📋 Testing SSE tools/list...');
  
  try {
    const response = await makeSSERequest({
      jsonrpc: '2.0',
      id: 'test',
      method: 'tools/list',
      params: {}
    });
    
    if (response.result?.tools) {
      console.log(`✅ Found ${response.result.tools.length} tools via SSE:`);
      response.result.tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      return response.result.tools;
    } else {
      console.error('❌ No tools found in SSE response');
      return [];
    }
  } catch (error) {
    if (error.message.includes('ECONNREFUSED') || error.message.includes('503')) {
      console.log('⚠️  SSE endpoint not available (Redis required)');
      console.log('   This is normal if Redis is not configured');
      return [];
    }
    throw error;
  }
}

// Test 2: Echo tool via SSE
async function testSSEEchoTool() {
  console.log('\n🔊 Testing SSE echo tool...');
  
  const response = await makeSSERequest({
    jsonrpc: '2.0',
    id: 'test',
    method: 'tools/call',
    params: {
      name: 'echo',
      arguments: {
        message: 'Hello from SSE Financial Agent MCP!'
      }
    }
  });
  
  if (response.result?.content) {
    console.log('✅ SSE Echo tool response:');
    response.result.content.forEach(item => {
      console.log(`   ${item.text}`);
    });
  } else {
    console.error('❌ SSE Echo tool failed');
  }
}

// Test 3: Financial chat via SSE
async function testSSEFinancialChat() {
  console.log('\n💬 Testing SSE financial chat...');
  
  const response = await makeSSERequest({
    jsonrpc: '2.0',
    id: 'test',
    method: 'tools/call',
    params: {
      name: 'financial-chat',
      arguments: {
        query: 'What are the current market trends?',
        context: 'Looking for general market overview',
        symbols: ['AAPL', 'TSLA']
      }
    }
  });
  
  if (response.result?.content) {
    console.log('✅ SSE Financial chat response:');
    response.result.content.forEach(item => {
      console.log(`   ${item.text.substring(0, 150)}...`);
    });
  } else {
    console.error('❌ SSE Financial chat failed');
  }
}

// Run all SSE tests
async function runSSETests() {
  try {
    const tools = await testSSEListTools();
    if (tools.length > 0) {
      await testSSEEchoTool();
      await testSSEFinancialChat();
      console.log('\n🎉 All SSE tests completed!');
    } else {
      console.log('\n⚠️  SSE tests skipped (endpoint not available)');
    }
  } catch (error) {
    console.error('\n💥 SSE test failed:', error.message);
    if (error.message.includes('Redis') || error.message.includes('503')) {
      console.log('💡 Tip: SSE transport requires Redis. Run `pnpm setup` to configure local Redis.');
    }
    process.exit(1);
  }
}

runSSETests(); 