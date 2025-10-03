import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <WelcomePage />} 
          />
          
          <Route 
            path="/login" 
            element={
              user ? 
                <Navigate to="/dashboard" /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              user ? 
                <DashboardPage user={user} userType={userType} onLogout={handleLogout} /> : 
                <Navigate to="/" />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
