import { NextRequest, NextResponse } from 'next/server';
import { getProviderManager } from '@/lib/providers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const symbols = searchParams.get('symbols');

    const manager = getProviderManager();

    // Multiple quotes
    if (symbols) {
      const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);
      const quotes = await manager.getQuotes(symbolList);
      
      const results: Record<string, any> = {};
      quotes.forEach((quote, sym) => {
        results[sym] = quote;
      });

      return NextResponse.json({
        success: true,
        count: quotes.size,
        quotes: results,
      });
    }

    // Single quote
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const { data, provider } = await manager.getQuote(symbol);

    return NextResponse.json({
      success: true,
      symbol,
      provider,
      quote: data,
    });
  } catch (error: any) {
    console.error('Quote API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}
