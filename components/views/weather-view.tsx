"use client";

import { useState, useEffect } from "react";
import { WeatherData } from "@/types";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  RefreshCw,
  Calendar,
} from "lucide-react";

export function WeatherView() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/weather");
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch weather");
      }

      setWeather(data.data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      setError(err instanceof Error ? err.message : "Failed to load weather");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <Thermometer className="h-4 w-4" />
          Weather
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWeather}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWeather}
              className="w-full mt-3"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weather Content */}
      {!isLoading && !error && weather && (
        <div className="space-y-4">
          {/* Current Weather */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{weather.location}</span>
                </div>

                <div className="space-y-2">
                  <div className="text-4xl">{weather.icon}</div>
                  <div className="text-3xl font-bold">
                    {weather.temperature}°F
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {weather.condition}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span>Humidity</span>
                </div>
                <span className="text-sm font-medium">{weather.humidity}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Wind className="h-4 w-4 text-gray-500" />
                  <span>Wind Speed</span>
                </div>
                <span className="text-sm font-medium">
                  {weather.windSpeed} mph
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 5-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                5-Day Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weather.forecast.map((day, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{day.icon}</span>
                      <div>
                        <div className="text-sm font-medium">
                          {index === 0
                            ? "Tomorrow"
                            : index === 1
                            ? "Day after"
                            : day.date.toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {day.condition}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">{day.high}°</div>
                      <div className="text-xs text-muted-foreground">
                        {day.low}°
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Notice */}
          <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Weather Context
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  I'll consider weather conditions when suggesting outdoor
                  activities or travel times.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Note */}
          <div className="text-xs text-muted-foreground text-center bg-muted/50 rounded p-2">
            This is demo weather data. Connect a real weather API for accurate
            forecasts.
          </div>
        </div>
      )}
    </div>
  );
}
