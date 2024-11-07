import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './SensorDashboard.css';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({
    temperature: [],
    humidity: [],
    light: [],
    //dirt: [],
    timestamps: [],
  });
  const [latestData, setLatestData] = useState({
    temperature: 0,
    humidity: 0,
    light: 0,
    //dirt: 0,
  });
  const [ledStates, setLedStates] = useState({
    led: false,
    fan: false,
    warning: false,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
      const socket = new WebSocket('ws://localhost:8080/ws');
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        if (data.type === 'warningLed') {
          const isWarningOn = data.status === 'ON';
          console.log('Received warning state:', isWarningOn);
          setLedStates((prev) => ({ ...prev, warning: isWarningOn }));
        } else {
          setLatestData(data);
          const currentTime = new Date().toLocaleTimeString();
          setSensorData((prevData) => ({
            temperature: [...prevData.temperature.slice(-19), data.temperature],
            humidity: [...prevData.humidity.slice(-19), data.humidity],
            light: [...prevData.light.slice(-19), data.light],
            //dirt: [...prevData.dirt.slice(-19), data.dirt || 0],
            timestamps: [...prevData.timestamps.slice(-19), currentTime],
          }));
        
          const isWarning = data.temperature > 100 || data.humidity > 100 || data.light > 1000;
          setLedStates((prev) => ({ ...prev, warning: isWarning }));
        }
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed');
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return () => {
        socket.close();
      };
  }, []);

  const toggleLed = async (led) => {
    const newState = !ledStates[led];
    setLedStates((prev) => ({ ...prev, [led]: newState }));
    try {
      console.log(`Sending request to toggle ${led} to ${newState}`);
      const response = await fetch(`http://172.20.10.4:8080/api/led/${led}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newState),
      });
      console.log(`Response status: ${response.status}`);
      const responseText = await response.text();
      console.log(`Response body: ${responseText}`);
      if (!response.ok) {
        throw new Error(`Failed to toggle LED: ${responseText}`);
      }
    } catch (error) {
      console.error('Error toggling LED:', error);
      setMessage(`Failed to toggle ${led}: ${error.message}`);
      setLedStates((prev) => ({ ...prev, [led]: !newState }));
    }
  };

  const chartData = {
    labels: sensorData.timestamps,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: sensorData.temperature,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Humidity (%)',
        data: sensorData.humidity,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Light (lux)',
        data: sensorData.light,
        borderColor: 'rgb(255, 205, 86)',
        backgroundColor: 'rgba(255, 205, 86, 0.5)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sensor Data Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <div className="container">
      <Link to="/">Home</Link><br></br>
      <Link to="/sensor-history">Sensor History</Link><br></br>
      <Link to="/device-history">Device History</Link><br></br>
      <Link to="/dashboard2">Dashboard2</Link>
      <h1 className="title">Điều khiển thiết bị</h1>
      <div className="mainGrid">
        <div className="leftPanel">
          <div className="grid">
            <div className="card temperature">
              <h2 className="cardTitle">Temperature</h2>
              <p className="cardValue">{latestData.temperature}°C</p>
            </div>
            <div className="card humidity">
              <h2 className="cardTitle">Humidity</h2>
              <p className="cardValue">{latestData.humidity}%</p>
            </div>
            <div className="card light">
              <h2 className="cardTitle">Light</h2>
              <p className="cardValue">{latestData.light} lux</p>
            </div>
          </div>
          <div style={{fontSize:'24px',fontWeight:'bold',color:'#333',textAlign:'center',margin:'20px 0'}}>
            Biểu đồ theo dõi dữ liệu cảm biến
          </div>
          <div className="chartContainer">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
        <div className="rightPanel">
          <h2 className="controlTitle">LED Control</h2>
          <div className="ledControl">
            <div className="ledItem">
              <img
                src="/public/images/light.png"
                alt="LED 1"
                className={`ledImage ${ledStates.led ? '' : 'led-off'}`}
              />
              <button className="controlButton" onClick={() => toggleLed('led')}>
                {ledStates.led ? 'Tắt' : 'Bật'}
              </button>
            </div>
            <div className="ledItem">
              <img
                src="/public/images/fan.png"
                alt="Fan"
                className={`ledImage ${ledStates.fan ? 'fan-on' : ''}`}
              />
              <button className="controlButton" onClick={() => toggleLed('fan')}>
                {ledStates.fan ? 'Tắt' : 'Bật'}
              </button>
            </div>
            <div className="ledItem">
              <p>Warning Led</p>
              <div className={`warningLed ${ledStates.warning ? 'active' : ''}`}>
                {ledStates.warning ? (
                  <img src="/public/images/red.png" alt="LedWarning" className="redled" />
                ) : (
                  <img src="/public/images/blue.png" alt="LedWarning" className="bluered" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}