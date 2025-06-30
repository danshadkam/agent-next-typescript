#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import path from 'path';

console.log('🚀 Setting up Financial Agent MCP Server...\n');

// Check if we're in production (Vercel) or have Upstash configured
const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production';
const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

if (isProduction || hasUpstash) {
  console.log('✅ Production environment or Upstash detected - skipping local Redis setup');
  if (hasUpstash) {
    console.log('🔗 Using Upstash Redis configuration');
  }
  process.exit(0);
}

// Check for local environment file
const envPath = '.env.local';
let envContent = '';

if (existsSync(envPath)) {
  console.log('📄 Found existing .env.local file');
} else {
  console.log('📄 Creating .env.local file...');
}

// Check if Docker is available
try {
  execSync('docker --version', { stdio: 'ignore' });
  console.log('🐳 Docker detected');
} catch (error) {
  console.log('❌ Docker not found. Please install Docker to run Redis locally.');
  console.log('   Or configure Upstash Redis for cloud Redis support.');
  process.exit(1);
}

// Check if Redis container already exists
try {
  const containers = execSync('docker ps -a --format "{{.Names}}"', { encoding: 'utf8' });
  
  if (containers.includes('redis-mcp')) {
    console.log('📦 Redis container already exists');
    
    // Check if it's running
    const runningContainers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf8' });
    
    if (runningContainers.includes('redis-mcp')) {
      console.log('✅ Redis container is already running');
    } else {
      console.log('🔄 Starting existing Redis container...');
      execSync('docker start redis-mcp', { stdio: 'inherit' });
      console.log('✅ Redis container started');
    }
  } else {
    console.log('🔄 Creating and starting Redis container...');
    execSync('docker run -d --name redis-mcp -p 6379:6379 redis:7-alpine', { stdio: 'inherit' });
    console.log('✅ Redis container created and started');
  }
} catch (error) {
  console.error('❌ Failed to setup Redis container:', error.message);
  process.exit(1);
}

// Update or create .env.local with Redis URL
const redisUrl = 'REDIS_URL=redis://localhost:6379';

if (existsSync(envPath)) {
  const content = require('fs').readFileSync(envPath, 'utf8');
  if (!content.includes('REDIS_URL=')) {
    writeFileSync(envPath, content + '\n' + redisUrl + '\n');
    console.log('📝 Added REDIS_URL to .env.local');
  } else {
    console.log('✅ REDIS_URL already configured in .env.local');
  }
} else {
  writeFileSync(envPath, redisUrl + '\n');
  console.log('📝 Created .env.local with Redis configuration');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Install dependencies: pnpm install');
console.log('2. Start development server: pnpm dev');
console.log('3. Test MCP endpoints: pnpm test:http');
console.log('\n💡 To stop Redis later: docker stop redis-mcp');
console.log('💡 To remove Redis: docker rm redis-mcp'); 