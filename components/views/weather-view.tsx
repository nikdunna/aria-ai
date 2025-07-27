"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Cloud,
  MapPin,
  RefreshCw,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Zap,
  Eye,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { WeatherData } from "@/types";

export function WeatherView() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("Getting location...");
  const [isFallback, setIsFallback] = useState(false);
  const [isApiKeyError, setIsApiKeyError] = useState(false);

  const fetchWeather = async (lat?: number, lon?: number, city?: string) => {
    setIsLoading(true);
    setError(null);
    setIsApiKeyError(false);

    try {
      let url = "/api/weather?";
      if (lat && lon) {
        url += `lat=${lat}&lon=${lon}`;
      } else if (city) {
        url += `city=${encodeURIComponent(city)}`;
      } else {
        throw new Error("No location provided");
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setWeather(data.data);
        setLocation(data.data.location);
        setIsFallback(data.fallback || false);
      } else {
        if (response.status === 401 && data.error?.includes("API key")) {
          setIsApiKeyError(true);
        }
        throw new Error(data.error || "Failed to fetch weather");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch weather";
      setError(errorMessage);

      if (errorMessage.includes("API key")) {
        setIsApiKeyError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getUserLocationAndWeather = async () => {
    setIsLoading(true);
    setLocation("Getting your location...");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      // Fallback to a default city
      await fetchWeather(undefined, undefined, "New York");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchWeather(lat, lon);
      },
      async (geoError) => {
        console.error("Geolocation error:", geoError);
        let locationErrorMessage = "Using default location";

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            locationErrorMessage =
              "Location permission denied - using default location";
            break;
          case geoError.POSITION_UNAVAILABLE:
            locationErrorMessage =
              "Location unavailable - using default location";
            break;
          case geoError.TIMEOUT:
            locationErrorMessage =
              "Location request timed out - using default location";
            break;
        }

        setLocation(locationErrorMessage);
        // Fallback to default city if geolocation fails
        await fetchWeather(undefined, undefined, "San Francisco");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  useEffect(() => {
    getUserLocationAndWeather();
  }, []);

  const getWeatherGradient = (condition: string) => {
    const condLower = condition.toLowerCase();
    if (condLower.includes("clear") || condLower.includes("sunny")) {
      return "from-yellow-400 via-orange-400 to-red-400";
    } else if (condLower.includes("cloud")) {
      return "from-gray-400 via-gray-500 to-gray-600";
    } else if (condLower.includes("rain") || condLower.includes("drizzle")) {
      return "from-blue-400 via-blue-500 to-blue-600";
    } else if (condLower.includes("storm") || condLower.includes("thunder")) {
      return "from-purple-500 via-indigo-600 to-gray-800";
    } else if (condLower.includes("snow")) {
      return "from-blue-200 via-blue-300 to-blue-400";
    }
    return "from-blue-400 via-purple-500 to-indigo-600";
  };

  const getWeatherIcon = (condition: string) => {
    const condLower = condition.toLowerCase();
    if (condLower.includes("clear") || condLower.includes("sunny")) {
      return <Sun className="w-8 h-8" />;
    } else if (condLower.includes("rain")) {
      return <CloudRain className="w-8 h-8" />;
    } else if (condLower.includes("storm")) {
      return <Zap className="w-8 h-8" />;
    } else if (condLower.includes("cloud")) {
      return <Cloud className="w-8 h-8" />;
    }
    return <Sun className="w-8 h-8" />;
  };

  // API Key Error State
  if (isApiKeyError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Weather</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={getUserLocationAndWeather}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 mx-auto text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Weather API Setup Required
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  To display real weather data, you need to configure an
                  OpenWeather API key.
                </p>
              </div>

              <div className="text-left bg-white dark:bg-gray-800 rounded-lg p-3 border text-xs font-mono">
                <p className="text-muted-foreground mb-2">
                  Add to your .env.local file:
                </p>
                <code className="text-green-600 dark:text-green-400">
                  OPENWEATHER_API_KEY=your_api_key_here
                </code>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open("https://openweathermap.org/api", "_blank")
                  }
                  className="w-full gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Get Free API Key
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={getUserLocationAndWeather}
                  className="w-full"
                >
                  Retry with Demo Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // General Error State
  if (error && !isApiKeyError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Weather</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={getUserLocationAndWeather}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <Cloud className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-destructive mb-3">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={getUserLocationAndWeather}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Weather</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={getUserLocationAndWeather}
          disabled={isLoading}
          className="h-7 w-7 p-0"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <LoadingSpinner />
                <p className="text-xs text-muted-foreground mt-2">{location}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weather Content */}
      {weather && !isLoading && (
        <div className="space-y-3">
          {/* Fallback Notice */}
          {isFallback && (
            <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1.5 border border-amber-200 dark:border-amber-800">
              <Eye className="w-3 h-3 inline mr-1" />
              Showing demo weather data - setup OpenWeather API for real data
            </div>
          )}

          {/* Main Weather Card */}
          <Card
            className={`bg-gradient-to-br ${getWeatherGradient(
              weather.condition
            )} text-white border-0 shadow-lg`}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Location */}
                <div className="flex items-center justify-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-medium text-sm">
                    {weather.location}
                  </span>
                </div>

                {/* Main Temperature */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {weather.temperature}°C
                  </div>
                  <div className="text-sm capitalize opacity-90">
                    {weather.condition}
                  </div>
                </div>

                {/* Weather Details */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="text-center">
                    <Droplets className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <div className="text-xs opacity-75">Humidity</div>
                    <div className="text-sm font-semibold">
                      {weather.humidity}%
                    </div>
                  </div>
                  <div className="text-center">
                    <Wind className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <div className="text-xs opacity-75">Wind</div>
                    <div className="text-sm font-semibold">
                      {weather.windSpeed} km/h
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <Droplets className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">Humidity</div>
                  <div className="text-sm font-medium">{weather.humidity}%</div>
                </div>
                <div>
                  <Wind className="w-3.5 h-3.5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground">
                    Wind Speed
                  </div>
                  <div className="text-sm font-medium">
                    {weather.windSpeed} km/h
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Smart Scheduling */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-800/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Weather-Smart Scheduling
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Aria considers the weather when helping you plan outdoor
                activities!
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-600 dark:text-red-400" />
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-1 text-sm">
                  {isApiKeyError
                    ? "Weather API Key Required"
                    : "Weather Unavailable"}
                </h4>
                <p className="text-xs text-red-700 dark:text-red-300 mb-3">
                  {isApiKeyError
                    ? "Add your OpenWeather API key to get real weather data."
                    : "Unable to fetch weather data right now."}
                </p>
              </div>

              {isApiKeyError && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border text-xs">
                  <p className="text-muted-foreground mb-1">
                    Add to your .env.local:
                  </p>
                  <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
                    NEXT_PUBLIC_OPENWEATHER_API_KEY=your_key_here
                  </code>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getUserLocationAndWeather}
                  className="text-xs flex-1"
                >
                  Try Again
                </Button>
                {isApiKeyError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open("https://openweathermap.org/api", "_blank")
                    }
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Get API Key
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
