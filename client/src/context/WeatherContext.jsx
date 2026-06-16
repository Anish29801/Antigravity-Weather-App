import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WeatherContext = createContext(null);

export const WeatherProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentCities, setRecentCities] = useState(() => {
    const saved = localStorage.getItem('recent_cities');
    return saved ? JSON.parse(saved) : [];
  });

  const fetchWeather = async (location) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      let endpoint = '/weather/current';
      const isSearch = typeof location === 'string';
      if (!isSearch && location && typeof location === 'object' && location.lat !== undefined && location.lon !== undefined) {
        endpoint += `?lat=${location.lat}&lon=${location.lon}`;
      } else {
        endpoint += `?city=${encodeURIComponent(location)}`;
      }
      const response = await api.get(endpoint);
      if (response.data && response.data.success) {
        const data = response.data.data;
        setWeatherData(data);
        
        // Only add to recent searches if the query was a string (searched city)
        if (isSearch && data.cityName) {
          setRecentCities(prev => {
            const list = prev.filter(c => c.toLowerCase() !== data.cityName.toLowerCase());
            list.unshift(data.cityName);
            const trimmedList = list.slice(0, 3);
            localStorage.setItem('recent_cities', JSON.stringify(trimmedList));
            return trimmedList;
          });
        }
      } else {
        setError('Failed to fetch weather telemetry');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error connecting to weather host');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      // Automatic Scan on Load
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lon: position.coords.longitude
            };
            setCity(coords);
          },
          (err) => {
            console.warn("Automatic geolocation scan failed:", err.message);
            // Default to the first recent city or New York if none
            setCity(recentCities[0] || 'New York');
          }
        );
      } else {
        setCity(recentCities[0] || 'New York');
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && city) {
      fetchWeather(city);
    }
  }, [city, isAuthenticated]);

  return (
    <WeatherContext.Provider
      value={{
        city,
        setCity,
        weatherData,
        loading,
        error,
        recentCities,
        setRecentCities,
        refreshWeather: () => city && fetchWeather(city)
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
