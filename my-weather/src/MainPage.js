import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';

function MainPage() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchWeather = async () => {
    if (!city) {
      setWeatherData({ error: 'Please enter a city name.' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/weather?city=${city}`);
      setWeatherData(response.data);
    } catch (error) {
      setWeatherData({ error: 'City not found or server error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setCity('');
    setWeatherData(null);
  };

  return (
    <div className="App">
      <div className="top-bar">
        <h1 className="title">Weather Forecast</h1>
        <button onClick={() => navigate('/history')} className="history-btn">
          View History
        </button>
      </div>

      <div className="card">
        <h2>Search Weather</h2>

        <div className="input-container">
          <input
            type="text"
            placeholder="Enter City Name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="city-input"
          />
          <button
            onClick={fetchWeather}
            className="search-btn"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {weatherData && !weatherData.error && (
          <div className="result">
            <div><strong>City:</strong> {weatherData.city}</div>
            <div><strong>Temperature:</strong> {weatherData.temperature}°C</div>
            <div><strong>Humidity:</strong> {weatherData.humidity}%</div>
            <div><strong>Weather:</strong> {weatherData.weather}</div>
          </div>
        )}

        {weatherData?.error && (
          <div className="error">{weatherData.error}</div>
        )}

        {/* Conditionally render the refresh button if weatherData is not null */}
        {weatherData && (
          <button className="refresh-btn" onClick={handleRefresh}>
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

export default MainPage;
