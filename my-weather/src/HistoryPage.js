import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HistoryPage.css';

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    axios.get('http://localhost:5000/api/history')
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('History fetch error:', err);
        setLoading(false);
      });
  };

  const deleteHistoryItem = (id) => {
    axios.delete(`http://localhost:5000/api/history/${id}`)
      .then(() => {
        setHistory(prev => prev.filter(item => item.id !== id));
      })
      .catch((err) => {
        console.error('Error deleting item:', err);
      });
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Search History</h2>
        <button onClick={() => navigate('/')} className="back-btn">Back to Main Page</button>
      </div>

      {history.length === 0 ? (
        <div className="no-history">No search history found.</div>
      ) : (
        <div className="history-content">
          {history.map((item) => (
            <div key={item.id} className="history-card">
              <p><strong>City:</strong> {item.city}</p>
              <p><strong>Search Date:</strong> {new Date(item.searched_at).toLocaleString()}</p>
              <button
                className="delete-btn"
                onClick={() => deleteHistoryItem(item.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
