import { NextResponse } from 'next/server';

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
  try {
    const response = await fetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error(`Error fetching CISA KEV data: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: 'Failed to fetch CISA KEV data', details: `Status: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in CISA KEV API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { error: 'Internal Server Error', details: errorMessage },
      { status: 500 }
    );
  }
}

