import { NextRequest, NextResponse } from "next/server";
import { weatherService } from "@/integrations/weather";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || undefined;

    const weatherData = await weatherService.getCurrentWeather(location);

    return NextResponse.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("Weather API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch weather data",
      },
      { status: 500 }
    );
  }
}

// Mark this route as dynamic to avoid static generation issues
export const dynamic = "force-dynamic";
