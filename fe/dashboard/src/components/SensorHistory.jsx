import React, { useEffect, useState } from 'react';
import './SensorHistory.css';
import { Link } from 'react-router-dom';

export default function SensorHistory() {
  const [sensorHistory, setSensorHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTime, setSearchTime] = useState('');
  const [sensorType, setSensorType] = useState('All');
  const [sortOrder, setSortOrder] = useState('no sort');

  useEffect(() => {
    fetchSensorHistory();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchSensorHistory = async () => {
    try {
      const response = await fetch('http://192.168.1.7:8080/api/sensor-history');
      const data = await response.json();
      setSensorHistory(data || []);
      setTotalPages(Math.ceil((data || []).length / 50));
      setPage(0);
    } catch (error) {
      console.error('Error fetching sensor history:', error);
      setMessage('Failed to fetch sensor history. Please try again later.');
      setSensorHistory([]);
      setTotalPages(1);
    }
  };

  const isValidFormatTime = (time) => {
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    return regex.test(time);
  };

  const handleSearchByTime = async () => {
    if (!isValidFormatTime(searchTime)) {
      setMessage('Invalid time format. Please use the format: YYYY-MM-DDTHH:mm:ss');
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.7:8080/api/sensor-history/search?time=${searchTime}`);
      const data = await response.json();
      setSensorHistory(data || []);
      setTotalPages(Math.ceil((data || []).length / 50));
      setPage(0);
    } catch (error) {
      console.error('Error searching sensor history by time:', error);
      setMessage('Failed to search sensor history by time');
      setSensorHistory([]);
      setTotalPages(1);
    }
  };

  const handleClearSearch = () => {
    setSearchTime('');
    setPage(0);
    setSensorType('All');
    setSortOrder('no sort');
    fetchSensorHistory();
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const filteredAndSortedSensorHistory = React.useMemo(() => {
    let filtered = [...sensorHistory];

    // Filter by sensor type
    if (sensorType !== 'All') {
      filtered = filtered.filter(data => data[sensorType.toLowerCase()] !== null);
    }

    // Sort
    if (sortOrder !== 'no sort') {
      filtered.sort((a, b) => {
        const aValue = a[sensorType.toLowerCase()];
        const bValue = b[sensorType.toLowerCase()];
        if (aValue === null || bValue === null) return 0;
        return sortOrder === 'ascending' ? aValue - bValue : bValue - aValue;
      });
    }

    return filtered;
  }, [sensorHistory, sensorType, sortOrder]);

  const paginatedSensorHistory = filteredAndSortedSensorHistory.slice(page * 50, (page + 1) * 50);

  return (
    <div className="historyContainer">
      <Link to="/">Go back to Home</Link>
      <h2 className="historyTitle">Sensor History</h2>
      {message && <div className="alert"><p>{message}</p></div>}
      <div className="searchContainer">
        <div className='text'>Tìm kiếm</div>
        <input
          type="text"
          value={searchTime}
          onChange={(e) => setSearchTime(e.target.value)}
          placeholder="Enter time (e.g., 2024-10-21T14:48:41)"
        />
        <button onClick={handleSearchByTime} style={{ marginRight: '400px' }}>Search</button>
        <div className='text'>Sắp xếp</div>
        <select value={sensorType} onChange={(e) => setSensorType(e.target.value)}>
          <option value="All">All</option>
          <option value="Temperature">Temperature</option>
          <option value="Humidity">Humidity</option>
          <option value="Light">Light</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="no sort">No Sort</option>
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
        <button onClick={handleClearSearch}>Clear</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th className="tableHeader">ID</th>
            {sensorType === 'Temperature' && <th className="tableHeader">Temperature</th>}
            {sensorType === 'Humidity' && <th className="tableHeader">Humidity</th>}
            {sensorType === 'Light' && <th className="tableHeader">Light</th>}
            {sensorType === 'All' && (
              <>
                <th className="tableHeader">Temperature</th>
                <th className="tableHeader">Humidity</th>
                <th className="tableHeader">Light</th>
              </>
            )}
            <th className="tableHeader">Time</th>
          </tr>
        </thead>
        <tbody>
          {paginatedSensorHistory.length > 0 ? (
            paginatedSensorHistory.map((data) => (
              <tr key={data.id}>
                <td className="tableCell">{data.id}</td>
                {sensorType === 'Temperature' && <td className="tableCell">{data.temperature}</td>}
                {sensorType === 'Humidity' && <td className="tableCell">{data.humidity}</td>}
                {sensorType === 'Light' && <td className="tableCell">{data.light}</td>}
                {sensorType === 'All' && (
                  <>
                    <td className="tableCell">{data.temperature}</td>
                    <td className="tableCell">{data.humidity}</td>
                    <td className="tableCell">{data.light}</td>
                  </>
                )}
                <td className="tableCell">{data.time ? data.time.slice(0, 19) : ''}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={sensorType === 'All' ? 5 : 3} className="tableCell">No data available</td>
            </tr>
          )}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 0}>Previous</button>
        <span>Page {page + 1} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={page === totalPages - 1}>Next</button>
      </div>
    </div>
  );
}