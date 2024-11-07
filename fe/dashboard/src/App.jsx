

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SensorDashboard from './components/SensorDashboard';
import SensorHistory from './components/SensorHistory';
import DeviceHistory from './components/DeviceHistory';
import Dashboard2 from './components/Dashboard2';


function App() {
  return (
    <Router>
      <div>
        {/* <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/sensor-history">Sensor History</Link>
            </li>
            <li>
              <Link to="/device-history">Device History</Link>
            </li>
          </ul>
        </nav> */}

        <Routes>
          <Route path="/" element={<SensorDashboard />} />
          <Route path="/sensor-history" element={<SensorHistory />} />
          <Route path="/device-history" element={<DeviceHistory />} />
          <Route path="/dashboard2" element={<Dashboard2/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
