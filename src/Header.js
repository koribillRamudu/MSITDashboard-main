// src/Header.js
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './complete.css';
// import { colors } from '@material-ui/core';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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
    <header className="header container-fluid">
      <div className="d-flex align-items-center">
        <Link to="/home">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="Logo" className="logo" />
        </Link>
        <h1 className="title mx-auto"><center>Dashboard</center></h1>
      </div>
      <div className="d-flex align-items-center justify-content-end">
        <button onClick={toggleTheme} className="theme-toggle-button">
          {isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        {user && (
          <button onClick={handleLogout} className="logout-button">Logout</button>
        )}
      </div>
    </header>
  );
};

export default Header;
