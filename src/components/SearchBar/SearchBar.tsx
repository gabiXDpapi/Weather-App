import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    onSearch: (city: string) => void;
    initialCity?: string;
    disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialCity = '', disabled = false }) => {
    const [city, setCity] = useState(initialCity);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim() && !disabled) {
            onSearch(city.trim());
        }
    };

    return (
        <form className="search-container" onSubmit={handleSubmit}>
            <input 
                type="text" 
                placeholder="Enter city name..." 
                value={city} 
                onChange={(e) => setCity(e.target.value)}
                disabled={disabled}
                className="search-input"
            />
            <button type="submit" disabled={disabled} className="search-button">{disabled ? 'Loading...' : 'Search'}</button>
        </form>
    );
};
