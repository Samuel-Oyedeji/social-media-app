import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const serpApiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY;

  if (!query || !serpApiKey) {
    return NextResponse.json({ error: 'Missing query or API key' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${serpApiKey}`
    );
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching SerpAPI data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}