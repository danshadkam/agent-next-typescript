import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface ArticleSummaryRequest {
  title: string;
  summary: string;
  source: string;
  symbol?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface ArticleSummaryResponse {
  original: ArticleSummaryRequest;
  enhanced: {
    title: string;
    engaging_summary: string;
    key_takeaways: string[];
    market_impact: string;
    investor_action: string;
    fun_fact?: string;
    emoji_sentiment: string;
  };
  newsletter_style: {
    headline: string;
    tldr: string;
    why_it_matters: string;
    bottom_line: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const articleData: ArticleSummaryRequest = await request.json();
    
    console.log(`📝 Summarizing article: ${articleData.title.substring(0, 50)}...`);
    
    // Generate enhanced, engaging summary using AI
    const result = await generateText({
      model: openai('gpt-4o'),
      system: `You are a financial newsletter writer who makes complex market news fun and accessible. 

Your job is to transform dry financial news into engaging, newsletter-style content that readers actually want to read.

WRITING STYLE:
- Conversational and approachable, but still professional
- Use analogies and metaphors to explain complex concepts
- Add personality and humor where appropriate
- Write like you're explaining to a smart friend over coffee
- Keep it concise but informative
- Use emojis strategically for engagement

OUTPUT REQUIREMENTS:
You must respond with valid JSON containing:
{
  "enhanced": {
    "title": "A more engaging version of the headline",
    "engaging_summary": "A 2-3 sentence summary that's easy to read and engaging",
    "key_takeaways": ["3-4 bullet points of the most important info"],
    "market_impact": "How this affects the stock/market in plain English",
    "investor_action": "What investors should consider (if anything)",
    "fun_fact": "An interesting tidbit or context (optional)",
    "emoji_sentiment": "📈 for positive, 📉 for negative, 📊 for neutral"
  },
  "newsletter_style": {
    "headline": "A catchy, newsletter-style headline",
    "tldr": "One sentence TL;DR",
    "why_it_matters": "Why readers should care about this",
    "bottom_line": "The key takeaway in plain English"
  }
}

TONE EXAMPLES:
- Instead of "Q3 earnings exceeded analyst expectations" → "The company crushed it this quarter"
- Instead of "regulatory headwinds" → "red tape is slowing things down"
- Instead of "market volatility" → "the market's been on a roller coaster"

Focus on making financial news accessible and engaging while staying accurate.`,
      prompt: `Transform this financial news article into engaging newsletter content:

Title: ${articleData.title}
Summary: ${articleData.summary}
Source: ${articleData.source}
Symbol: ${articleData.symbol || 'Market'}
Sentiment: ${articleData.sentiment || 'neutral'}

Make it engaging, informative, and fun to read while keeping the financial accuracy.`
    });

    let enhancedContent;
    try {
      enhancedContent = JSON.parse(result.text);
    } catch (parseError) {
      console.error('JSON parsing failed, creating fallback response');
      // Fallback if AI doesn't return proper JSON
      enhancedContent = {
        enhanced: {
          title: articleData.title,
          engaging_summary: articleData.summary,
          key_takeaways: [
            'Key development in the market',
            'Impact on stock performance',
            'Investor considerations'
          ],
          market_impact: 'Market reaction pending further analysis',
          investor_action: 'Monitor for developments',
          emoji_sentiment: articleData.sentiment === 'positive' ? '📈' : 
                          articleData.sentiment === 'negative' ? '📉' : '📊'
        },
        newsletter_style: {
          headline: articleData.title,
          tldr: 'Market news requiring attention',
          why_it_matters: 'Potential impact on investment decisions',
          bottom_line: 'Stay informed and monitor developments'
        }
      };
    }

    const response: ArticleSummaryResponse = {
      original: articleData,
      enhanced: enhancedContent.enhanced,
      newsletter_style: enhancedContent.newsletter_style
    };

    console.log(`✅ Successfully summarized article with enhanced content`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Article summarization error:', error);
    
    return NextResponse.json({
      error: 'Failed to summarize article',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test');
  
  if (test === 'true') {
    // Return a test summary
    const testResponse: ArticleSummaryResponse = {
      original: {
        title: 'Apple Inc. Reports Strong Q4 Earnings',
        summary: 'Apple exceeded analyst expectations with strong iPhone sales and services revenue growth.',
        source: 'Reuters',
        symbol: 'AAPL',
        sentiment: 'positive'
      },
      enhanced: {
        title: '🍎 Apple Crushes Q4 Earnings - iPhone Sales on Fire!',
        engaging_summary: 'Apple just dropped some seriously impressive numbers for Q4. iPhone sales were hotter than expected, and their services business (think App Store, iCloud) keeps growing like crazy.',
        key_takeaways: [
          '📱 iPhone sales beat expectations by a mile',
          '💰 Services revenue hit new highs',
          '📈 Stock likely to pop on this news',
          '🎯 Management sounds confident about holidays'
        ],
        market_impact: 'This is the kind of earnings beat that makes investors do a happy dance. Strong iPhone sales usually mean Apple stock goes brrrr.',
        investor_action: 'Long-term Apple holders are probably smiling right now. New investors might want to wait for a dip.',
        fun_fact: 'Apple now makes more money from services than many entire companies are worth!',
        emoji_sentiment: '📈'
      },
      newsletter_style: {
        headline: '🍎 Apple Serves Up a Delicious Earnings Beat',
        tldr: 'Apple crushed Q4 expectations with stellar iPhone sales and growing services.',
        why_it_matters: 'Apple is the most valuable company in the world, so when they do well, the whole market usually follows.',
        bottom_line: 'Apple proves once again why it\'s a long-term winner - innovation pays off.'
      }
    };
    
    return NextResponse.json(testResponse);
  }
  
  return NextResponse.json({
    message: 'Article Summarizer API - POST to summarize articles',
    test_url: '/api/article-summarizer?test=true'
  });
} 