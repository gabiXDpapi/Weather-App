import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  isLoading: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <p className="spinner-text">Fetching weather data...</p>
      </div>
    </div>
  );
};
