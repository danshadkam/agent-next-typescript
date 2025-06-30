# Financial Agent MCP Configuration Guide

This guide helps you configure the Financial Agent MCP server with AI tools like Claude Desktop and Cursor.

## 🔧 Configuration for AI Tools

### Claude Desktop Configuration

#### For Local Development
Edit your Claude Desktop configuration file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "financial-agent": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

#### For Production (After Deployment)
```json
{
  "mcpServers": {
    "financial-agent": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-deployed-app.vercel.app/api/mcp"
      ]
    }
  }
}
```

### Cursor Configuration

#### For Local Development
Edit your Cursor configuration:

**For Cursor 0.48.0 or later (Direct SSE):**
```json
{
  "mcpServers": {
    "financial-agent": {
      "url": "http://localhost:3000/api/sse"
    }
  }
}
```

**For older Cursor versions:**
```json
{
  "mcpServers": {
    "financial-agent": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:3000/api/mcp"
      ]
    }
  }
}
```

#### For Production (After Deployment)
**For Cursor 0.48.0 or later:**
```json
{
  "mcpServers": {
    "financial-agent": {
      "url": "https://your-deployed-app.vercel.app/api/sse"
    }
  }
}
```

## 🚀 Available Tools

Your Financial Agent MCP server provides these tools:

1. **echo** - Test tool for verification
2. **get-financial-analysis** - Comprehensive financial analysis
3. **get-market-data** - Real-time market data retrieval
4. **financial-chat** - Interactive financial assistant

## 🏃 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup local environment:**
   ```bash
   npm run setup
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test the MCP server:**
   ```bash
   npm run test:http    # Test HTTP transport
   npm run test:sse     # Test SSE transport (requires Redis)
   npm run test:mcp     # Test all financial tools
   ```

## 🔍 Testing

Use these commands to verify your MCP server:

- `npm run test:http` - Test HTTP endpoints
- `npm run test:sse` - Test SSE endpoints (requires Redis)
- `npm run test:stdio` - Test CLI interface
- `npm run test:mcp` - Test all financial tools

## 🔧 Environment Variables

### Development (Local Redis)
```bash
REDIS_URL=redis://localhost:6379
```

### Production (Upstash Redis)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

## 📱 Integration Tips

### Claude Desktop
- After configuration, restart Claude Desktop completely
- Look for the tools icon (🔨) in Claude Desktop
- Test with: "Help me analyze Apple stock using the financial tools"

### Cursor
- For best performance, use direct SSE connection with Cursor 0.48.0+
- Restart Cursor after configuration changes
- The MCP tools will appear in Cursor's agent capabilities

## 🚀 Deployment to Vercel

1. **Configure Upstash Redis:**
   ```bash
   vercel link
   vercel env pull .env.development.local
   ```

2. **Deploy:**
   ```bash
   vercel deploy
   ```

3. **Update AI tool configurations** with your Vercel deployment URL

## 🔧 Troubleshooting

### Tools Not Appearing
- Check AI tool configuration file syntax
- Ensure the server is running on the correct port
- Restart the AI tool completely
- Check server logs for errors

### SSE Transport Issues
- Ensure Redis is configured (local or Upstash)
- Check Redis connection in server logs
- For local development, verify Docker Redis container is running

### Connection Errors
- Verify the server URL is accessible
- Check firewall settings for local development
- Ensure the correct transport endpoint (/api/mcp or /api/sse)

## 🎯 Testing Your Setup

Once configured, you can test the MCP server integration:

1. **Direct API Test:**
   ```bash
   curl http://localhost:3000/api/mcp
   ```

2. **Tool Testing:**
   ```bash
   npm run test:mcp
   ```

3. **In Claude Desktop or Cursor:**
   - Ask: "List the available financial tools"
   - Try: "Use the echo tool to say hello"
   - Test: "Analyze AAPL stock using the financial analysis tool" 