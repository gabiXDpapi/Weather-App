import React, { useEffect, useMemo, useRef, useState } from 'react';
import './SearchBar.css';
import type { CitySuggestionType } from '../../types/weather';
import { fetchCitySuggestions } from '../../services/weatherService';

interface SearchBarProps {
    onSearch: (city: string) => void;
    initialCity?: string;
    disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialCity = '', disabled = false }) => {
    const [city, setCity] = useState(initialCity);
    const [suggestions, setSuggestions] = useState<CitySuggestionType[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const requestIdRef = useRef(0);
    const hideTimeoutRef = useRef<number | null>(null);
    const suppressSuggestionsRef = useRef(false);

    const normalizedCity = useMemo(() => city.trim(), [city]);

    useEffect(() => {
        if (disabled || normalizedCity.length < 2 || suppressSuggestionsRef.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const currentRequestId = ++requestIdRef.current;

        const timeout = window.setTimeout(async () => {
            try {
                const results = await fetchCitySuggestions(normalizedCity, 6);
                if (currentRequestId === requestIdRef.current) {
                    setSuggestions(results);
                    setShowSuggestions(
                        results.length > 0 &&
                        !suppressSuggestionsRef.current &&
                        isInputFocused,
                    );
                }
            } catch {
                if (currentRequestId === requestIdRef.current) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            }
        }, 350);

        return () => {
            window.clearTimeout(timeout);
        };
    }, [normalizedCity, disabled, isInputFocused]);

    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current !== null) {
                window.clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    const formatSuggestionLabel = (suggestion: CitySuggestionType) => {
        return suggestion.state
            ? `${suggestion.name}, ${suggestion.state}, ${suggestion.country}`
            : `${suggestion.name}, ${suggestion.country}`;
    };

    const handlePickSuggestion = (suggestion: CitySuggestionType) => {
        suppressSuggestionsRef.current = true;
        const selectedCity = formatSuggestionLabel(suggestion);
        setCity(selectedCity);
        setShowSuggestions(false);
        setSuggestions([]);
        if (!disabled) {
            onSearch(selectedCity);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (city.trim() && !disabled) {
            suppressSuggestionsRef.current = true;
            onSearch(city.trim());
            setShowSuggestions(false);
        }
    };

    return (
        <form className="search-container" onSubmit={handleSubmit}>
            <div className="search-input-wrapper">
                <input 
                    type="text" 
                    placeholder="Enter city name..." 
                    value={city} 
                    onChange={(e) => {
                        suppressSuggestionsRef.current = false;
                        setCity(e.target.value);
                    }}
                    onFocus={() => {
                        setIsInputFocused(true);
                        setShowSuggestions(suggestions.length > 0 && !suppressSuggestionsRef.current);
                    }}
                    onBlur={() => {
                        setIsInputFocused(false);
                        hideTimeoutRef.current = window.setTimeout(() => {
                            setShowSuggestions(false);
                        }, 150);
                    }}
                    disabled={disabled}
                    className="search-input"
                    autoComplete="off"
                />

                {showSuggestions && (
                    <ul className="suggestions-list" role="listbox" aria-label="City suggestions">
                        {suggestions.map((suggestion) => {
                            const label = formatSuggestionLabel(suggestion);
                            const key = `${suggestion.name}-${suggestion.lat}-${suggestion.lon}`;
                            return (
                                <li key={key} className="suggestion-item" role="option" aria-selected="false">
                                    <button
                                        type="button"
                                        className="suggestion-button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => handlePickSuggestion(suggestion)}
                                    >
                                        {label}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <button type="submit" disabled={disabled} className="search-button">{disabled || 'Search'}</button>
        </form>
    );
};
