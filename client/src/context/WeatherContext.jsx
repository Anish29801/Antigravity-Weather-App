import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WeatherContext = createContext(null);

export const WeatherProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [city, setCity] = useState('Neo-Tokyo');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (location) => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      let endpoint = '/weather/current';
      if (location && typeof location === 'object' && location.lat !== undefined && location.lon !== undefined) {
        endpoint += `?lat=${location.lat}&lon=${location.lon}`;
      } else {
        endpoint += `?city=${encodeURIComponent(location)}`;
      }
      const response = await api.get(endpoint);
      if (response.data && response.data.success) {
        setWeatherData(response.data.data);
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
        refreshWeather: () => fetchWeather(city)
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
