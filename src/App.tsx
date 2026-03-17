import { useState } from 'react';
import './App.css';
import { SearchBar } from './components/SearchBar/SearchBar';
import { CurrentWeather } from './components/CurrentWeather/CurrentWeather';
import { Forecast } from './components/Forecast/Forecast';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import type { CurrentWeatherType, ForecastDayType } from './types/weather';
import { fetchWeatherData, fetchForecastData, WeatherError } from './services/weatherService';

const initialWeatherData: CurrentWeatherType = {
  city: 'London',
  temperature: 15,
  condition: 'Partly Cloudy',
  icon: 'https://openweathermap.org/img/wn/02d@2x.png',
  humidity: 65,
  windSpeed: 10,
};

const initialForecastData: ForecastDayType[] = [
  { dayName: 'Mon', icon: 'https://openweathermap.org/img/wn/01d.png', temperature: 18, condition: 'Sunny' },
  { dayName: 'Tue', icon: 'https://openweathermap.org/img/wn/02d.png', temperature: 16, condition: 'Cloudy' },
  { dayName: 'Wed', icon: 'https://openweathermap.org/img/wn/09d.png', temperature: 14, condition: 'Rain' },
  { dayName: 'Thu', icon: 'https://openweathermap.org/img/wn/10d.png', temperature: 15, condition: 'Rain' },
  { dayName: 'Fri', icon: 'https://openweathermap.org/img/wn/01d.png', temperature: 19, condition: 'Sunny' },
];

function App() {
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherType | null>(initialWeatherData);
  const [forecast, setForecast] = useState<ForecastDayType[]>(initialForecastData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (city: string) => {
    setError(null);
    setLoading(true);

    try {
      const weatherData = await fetchWeatherData(city);
      const forecastData = await fetchForecastData(city);
      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      if (err instanceof WeatherError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <LoadingSpinner isLoading={loading} />
      <SearchBar onSearch={handleSearch} initialCity="London" disabled={loading} />
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      <main className="dashboard-grid">
        {currentWeather && (
          <div className="current-weather-wrapper">
            <CurrentWeather data={currentWeather} />
          </div>
        )}
        
        {forecast.length > 0 && (
          <div className="forecast-wrapper">
            <Forecast days={forecast} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
