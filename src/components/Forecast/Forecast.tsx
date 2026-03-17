import React from 'react';
import './Forecast.css';
import { ForecastCard } from '../ForecastCard/ForecastCard';
import type { ForecastDayType } from '../../types/weather';

interface ForecastProps {
    days: ForecastDayType[];
}

export const Forecast: React.FC<ForecastProps> = ({ days }) => {
    if (!days || days.length === 0) {
        return null;
    }

    return (
        <section className="forecast-section">
            <h3 className="forecast-title">5-Day Forecast</h3>
            <div className="forecast-grid">
                {days.map((day, index) => (
                    <ForecastCard key={`${day.dayName}-${index}`} day={day} />
                ))}
            </div>
        </section>
    );
};
