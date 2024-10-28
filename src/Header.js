// src/Header.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './complete.css';
import { colors } from '@material-ui/core';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to track the current theme
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/home">
        <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="logo" />
      </Link>
      <h1 className="title">Dashboard</h1>
      <button onClick={toggleTheme} className="theme-toggle-button">
        {isDarkTheme ? (
          <span role="img" aria-label="Light Mode">☀️ Light Mode</span>
        ) : (
          <span role="img" aria-label="Dark Mode">🌙 Dark Mode</span>
        )}
      </button>
      
      {user && (
        <button onClick={handleLogout} className="logout-button">Logout</button>
      )}
    </header>
  );
};

export default Header;
