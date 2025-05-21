const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
const PORT = 5000;

// ✅ OpenWeatherMap API key
const API_KEY = '7e8b29d47b04428c8e2189da5ced17e6';

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'weatherdb'
});

// ✅ Connect to MySQL and log status
db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

// ✅ Weather API route
app.get('/api/weather', async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City name is required' });
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;

  try {
    const response = await axios.get(url);
    const { name, main, weather } = response.data;

    // ✅ Insert into MySQL
    const sql = `INSERT INTO searches (city, temperature, humidity, weather) VALUES (?, ?, ?, ?)`;
    const values = [name, main.temp, main.humidity, weather[0].main];

    db.query(sql, values, (err) => {
      if (err) {
        console.error('❌ Insert error:', err.message);
      } else {
        console.log(`✅ Weather data for ${name} inserted`);
      }
    });

    // ✅ Send response
    res.json({
      city: name,
      temperature: main.temp,
      humidity: main.humidity,
      weather: weather[0].main,
    });
  } catch (error) {
    console.error('❌ Weather fetch error:', error.response?.data || error.message);
    res.status(404).json({ error: 'City not found or server error' });
  }
});

app.get('/api/history', (req, res) => {
  db.query(
    'SELECT id, city, searched_at FROM searches ORDER BY searched_at DESC LIMIT 20',
    (err, results) => {
      if (err) {
        console.error('History fetch error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    }
  );
});

// ✅ Delete a single history entry by ID
app.delete('/api/history/:id', (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM searches WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Delete error:', err.message);
      return res.status(500).json({ error: 'Failed to delete entry' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ message: 'Entry deleted successfully' });
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
