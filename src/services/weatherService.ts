import type { CurrentWeatherType, ForecastDayType } from '../types/weather';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

interface WeatherApiResponse {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

interface ForecastApiResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

export class WeatherError extends Error {
  isValidationError: boolean;

  constructor(message: string, isValidationError: boolean = false) {
    super(message);
    this.name = 'WeatherError';
    this.isValidationError = isValidationError;
  }
}

export async function fetchWeatherData(city: string): Promise<CurrentWeatherType> {

  if (!city || city.trim() === '') {
    throw new WeatherError('Please enter a city name.', true);
  }

  if (!API_KEY) {
    throw new WeatherError(
      'Weather service is not properly configured. Please check your API key.',
      false,
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); 

  try {
    const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) {
        throw new WeatherError(
          'City not found. Please enter a valid city name.',
          true,
        );
      }
      if (response.status === 429) {
        throw new WeatherError(
          'Too many requests. Please wait a moment and try again.',
          false,
        );
      }
      if (response.status === 401) {
        throw new WeatherError(
          'Invalid API key. Please check your configuration.',
          false,
        );
      }
      if (response.status >= 500) {
        throw new WeatherError(
          'Weather service is temporarily unavailable. Please try again later.',
          false,
        );
      }
      throw new WeatherError(
        `Failed to fetch weather data. (Error: ${response.status})`,
        false,
      );
    }

    let data: WeatherApiResponse;
    try {
      data = await response.json();
    } catch {
      throw new WeatherError(
        'Failed to parse weather data. Please try again.',
        false,
      );
    }

    if (
      !data.name ||
      !data.main?.temp ||
      !data.weather?.[0]
    ) {
      throw new WeatherError(
        'Invalid weather data received. Please try again.',
        false,
      );
    }

    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    const weatherData: CurrentWeatherType = {
      city: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      icon: iconUrl,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed),
    };

    return weatherData;
  } catch (error) {

    if (error instanceof WeatherError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherError(
        'Request timeout. The server took too long to respond. Please check your internet connection and try again.',
        false,
      );
    }

    if (error instanceof TypeError) {
      const message = error.message.toLowerCase();
      if (message.includes('failed to fetch') || message.includes('network')) {
        throw new WeatherError(
          'Unable to fetch weather data. Please check your internet connection and try again.',
          false,
        );
      }
      throw new WeatherError(
        'Network error occurred. Please check your internet connection and try again.',
        false,
      );
    }

    throw new WeatherError(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      false,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches 5-day forecast data for a given city
 * @param city - The name of the city to fetch forecast for
 * @returns Promise<ForecastDayType[]> - Array of forecast data for the next 5 days
 * @throws WeatherError if the API request fails
 */
export async function fetchForecastData(city: string): Promise<ForecastDayType[]> {
  if (!city || city.trim() === '') {
    throw new WeatherError('Please enter a city name.', true);
  }

  if (!API_KEY) {
    throw new WeatherError(
      'Weather service is not properly configured. Please check your API key.',
      false,
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const url = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 404) {
        throw new WeatherError(
          'City not found. Please enter a valid city name.',
          true,
        );
      }
      if (response.status === 429) {
        throw new WeatherError(
          'Too many requests. Please wait a moment and try again.',
          false,
        );
      }
      if (response.status === 401) {
        throw new WeatherError(
          'Invalid API key. Please check your configuration.',
          false,
        );
      }
      if (response.status >= 500) {
        throw new WeatherError(
          'Weather service is temporarily unavailable. Please try again later.',
          false,
        );
      }
      throw new WeatherError(
        `Failed to fetch forecast data. (Error: ${response.status})`,
        false,
      );
    }

    let data: ForecastApiResponse;
    try {
      data = await response.json();
    } catch {
      throw new WeatherError(
        'Failed to parse forecast data. Please try again.',
        false,
      );
    }

    if (!data.list || data.list.length === 0) {
      throw new WeatherError(
        'No forecast data received. Please try again.',
        false,
      );
    }

    // Get forecast for every 24 hours (8 entries per day with 3-hour intervals)
    // This gives us 5 days of forecast data
    const forecastDays = new Map<string, ForecastDayType>();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (const item of data.list) {
      const date = new Date(item.dt * 1000);
      const dayName = dayNames[date.getDay()];

      // Only add one entry per day (use the first entry of each day)
      if (!forecastDays.has(dayName)) {
        forecastDays.set(dayName, {
          dayName,
          temperature: Math.round(item.main.temp),
          condition: item.weather[0]?.description || 'Unknown',
          icon: `https://openweathermap.org/img/wn/${item.weather[0]?.icon}@2x.png`,
        });
      }

      // Stop when we have 5 days
      if (forecastDays.size >= 5) {
        break;
      }
    }

    return Array.from(forecastDays.values());
  } catch (error) {
    if (error instanceof WeatherError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherError(
        'Request timeout. The server took too long to respond. Please check your internet connection and try again.',
        false,
      );
    }

    if (error instanceof TypeError) {
      const message = error.message.toLowerCase();
      if (message.includes('failed to fetch') || message.includes('network')) {
        throw new WeatherError(
          'Unable to fetch forecast data. Please check your internet connection and try again.',
          false,
        );
      }
      throw new WeatherError(
        'Network error occurred. Please check your internet connection and try again.',
        false,
      );
    }

    throw new WeatherError(
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
      false,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
