import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from './AuthContext';
import Header from './Header';
import './Login.css';
import axios from 'axios';
import { fetchClasses, encryptEmail } from './utils';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getClasses = async () => {
      try {
        const folders = await fetchClasses();
        setClasses(folders);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    getClasses();
  }, []);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });
        const profile = userInfoResponse.data;
        const encryptedEmail = encryptEmail(profile.email);
        const userData = {
          token: tokenResponse.access_token,
          profile: profile,
          class: selectedClass,
          email: profile.email,
          encryptedEmail: encryptedEmail,
        };
        login(userData);
        navigate('/home');
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
    },
  });

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error.message}</div>;
  }

  return (
    <div>
      <Header />
      <div className="login-container">
        <div className="class-dropdown">
          <select id="classSelect" value={selectedClass} onChange={handleClassChange}>
            <option value="" disabled>Select your class</option>
            {classes.map((className, index) => (
              <option key={index} value={className}>{className}</option>
            ))}
          </select>
        </div>
        <button onClick={() => googleLogin()} className="google-login-button" disabled={!selectedClass}>
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo"/>
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
