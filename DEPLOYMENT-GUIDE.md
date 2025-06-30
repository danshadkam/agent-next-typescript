# 🚀 WhatsApp Financial Bot - Deployment Guide

This guide walks you through deploying your WhatsApp financial analysis bot. Your codebase is already fully prepared!

## ✅ **What's Already Set Up**

Your project includes:
- ✅ 3 WhatsApp webhook implementations
- ✅ Complete MCP financial analysis server  
- ✅ Vercel deployment configuration
- ✅ Test scripts and verification tools
- ✅ Middleware for webhook protection bypass

## 📋 **Quick Deployment Checklist**

### 1. **Environment Setup** (5 minutes)

```bash
# Copy the environment template
cp .env.local.example .env.local

# Edit .env.local with your credentials:
# - WHATSAPP_ACCESS_TOKEN (from Meta Developer Console)
# - WHATSAPP_PHONE_NUMBER_ID (from Meta Developer Console)  
# - WHATSAPP_VERIFY_TOKEN (your custom token)
# - OPENAI_API_KEY (for AI financial chat)
```

### 2. **Get WhatsApp Credentials** (10 minutes)

1. **Meta Developer Account**: [developers.facebook.com](https://developers.facebook.com)
2. **Create WhatsApp Business App**
3. **Get Access Token**: Copy from API Setup (starts with `EAA...`)
4. **Get Phone Number ID**: Copy numeric ID from API Setup
5. **Set Verify Token**: Create your own (e.g., `financial_bot_verify_123`)

### 3. **Test Locally** (2 minutes)

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Test all systems (in another terminal)
npm run verify:deployment

# Test individual components
npm run test:mcp          # Test MCP financial tools
npm run test:whatsapp     # Test WhatsApp webhooks
```

### 4. **Deploy to Production** (2 minutes)

```bash
# Deploy to Vercel
npx vercel --prod

# Test production deployment
npm run verify:prod
```

### 5. **Configure Meta Webhook** (3 minutes)

1. Go to **WhatsApp > Configuration** in Meta Developer Console
2. **Webhook URL**: `https://your-app.vercel.app/api/webhook`
3. **Verify Token**: Your `WHATSAPP_VERIFY_TOKEN`
4. **Subscribe to**: `messages` and `message_status`

### 6. **Test Your Bot** (1 minute)

Text your WhatsApp bot number:
- `analyze AAPL` - Stock analysis
- `market summary` - Market data  
- `help` - Bot commands

## 🔧 **Available Webhook Endpoints**

Your deployment includes 3 webhook options:

| Endpoint | Description | Best For |
|----------|-------------|----------|
| `/api/webhook` | Direct financial analysis | Fast responses |
| `/api/whatsapp` | MCP server integration | Full feature set |
| `/api/whatsapp-mcp` | Pure MCP implementation | MCP development |

**Recommended**: Use `/api/webhook` for production (fastest, most reliable)

## 🧪 **Testing Commands**

```bash
# Test everything locally
npm run verify:deployment

# Test production deployment  
npm run verify:prod

# Test specific components
npm run test:mcp          # MCP server tools
npm run test:whatsapp     # WhatsApp webhooks
npm run test:all          # All tests
```

## 🔑 **Environment Variables Reference**

**Required for WhatsApp:**
```env
WHATSAPP_ACCESS_TOKEN=EAAxxxxx     # From Meta Developer Console
WHATSAPP_PHONE_NUMBER_ID=123456    # From Meta Developer Console  
WHATSAPP_VERIFY_TOKEN=your_token   # Your custom verification token
```

**Required for AI Chat:**
```env
OPENAI_API_KEY=sk-xxxxx           # For financial chat responses
```

**Financial APIs** (already configured in Vercel):
- `ALPHA_VANTAGE_API_KEY`
- `FINANCIAL_MODELING_PREP_API_KEY`
- `NEWS_API_KEY`

## 🎯 **Bot Commands Reference**

**Stock Analysis:**
- `analyze AAPL`
- `TSLA analysis`  
- `get MSFT`

**Market Data:**
- `market summary`
- `indices`

**Financial Chat:**
- `should I invest in tech stocks?`
- `portfolio advice`
- `risk analysis for my portfolio`

**Help:**
- `help`
- `hi`

## 🚨 **Troubleshooting**

### Bot Not Responding
```bash
# 1. Check webhook verification
curl "https://your-app.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test"

# 2. Check MCP server
npm run test:mcp

# 3. Check environment variables
npm run verify:deployment
```

### Webhook Verification Failed
- ✅ Check `WHATSAPP_VERIFY_TOKEN` matches Meta console
- ✅ Ensure webhook URL is publicly accessible
- ✅ Verify Vercel deployment succeeded

### Messages Not Sending
- ✅ Check `WHATSAPP_ACCESS_TOKEN` is valid
- ✅ Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
- ✅ Add test phone number in Meta Developer Console

## 📊 **Monitoring & Analytics**

```bash
# View real-time logs
npx vercel logs your-app --follow

# Monitor webhook requests
# Check Vercel dashboard for function invocations

# Test financial data APIs
npm run test:mcp
```

## 🔒 **Security & Best Practices**

- ✅ **Webhook verification** implemented
- ✅ **Environment variables** secured  
- ✅ **Rate limiting** configured
- ✅ **Error handling** implemented
- ✅ **Input validation** for financial queries

## 🎉 **Success Checklist**

- [ ] Environment variables configured
- [ ] Local tests passing (`npm run verify:deployment`)
- [ ] Deployed to Vercel
- [ ] Production tests passing (`npm run verify:prod`)
- [ ] Webhook configured in Meta Developer Console
- [ ] Test phone number added to Meta console
- [ ] Bot responding to test messages

## 📞 **Support & Next Steps**

**If everything works:**
- Add more test phone numbers in Meta console
- Submit app for review (for unlimited messaging)
- Add custom business logic
- Implement conversation memory

**If you need help:**
1. Check deployment logs: `npx vercel logs`
2. Run verification: `npm run verify:deployment`
3. Test individual components: `npm run test:mcp`

---

**🎯 Total deployment time: ~20 minutes**

Your WhatsApp financial analysis bot is production-ready! 🚀 