import { NextRequest, NextResponse } from 'next/server';
import { getProviderManager } from '@/lib/providers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required (min 1 character)' },
        { status: 400 }
      );
    }

    const manager = getProviderManager();
    const results = await manager.searchSymbols(query);

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search symbols' },
      { status: 500 }
    );
  }
}
