import React from 'react';
import './CurrentWeather.css';
import type { CurrentWeatherType } from '../../types/weather';

interface CurrentWeatherProps {
    data: CurrentWeatherType;
}

export const CurrentWeather: React.FC<CurrentWeatherProps> = ({ data }) => {
    return (
        <div className="current-weather-card">
            <h2 className="current-weather-city">{data.city}</h2>
            <img 
                src={data.icon} 
                alt={data.condition} 
                loading="lazy" 
                className="current-weather-icon"
            />
            <div className="current-weather-temp">{data.temperature}&deg;C</div>
            <div className="current-weather-condition">{data.condition}</div>
            <p className="current-weather-details">
                Humidity: {data.humidity}% | Wind: {data.windSpeed} km/h
            </p>
        </div>
    );
};
