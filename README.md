# Financial Analyst AI - Professional Trading Intelligence

A comprehensive **AI-powered financial analysis platform** built with Next.js, TypeScript, and OpenAI's GPT-4. Features real-time market data, advanced charting, news sentiment analysis, and professional-grade financial intelligence.

## 🚀 Features

### 📊 **Advanced Market Analysis**
- **Real-time Market Data**: Live stock prices, volume, and market cap data
- **Interactive Charts**: Professional trading charts with 18 time periods (5M to MAX)
- **Technical Indicators**: RSI, MACD, moving averages, and trading signals
- **Candlestick Charts**: Professional-grade price action visualization
- **Market Widgets**: Top movers, portfolio tracker, crypto tracker, economic calendar

### 🤖 **AI-Powered Financial Intelligence**
- **GPT-4 Financial Agent**: Comprehensive stock analysis and investment insights
- **Technical Analysis**: Automated RSI, MACD, and momentum indicator analysis
- **Risk Assessment**: Beta calculation, volatility metrics, and risk scoring
- **Price Targets**: AI-generated price predictions with confidence intervals
- **Investment Recommendations**: Buy/Hold/Sell suggestions with detailed reasoning

### 📰 **News Sentiment Analysis**
- **Real-time News Feed**: Live market news with sentiment scoring
- **Newsletter-style Summaries**: AI-enhanced article breakdowns
- **Market Impact Analysis**: How news affects stock performance
- **Multiple Sources**: Reuters, Bloomberg, MarketWatch, and more
- **Sentiment Tracking**: Positive/negative/neutral sentiment with confidence scores

### 💼 **Professional Trading Interface**
- **Dark Theme**: Professional trading terminal aesthetic
- **Multi-symbol Tracking**: Monitor multiple stocks simultaneously
- **Quick Actions**: Instant analysis for popular stocks
- **Market Overview**: Real-time indices and market status
- **Portfolio Management**: Track holdings and performance

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **AI/ML**: OpenAI GPT-4o for financial analysis
- **Styling**: Tailwind CSS with professional dark theme
- **Icons**: Lucide React
- **Data**: Real-time financial data APIs
- **Charts**: Custom React components with interactive visualizations

## 📋 Prerequisites

Before setting up this project, you'll need:

1. **Node.js** (v18 or higher)
2. **npm** or **pnpm**: [Install pnpm](https://pnpm.io/installation) (recommended)
3. **OpenAI API Key**: [Get one here](https://platform.openai.com/api-keys)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd agent-next-typescript
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   touch .env.local
   ```

   Add your OpenAI API key:

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # App Configuration (for production)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

## 🔑 Environment Variables Setup

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Give your key a name (e.g., "financial-analyst-ai")
5. Copy the generated key immediately
6. In your `.env.local` file, replace `your_openai_api_key_here` with your actual key:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ```

**Important**: The `.env.local` file is automatically ignored by git, keeping your API keys secure.

## 🚀 Getting Started

1. **Start the development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

2. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Access the Financial Analyst**
   - Visit the homepage to see the landing page
   - Go to `/financial` to access the main Financial Analyst dashboard
   - Start analyzing stocks by searching for symbols (AAPL, MSFT, GOOGL, etc.)

## 🏗️ Application Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FINANCIAL ANALYST APP                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   / (Home)      │    │  /financial     │    │   /vectorize    │         │
│  │   page.tsx      │    │   page.tsx      │    │   page.tsx      │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                          │                                                 │
│                          ▼                                                 │
│                    ┌─────────────────┐                                     │
│                    │financial-analyst│                                     │
│                    │     .tsx        │                                     │
│                    │ (Main Dashboard)│                                     │
│                    └─────────────────┘                                     │
│                          │                                                 │
│                    ┌─────────────────┐    ┌─────────────────┐               │
│                    │   new-chart     │    │sources-display  │               │
│                    │     .tsx        │    │     .tsx        │               │
│                    │(Interactive     │    │(News Display)   │               │
│                    │    Charts)      │    │                 │               │
│                    └─────────────────┘    └─────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
                             │                     │
                             ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│    │/api/financial-  │  │/api/news-       │  │/api/market-     │           │
│    │   agent         │  │  sentiment      │  │   data          │           │
│    │  route.ts       │  │  route.ts       │  │  route.ts       │           │
│    │(AI Analysis)    │  │(News Analysis)  │  │(Market Data)    │           │
│    └─────────────────┘  └─────────────────┘  └─────────────────┘           │
│            │                     │                     │                    │
│            ▼                     ▼                     ▼                    │
│    ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│    │ OpenAI GPT-4o   │  │ Sentiment AI    │  │ Financial APIs  │           │
│    │ • Stock Analysis│  │ • News Parsing  │  │ • Real-time Data│           │
│    │ • Technical     │  │ • Article       │  │ • Market Indices│           │
│    │   Indicators    │  │   Enhancement   │  │ • Stock Prices  │           │
│    │ • Risk Analysis │  │ • Source        │  │ • Volume Data   │           │
│    └─────────────────┘  │   Credibility   │  └─────────────────┘           │
│                         └─────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
                             │                     │
                             ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│    ┌─────────────────┐                    ┌─────────────────┐               │
│    │FinancialData    │                    │ RetrievalService│               │
│    │   Service       │                    │ (/lib/retrieval)│               │
│    │(/lib/financial- │                    └─────────────────┘               │
│    │     data)       │                                                     │
│    │ • Market Data   │                                                     │
│    │ • Technical     │                                                     │
│    │   Analysis      │                                                     │
│    │ • Risk Metrics  │                                                     │
│    └─────────────────┘                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📈 Key Features Breakdown

### Interactive Charts (`/components/new-chart.tsx`)
- **18 Time Periods**: 5M, 15M, 30M, 1H, 4H, 1D, 3D, 5D, 1W, 2W, 1M, 3M, 6M, YTD, 1Y, 2Y, 5Y, MAX
- **Chart Types**: Candlestick, Line, Area, Volume
- **Technical Indicators**: RSI, MACD, Bollinger Bands
- **Real-time Updates**: Live price movements and volume

### AI Financial Agent (`/api/financial-agent/route.ts`)
- **Multi-step Analysis**: Comprehensive stock evaluation
- **Tool Integration**: Market data, technical analysis, risk assessment
- **Streaming Responses**: Real-time AI analysis delivery
- **News Integration**: Automatic news sentiment analysis

### News Sentiment Engine (`/api/news-sentiment/route.ts`)
- **Real-time Articles**: Live market news from major sources
- **Sentiment Scoring**: AI-powered positive/negative/neutral classification
- **Enhanced Summaries**: Newsletter-style article breakdowns
- **Market Impact**: Analysis of how news affects stock performance

### Market Data Service (`/lib/financial-data.ts`)
- **Real-time Prices**: Current stock prices and market data
- **Technical Indicators**: RSI, MACD, moving averages
- **Risk Metrics**: Beta, volatility, VaR calculations
- **Multi-symbol Support**: Track multiple stocks simultaneously

## 🎯 Usage Examples

### Basic Stock Analysis
```typescript
// Search for a stock symbol
// The AI will provide comprehensive analysis including:
// - Current price and volume
// - Technical indicators (RSI, MACD)
// - Recent news sentiment
// - Buy/Hold/Sell recommendation
```

### Technical Analysis
```typescript
// Get detailed technical analysis
// - RSI levels (overbought/oversold)
// - MACD signals (bullish/bearish)
// - Moving average trends
// - Support and resistance levels
```

### News Sentiment
```typescript
// Real-time news analysis
// - Latest market news
// - Sentiment scoring
// - Market impact assessment
// - Article summaries
```

## 🛡️ Security & Best Practices

- **Environment Variables**: API keys stored securely in `.env.local`
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Rate Limiting**: Intelligent API call management
- **Data Validation**: Zod schemas for API validation

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add your `OPENAI_API_KEY` to Vercel environment variables
   - Deploy automatically on push

3. **Environment Variables in Vercel**
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## 📊 API Endpoints

- **GET `/api/market-data`** - Real-time market data
- **POST `/api/financial-agent`** - AI-powered financial analysis
- **GET `/api/news-sentiment?symbol=AAPL`** - News sentiment analysis
- **POST `/api/chat`** - General AI chat interface

## 🎨 Customization

### Adding New Stocks
Modify `/lib/consts.ts` to add new stock symbols to quick actions.

### Styling
The app uses Tailwind CSS with a professional dark theme. Customize colors in `/app/globals.css`.

### AI Prompts
Modify the system prompts in `/api/financial-agent/route.ts` to adjust AI behavior.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support, please create an issue in the GitHub repository or contact the development team.

---

**Disclaimer**: This application is for educational and informational purposes only. It should not be considered as financial advice. Always consult with a qualified financial advisor before making investment decisions.
