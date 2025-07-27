import { WeatherData, WeatherForecast } from "@/types";

export class WeatherIntegration {
  async getCurrentWeather(location?: string): Promise<WeatherData> {
    // This is a stub implementation with dummy data
    // Replace with actual weather API integration (OpenWeatherMap, WeatherAPI, etc.)

    const dummyLocation = location || "San Francisco, CA";

    return {
      location: dummyLocation,
      temperature: Math.floor(Math.random() * 30) + 50, // 50-80°F
      condition: this.getRandomCondition(),
      icon: this.getWeatherIcon(this.getRandomCondition()),
      humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
      windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 mph
      forecast: this.generateForecast(),
    };
  }

  private getRandomCondition(): string {
    const conditions = [
      "Clear",
      "Partly Cloudy",
      "Cloudy",
      "Overcast",
      "Light Rain",
      "Rain",
      "Sunny",
      "Foggy",
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
  }

  private getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      Clear: "☀️",
      Sunny: "☀️",
      "Partly Cloudy": "⛅",
      Cloudy: "☁️",
      Overcast: "☁️",
      "Light Rain": "🌦️",
      Rain: "🌧️",
      Foggy: "🌫️",
    };
    return iconMap[condition] || "🌤️";
  }

  private generateForecast(): WeatherForecast[] {
    const forecast: WeatherForecast[] = [];
    const today = new Date();

    for (let i = 1; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const condition = this.getRandomCondition();
      forecast.push({
        date,
        high: Math.floor(Math.random() * 25) + 65, // 65-90°F
        low: Math.floor(Math.random() * 20) + 45, // 45-65°F
        condition,
        icon: this.getWeatherIcon(condition),
        precipitation: Math.floor(Math.random() * 30), // 0-30% chance
      });
    }

    return forecast;
  }
}

// Export singleton instance
export const weatherService = new WeatherIntegration();

// Future implementation notes:
/*
To integrate with a real weather API:

1. Sign up for a weather API service (OpenWeatherMap, WeatherAPI, etc.)
2. Add API key to environment variables
3. Replace dummy data with actual API calls
4. Handle geolocation for automatic location detection
5. Add error handling and fallbacks
6. Cache weather data to avoid excessive API calls

Example with OpenWeatherMap:
```typescript
async getCurrentWeather(location?: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    location: data.name,
    temperature: Math.round(data.main.temp),
    condition: data.weather[0].main,
    icon: this.mapOpenWeatherIcon(data.weather[0].icon),
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed),
    forecast: await this.getForecast(location)
  };
}
```
*/
