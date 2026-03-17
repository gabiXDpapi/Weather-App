import React from 'react';
import './ForecastCard.css';
import type { ForecastDayType } from '../../types/weather';

interface ForecastCardProps {
    day: ForecastDayType;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ day }) => {
    return (
        <div className="forecast-card">
            <p className="forecast-day-name">{day.dayName}</p>
            <img 
                src={day.icon} 
                alt={day.condition} 
                loading="lazy" 
                className="forecast-icon"
                title={day.condition}
            />
            <p className="forecast-temp">{day.temperature}&deg;C</p>
        </div>
    );
};
