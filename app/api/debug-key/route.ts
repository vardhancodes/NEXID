import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ status: "ERROR", message: "FMP_API_KEY is NOT SET on Vercel." }, { status: 500 });
  }

  const testUrl = `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${apiKey}`;
  try {
    const response = await fetch(testUrl);
    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({ status: "SUCCESS ✅", message: "Your API key is working correctly." });
    } else {
      return NextResponse.json({
        status: "ERROR ❌",
        message: "Your API key is PRESENT but INVALID. The financial API rejected it.",
        apiResponse: data["Error Message"] || "The API returned an error."
      }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ status: "ERROR", message: "A network error occurred.", error: error.message }, { status: 500 });
  }
}