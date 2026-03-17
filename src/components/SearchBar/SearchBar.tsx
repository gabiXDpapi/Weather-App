import React, { useState } from 'react';
import './SearchBar.css';

interface SearchBarProps {
    onSearch: (city: string) => void;
    initialCity?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialCity = '' }) => {
    const [city, setCity] = useState(initialCity);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
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
                className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
        </form>
    );
};
