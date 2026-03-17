export interface CurrentWeatherType {
    city: string;
    temperature: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
}

export interface ForecastDayType {
    dayName: string;
    icon: string;
    temperature: number;
    condition: string;
}
