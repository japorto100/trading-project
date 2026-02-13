import { NextRequest, NextResponse } from 'next/server';
import { getProviderManager } from '@/lib/providers';
import { TimeframeValue } from '@/lib/providers/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');
    const timeframe = (searchParams.get('timeframe') || '1H') as TimeframeValue;
    const limit = parseInt(searchParams.get('limit') || '300');

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    const manager = getProviderManager();
    const { data, provider } = await manager.fetchOHLCV(symbol, timeframe, limit);

    return NextResponse.json({
      success: true,
      symbol,
      timeframe,
      provider,
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error('OHLCV API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch OHLCV data' },
      { status: 500 }
    );
  }
}
