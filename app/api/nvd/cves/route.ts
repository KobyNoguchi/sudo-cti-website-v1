import { NextRequest, NextResponse } from 'next/server';

const NVD_API_BASE_URL = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = process.env.NVD_API_KEY;

  // Forward all query parameters from the client to the NVD API
  const nvdApiUrl = `${NVD_API_BASE_URL}?${searchParams.toString()}`;

  try {
    const headers: HeadersInit = {};
    if (apiKey) {
      headers['apiKey'] = apiKey;
    }

    const response = await fetch(nvdApiUrl, { headers });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error(`NVD API error: ${response.status}`, errorData);
      return NextResponse.json(
        { message: 'Error fetching data from NVD API', details: errorData.message },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Internal server error fetching from NVD API:', error);
    return NextResponse.json(
      { message: 'An internal error occurred' },
      { status: 500 }
    );
  }
}

