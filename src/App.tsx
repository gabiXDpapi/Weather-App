import React, { useState } from 'react';
import './App.css';
import { SearchBar } from './components/SearchBar/SearchBar';
import { CurrentWeather } from './components/CurrentWeather/CurrentWeather';
import { Forecast } from './components/Forecast/Forecast';
import type { CurrentWeatherType, ForecastDayType } from './types/weather';

const initialWeatherData: CurrentWeatherType = {
  city: 'London, UK',
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

  const handleSearch = (city: string) => {
    if (currentWeather) {
      setCurrentWeather({
        ...currentWeather,
        city: city,
      });
    }
  };

  return (
    <div className="app-container">
      <SearchBar onSearch={handleSearch} initialCity="London" />
      
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
