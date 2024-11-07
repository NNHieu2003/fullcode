import React, { useEffect, useState } from 'react';
import './DeviceHistory.css';
import { Link } from 'react-router-dom';

export default function DeviceHistory() {
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTime, setSearchTime] = useState('');

  useEffect(() => {
    fetchDeviceHistory();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchDeviceHistory = async () => {
    try {
      const response = await fetch('http://192.168.1.7:8080/api/device-history');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDeviceHistory(data || []);
      setTotalPages(Math.ceil((data || []).length / 50));
      setPage(0);
    } catch (error) {
      console.error('Error fetching device history:', error);
      setMessage('Failed to fetch device history. Please try again later.');
      setDeviceHistory([]);
      setTotalPages(1);
    }
  };

  const isValidFormatTime = (time) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    return regex.test(time);
  };

  const handleSearchByTime = async () => {
    if (!isValidFormatTime(searchTime)) {
      setMessage('Invalid time format. Please use the format YYYY-MM-DDTHH:mm:ss.');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.7:8080/api/device-history/search?time=${searchTime}`);
      const data = await response.json();
      setDeviceHistory(data || []);
      setTotalPages(Math.ceil((data || []).length / 50));
      setPage(0);
    } catch (error) {
      console.error('Error searching sensor history by time:', error);
      setMessage('Failed to search sensor history by time');
      setDeviceHistory([]);
      setTotalPages(1);
    }
  };

  const handleClearSearch = () => {
    setSearchTime('');
    setPage(0);
    fetchDeviceHistory();
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const currentItems = deviceHistory.slice(page * 50, (page + 1) * 50);

  return (
    <div className="historyContainer">
      <Link to="/">Go back to Home</Link>
      <h2 className="historyTitle">Device History</h2>
      {message && <div className="alert"><p>{message}</p></div>}
      <div className="searchContainer">
        <div className='text'>Search</div>
        <input
          type="text"
          value={searchTime}
          onChange={(e) => setSearchTime(e.target.value)}
          placeholder="Enter time (e.g., 2024-10-21T14:48:43)"
        />
        <button onClick={handleSearchByTime}>Search</button>
        <button onClick={handleClearSearch}>Clear</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="tableHeader">ID</th>
            <th className="tableHeader">Device</th>
            <th className="tableHeader">Action</th>
            <th className="tableHeader">Time</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((entry) => (
              <tr key={entry.id}>
                <td className="tableCell">{entry.id}</td>
                <td className="tableCell">{entry.device}</td>
                <td className="tableCell">{entry.action}</td>
                <td className="tableCell">{entry.time.slice(0, 19)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="tableCell">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 0}>Previous</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page >= totalPages - 1}>Next</button>
      </div>
    </div>
  );
}
