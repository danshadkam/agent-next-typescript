# 📱 WhatsApp Financial Bot Setup Guide

This guide will help you set up a WhatsApp bot that connects to your existing MCP financial server.

## 🎯 **What You'll Build**

Text "analyze AAPL" to your WhatsApp → Get comprehensive stock analysis back instantly!

## 📋 **Prerequisites**

- ✅ Your MCP server is running (`npm run dev`)
- ✅ Meta Developer Account (free)
- ✅ Phone number for testing
- ✅ Internet connection for webhooks

## 🚀 **Step 1: Meta Developer Setup**

### 1.1 Create Meta Developer Account
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Get Started" and login with Facebook/Meta account
3. Accept developer terms

### 1.2 Create WhatsApp Business App
1. Click "Create App"
2. Select "Business" as app type
3. Fill in app details:
   - **App Name**: "Financial Analysis Bot"
   - **Email**: Your email
   - **Business Account**: Create new or select existing

### 1.3 Add WhatsApp Product
1. In your app dashboard, find "WhatsApp" 
2. Click "Set up" next to WhatsApp Business API
3. Select your Business Portfolio

## 🔑 **Step 2: Get Credentials**

### 2.1 Get Access Token
1. In WhatsApp > API Setup
2. Copy the **Temporary Access Token** (starts with `EAA...`)
3. Save this - you'll need it later

### 2.2 Get Phone Number ID
1. In the same API Setup section
2. Under "From", copy the **Phone Number ID** (numeric ID)
3. Note the actual phone number (this is your bot's number)

### 2.3 Create Verify Token
1. This can be any string you choose
2. Suggestion: `financial_agent_verify_${Date.now()}`
3. Keep it secure and memorable

## 🌐 **Step 3: Configure Environment Variables**

Add these to your `.env.local` file:

```bash
# WhatsApp Cloud API Configuration
WHATSAPP_ACCESS_TOKEN=EAA... # Your temporary access token from Step 2.1
WHATSAPP_PHONE_NUMBER_ID=123456789  # Phone Number ID from Step 2.2
WHATSAPP_VERIFY_TOKEN=financial_agent_verify_123  # Your chosen verify token
```

## 🔗 **Step 4: Deploy Webhook (Choose One)**

### Option A: Vercel (Recommended)
```bash
vercel --prod
```
Your webhook URL: `https://your-app.vercel.app/api/whatsapp`

### Option B: ngrok (Local Testing)
```bash
# Install ngrok first: brew install ngrok
ngrok http 3000
```
Your webhook URL: `https://abc123.ngrok.io/api/whatsapp`

### Option C: Tunnelmole (Free Alternative)
```bash
npx tunnelmole 3000
```

## 📞 **Step 5: Configure Webhook in Meta**

1. Go back to WhatsApp > Configuration in Meta Developer Console
2. Click "Edit" next to Webhook
3. Enter your webhook URL: `https://your-domain.com/api/whatsapp`
4. Enter your **Verify Token** from Step 2.3
5. Click "Verify and Save"

### Subscribe to Webhook Fields
Check these boxes:
- ✅ `messages`
- ✅ `message_status`

## 🧪 **Step 6: Test Your Bot**

### 6.1 Add Test Number
1. In WhatsApp > API Setup
2. Click "Manage" next to "To" field
3. Add your phone number for testing

### 6.2 Send Test Messages
Text your bot's number with:

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

**Help:**
- `help`
- `hi`

## 🎉 **Example Conversation**

```
You: analyze AAPL
Bot: 📊 Financial Analysis: AAPL

*Apple Inc* (AAPL)
• Price: $201.08 (+0.04%)
• Volume: 73,188,571
• Market Cap: $3003.29B
• P/E Ratio: 31.37

*Risk Analysis:*
• Risk Rating: High
• Beta: 1.80
• Volatility: 38.6%

*Technical Analysis:*
• Trend: Neutral
• Recommendation: Hold
• RSI: 50.0

*Analysis generated at 2024-06-30T10:15:32Z*
```

## 🔧 **Step 7: Go Production (Optional)**

### 7.1 Get Permanent Token
1. In Meta Developer Console, go to App Settings > Basic
2. Note your **App ID** and **App Secret**
3. Generate long-lived token using Facebook's token exchange

### 7.2 Submit for Review
1. Add business verification
2. Submit app for WhatsApp Business API review
3. This allows unlimited messaging (otherwise 1000 msgs/day)

## 🚨 **Troubleshooting**

### Webhook Not Receiving Messages
- ✅ Check webhook URL is accessible
- ✅ Verify token matches exactly
- ✅ Check server logs: `npm run dev`
- ✅ Test webhook: `curl -X GET "your-webhook-url?hub.mode=subscribe&hub.verify_token=your-token&hub.challenge=test"`

### Bot Not Responding
- ✅ Check MCP server is running: `http://localhost:3000/api/mcp`
- ✅ Check environment variables are set
- ✅ Check server logs for errors

### Messages Not Sending
- ✅ Verify access token is valid
- ✅ Check phone number ID is correct
- ✅ Ensure test number is added in Meta console

## 📊 **Usage Analytics**

Monitor your bot usage:
```bash
# View webhook logs
npm run dev

# Test MCP server directly
npm run test:mcp

# Check WhatsApp message logs in Meta Developer Console
```

## 🔒 **Security Best Practices**

1. **Rotate tokens regularly**
2. **Use environment variables** (never commit tokens)
3. **Validate webhook signatures** (recommended for production)
4. **Rate limit API calls** to prevent abuse
5. **Monitor usage** in Meta Developer Console

## 🚀 **Next Steps**

- Add image/chart responses
- Implement conversation memory
- Add portfolio tracking
- Create custom alerts
- Multi-language support

---

## 💬 **Support**

If you run into issues:
1. Check Meta Developer Console logs
2. Review server logs (`npm run dev`)
3. Test MCP server independently (`npm run test:mcp`)
4. Verify environment variables are set correctly

**Your bot is now ready to provide financial analysis via WhatsApp! 🎉** 