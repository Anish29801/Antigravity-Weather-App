import React, { useState, useEffect } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import WeatherCanvas from './WeatherCanvas';

export default function WeatherCard() {
  const { city, setCity, weatherData, loading, error, recentCities } = useWeather();
  const { playClickSound } = useTheme();

  // Time & Date State
  const [timeStr, setTimeStr] = useState('00:00:00');
  const [dateStr, setDateStr] = useState('LOADING DATE');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);

      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      
      const dayName = days[now.getDay()];
      const monthName = months[now.getMonth()];
      const dateNum = now.getDate();
      const year = now.getFullYear();
      setDateStr(`${dayName} // ${monthName} ${dateNum}, ${year}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCityChange = (cityName) => {
    if (cityName !== city) {
      playClickSound(1400, 800, 0.04);
      setCity(cityName);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      playClickSound(1400, 800, 0.04);
      setCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleGeolocation = () => {
    playClickSound(1400, 800, 0.04);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setCity(coords);
      },
      (err) => {
        alert(`Failed to retrieve location: ${err.message}`);
      }
    );
  };

  const isDeviceActive = city && typeof city === 'object';
  const displayCityName = weatherData?.cityName || (typeof city === 'string' ? city : 'Local Position');

  return (
    <section id="weather-clock-widget" className="glass-panel interactive-card" aria-label="Time and Weather Dashboard">
      {/* High-tech Clock */}
      <div className="clock-display">
        <div id="clock-time">{timeStr}</div>
        <div id="clock-date">{dateStr}</div>
      </div>

      {/* Weather Display */}
      <div className="weather-display">
        <div className="weather-visual">
          {weatherData && <WeatherCanvas type={weatherData.type} />}
          <span id="weather-temp">{loading ? '--' : (weatherData?.temp || '--°C')}</span>
        </div>
        
        <div className="weather-details">
          <div id="weather-status">
            {loading ? 'Calibrating...' : (error ? 'Telemetry Error' : `${weatherData?.status || 'Offline'} (${displayCityName})`)}
          </div>
          <div className="weather-sub-details">
            <span>
              <i className="fa-solid fa-droplet"></i> Hum: <span id="weather-humidity">{loading ? '--' : (weatherData?.humidity || '--%')}</span>
            </span>
            <span>
              <i className="fa-solid fa-wind"></i> Wind: <span id="weather-wind">{loading ? '--' : (weatherData?.wind || '-- km/h')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Search Input for real cities */}
      <form onSubmit={handleSearchSubmit} className="weather-search-container">
        <input
          type="text"
          placeholder="Search real city/region..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="weather-search-input"
        />
        <button type="submit" className="weather-search-btn" title="Search City">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </form>

      {/* Weather Control */}
      <div className="weather-city-selector">
        <button 
          className={`city-btn ${isDeviceActive ? 'active' : ''}`}
          onClick={handleGeolocation}
          title="Scan Local Position Weather"
        >
          <i className="fa-solid fa-location-crosshairs"></i> Current Location
        </button>
        {recentCities.map((c) => (
          <button 
            key={c}
            className={`city-btn ${city === c ? 'active' : ''}`}
            onClick={() => handleCityChange(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}
