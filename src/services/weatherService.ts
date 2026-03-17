import type { CurrentWeatherType } from '../types/weather';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1';

interface WeatherApiResponse {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
  };
}

export async function fetchWeatherData(city: string): Promise<CurrentWeatherType> {
  if (!city || city.trim() === '') {
    throw new Error('City name is required');
  }

  if (!API_KEY) {
    throw new Error('Weather API key is not configured');
  }

  try {
    const url = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
    
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('City not found. Please enter a valid city name.');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data: WeatherApiResponse = await response.json();

    const weatherData: CurrentWeatherType = {
      city: data.location.name,
      temperature: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      humidity: data.current.humidity,
      windSpeed: Math.round(data.current.wind_kph),
    };

    return weatherData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch weather data');
  }
}
