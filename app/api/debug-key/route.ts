import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    // Case 1: The variable is missing entirely.
    return NextResponse.json({ 
      status: "ERROR", 
      message: "The FMP_API_KEY environment variable is NOT SET on the Vercel server." 
    }, { status: 500 });
  }

  if (apiKey.length < 20) {
    // Case 2: The variable is there, but the value looks too short.
    return NextResponse.json({ 
      status: "ERROR", 
      message: "The FMP_API_KEY is present, but its value seems too short to be a valid key." 
    }, { status: 500 });
  }

  // Case 3: The variable exists. Let's test if it works.
  const testUrl = `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${apiKey}`;
  try {
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ 
        status: "SUCCESS ✅", 
        message: "Your API key is configured correctly and is working."
      });
    } else {
      // The key is present but invalid, FMP returned an error.
      return NextResponse.json({
        status: "ERROR ❌",
        message: "Your API key is PRESENT but INVALID. The financial API rejected it.",
        apiResponse: data["Error Message"] || "The API returned an error without a specific message."
      }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: "ERROR",
      message: "A network error occurred while trying to test the API key.",
      error: error.message
    }, { status: 500 });
  }
}
