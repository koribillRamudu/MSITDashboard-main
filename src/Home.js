import React, { useState, useEffect, useContext } from 'react';
import Header from './Header';
import { AuthContext } from './AuthContext';
import { fetchClasses } from './utils';
import axios from 'axios';
import './complete.css';
import { FaBook, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({ courses, selectedCourse, onSelectCourse }) => (
  <div className="sidebar">
    <h3 className="sidebar-header">Your Courses</h3>
    <ul className="course-list">
      {courses.map((course, index) => (
        <li
          key={index}
          className={`course-item ${selectedCourse === course ? 'active' : ''}`}
          onClick={() => onSelectCourse(course)}
          role="button" // Accessibility improvement
          tabIndex={0} // Allow keyboard navigation
          onKeyPress={(e) => e.key === 'Enter' && onSelectCourse(course)} // Handle Enter key
        >
          <FaBook className="course-icon" /> {course.course_name}
        </li>
      ))}
    </ul>
  </div>
);

const LoadingSpinner = () => (
  <div className="loading-spinner">
    {/* Add your spinner or loading animation here */}
    Loading...
  </div>
);

const Home = () => {
  const { user } = useContext(AuthContext);
  const [selectedClass, setSelectedClass] = useState(user?.class || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedKey, setSelectedKey] = useState('Master');

  useEffect(() => {
    const getClasses = async () => {
      try {
        const folders = await fetchClasses();
        // Process fetched classes if needed
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    getClasses();
  }, []);

  const fetchData = async (email, encryptedEmail, className) => {
    try {
      setLoading(true);
      const response = await axios.post('https://bvsrauoaua.execute-api.ap-south-1.amazonaws.com/getData', {
        email,
        encryptedEmail,
        class: className,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setData(response.data);
        setUserMessage('');
      } else {
        setData(null);
        setUserMessage('Your data is not present in the requested class. Contact LMS team.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
      setUserMessage('An error occurred while fetching your data. Please try again later.');
    } finally {
      setLoading(false); // Ensure loading state is reset in finally block
    }
  };

  useEffect(() => {
    if (user && selectedClass) {
      fetchData(user.email, user.encryptedEmail, selectedClass);
    }
  }, [user, selectedClass]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSelectedKey('Master');
  };

  const handleKeyClick = (e, key) => {
    e.stopPropagation();
    setSelectedKey(key);
  };

  const renderStudentInfo = (course) => (
    <div className="info-section">
      <h4>Student Information</h4>
      <table className="info-table">
        <tbody>
          <tr>
            <th>Email</th>
            <td>{course.data.Master[0]?.email || 'N/A'}</td>
          </tr>
          <tr>
            <th>Student Name</th>
            <td>{course.data.Master[0]?.['Student name'] || 'N/A'}</td>
          </tr>
          <tr>
            <th>Roll Number</th>
            <td>{course.data.Master[0]?.['Roll number'] || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderScoresOverview = (course) => (
    <div className="scores-section">
      <h4>Scores Overview</h4>
      <table className="info-table">
        <tbody>
          <tr>
            <th>Participation Score</th>
            <td>{course.data.Master[0]?.['Participation score'] || 'N/A'}</td>
          </tr>
          <tr>
            <th>Actual Score</th>
            <td>{course.data.Master[0]?.['Actual score'] || 'N/A'}</td>
          </tr>
          <tr>
            <th>Total</th>
            <td>{course.data.Master[0]?.Total || 'N/A'}</td>
          </tr>
          <tr>
            <th>Grade</th>
            <td>{course.data.Master[0]?.Grade || 'N/A'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderCourseData = (course, key) => {
    if (!course.data[key]) {
      return <div>No data available for {key}</div>;
    }

    if (key === 'Master') {
      return (
        <div className="master-data">
          {renderStudentInfo(course)}
          {renderScoresOverview(course)}
        </div>
      );
    }

    return (
      <div className="vertical-table">
        {course.data[key].map((row, rowIndex) => (
          <div key={rowIndex} className="data-row">
            <h4>{`Entry ${rowIndex + 1}`}</h4>
            <table className="info-table">
              <tbody>
                {Object.entries(row).map(([header, value], index) => (
                  <tr key={index}>
                    <th>{header}</th>
                    <td>{value || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <Header />
      <div className="container">
        <Sidebar
          courses={data || []}
          selectedCourse={selectedCourse}
          onSelectCourse={handleCourseClick}
        />
        <div className="content">
          <h2>Welcome, {user?.profile?.name || 'User'}</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Class:</strong> {user?.class}</p>

          {selectedCourse && (
            <div className="data-display">
              <div className="left-pane">
                {Object.keys(selectedCourse.data).map((key, idx) => (
                  <div
                    key={idx}
                    className={`key-item ${selectedKey === key ? 'active' : ''}`}
                    onClick={(e) => handleKeyClick(e, key)}
                    role="button" // Accessibility improvement
                    tabIndex={0} // Allow keyboard navigation
                    onKeyPress={(e) => e.key === 'Enter' && handleKeyClick(e, key)} // Handle Enter key
                  >
                    <FaChevronRight className="arrow-icon" />
                    {key}
                  </div>
                ))}
              </div>
              <div className="right-pane">
                <div className="segment-card">
                  <div className="segment-card-header">{selectedKey}</div>
                  {renderCourseData(selectedCourse, selectedKey)}
                </div>
              </div>
            </div>
          )}

          {userMessage && <div className="error-message">{userMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default Home;
