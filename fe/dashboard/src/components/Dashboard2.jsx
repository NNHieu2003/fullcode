import React, { useState, useEffect } from 'react';
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
import './Dashboard2.css';
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

export default function Dashboard2() {
  const [sensorData, setSensorData] = useState({
    dirt: [],
    timestamps: [],
  });
  const [latestData, setLatestData] = useState({
    dirt: 0,
  });
  const [warningActive, setWarningActive] = useState(false);

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
        setWarningActive(isWarningOn);
      } else {
        setLatestData(prevData => ({
          ...prevData,
          dirt: data.dirt
        }));
        const currentTime = new Date().toLocaleTimeString();
        setSensorData((prevData) => ({
          dirt: [...prevData.dirt.slice(-5), data.dirt],
          timestamps: [...prevData.timestamps.slice(-5), currentTime],
        }));
      
        setWarningActive(data.dirt > 70);
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

  const chartData = {
    labels: sensorData.timestamps,
    datasets: [
      {
        label: 'Dirt Level',
        data: sensorData.dirt,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
        text: 'Dirt Sensor Data Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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
    <div className="dashboard2">
      <Link to="/">Home</Link>
      <h1 className="title">Dirt Sensor Dashboard</h1>
      <div className="mainGrid">
        <div className="card dirt">
          <h2 className="cardTitle">Mưa</h2>
          <p className="cardValue">{latestData.dirt}</p>
        </div>
        <div className="chartContainer">
          <Line options={chartOptions} data={chartData} />
        </div>
        
        <div className="ledItem">
          <p>Warning Led</p>
          <div className="warningLed">
            {warningActive ? (
              <img src="/public/images/red.png" alt="LedWarning" className="redled" />
            ) : (
              <img src="/public/images/blue.png" alt="LedWarning" className="blueled" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
