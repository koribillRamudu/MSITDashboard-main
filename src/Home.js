import React, { useState, useEffect, useContext } from 'react';
import Header from './Header';
import { AuthContext } from './AuthContext';
import { fetchClasses } from './utils';
import axios from 'axios';
import './complete.css';
import { FaBook, FaChevronRight } from 'react-icons/fa';

const Sidebar = ({ courses, selectedCourse, onSelectCourse }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Group courses by category
  const categorizedCourses = courses.reduce((acc, course) => {
    const category = course.course_name.match(/\[(.*?)\]/)?.[1];
    if (category) {
      acc[category] = acc[category] || [];
      acc[category].push(course);
    } else {
      acc['Other'] = acc['Other'] || []; // Add to "Other" if no category
      acc['Other'].push(course);
    }
    return acc;
  }, {});

  const masterCourses = Object.values(categorizedCourses).flat().filter(course =>
    course.course_name.includes('[Master]')
  );

  const handleCategoryClick = (category) => {
    setExpandedCategory(prevCategory => (prevCategory === category ? null : category));
  };

  return (
    <div className="sidebar" role="navigation" aria-label="Course Categories">
      <h3 className="sidebar-header">Course Categories</h3>
      
      {masterCourses.length > 0 && (
        <div>
          <h4>Master Courses</h4>
          <ul className="course-list">
            {masterCourses.map((course, index) => (
              <li
                key={index}
                className={`course-item ${selectedCourse === course ? 'active' : ''}`}
                onClick={() => onSelectCourse(course)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && onSelectCourse(course)}
              >
                <FaBook className="course-icon" /> {course.course_name.replace(/\[.*?\]\s*/, '')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="category-list">
        {Object.keys(categorizedCourses).map((category, index) => (
          <li key={index} className="category-item">
            <div
              onClick={() => handleCategoryClick(category)}
              className="category-title"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category)}
            >
              <FaChevronRight className={`arrow-icon ${expandedCategory === category ? 'expanded' : ''}`} />
              {category}
            </div>
            {expandedCategory === category && (
              <ul className="course-list">
                {categorizedCourses[category].map((course, index) => (
                  <li
                    key={index}
                    className={`course-item ${selectedCourse === course ? 'active' : ''}`}
                    onClick={() => onSelectCourse(course)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onSelectCourse(course)}
                  >
                    <FaBook className="course-icon" /> {course.course_name.replace(/\[.*?\]\s*/, '')}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Home = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedKey, setSelectedKey] = useState('Master');

  useEffect(() => {
    const getClasses = async () => {
      try {
        // Fetch classes and handle it if needed
        await fetchClasses();
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
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData(user.email, user.encryptedEmail, user.class);
    }
  }, [user]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setSelectedKey('Master');
  };

  const renderCourseData = (course, key) => {
    // Check if the course data has the key
    const courseData = course.data[key];
    if (!courseData || courseData.length === 0) return <div>No data available</div>;

    return (
      <div className="vertical-table">
        {courseData.map((row, rowIndex) => (
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

  const handleKeyClick = (e, key) => {
    setSelectedKey(key);
  };

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
          {loading && <div className="loading-message">Loading...</div>}
          {selectedCourse && (
            <div className="data-display">
              <div className="left-pane">
                {Object.keys(selectedCourse.data).map((key, idx) => (
                  <div
                    key={idx}
                    className={`key-item ${selectedKey === key ? 'active' : ''}`}
                    onClick={(e) => handleKeyClick(e, key)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && handleKeyClick(e, key)}
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
