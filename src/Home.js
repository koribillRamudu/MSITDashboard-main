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

  // Sort the categories alphabetically
  const sortedCategories = Object.keys(categorizedCourses).sort();

  // Sort courses within each category alphabetically
  sortedCategories.forEach((category) => {
    categorizedCourses[category] = categorizedCourses[category].sort((a, b) =>
      a.course_name.localeCompare(b.course_name)
    );
  });

  const masterCourses = Object.values(categorizedCourses)
    .flat()
    .filter((course) => course.course_name.includes('[Master]'));

  const handleCategoryClick = (category) => {
    setExpandedCategory((prevCategory) => (prevCategory === category ? null : category));
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
        {sortedCategories.map((category, index) => (
          <li key={index} className="category-item">
            <div
              onClick={() => handleCategoryClick(category)}
              className="category-title"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleCategoryClick(category)}
            >
              <FaChevronRight
                className={`arrow-icon ${expandedCategory === category ? 'expanded' : ''}`}
              />
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
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [daysInSelectedMonth, setDaysInSelectedMonth] = useState([]);

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
    setSelectedMonth(null);  // Reset selected month when course is changed
    setDaysInSelectedMonth([]);  // Reset days when course is changed
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

  const handleMonthClick = (month, course, key) => {
    setSelectedMonth(month);
    const days = [];
    const monthData = course.data[key];
  
    if (!monthData) {
      console.error("No data for the selected key.");
      return; // Exit if no data is available for the selected key
    }
  
    const monthAbbr = month.substring(0, 3); // e.g., "Oct"
    // console.log("monthAbbr: ", monthAbbr);
  
    // Store all keys from entries in a list
    const allKeys = [];
  
    monthData.forEach(entry => {
      if (typeof entry !== 'object') {
        console.error("Entry is not an object", entry);
        return;
      }
  
      // Collect all keys in the current entry
      const keysInEntry = Object.keys(entry);
      allKeys.push(...keysInEntry);
    });
  
    console.log("All Keys:", allKeys);
  
    const dateRegex = /^[A-Za-z]{3}, [A-Za-z]{3} \d{1,2}, \d{4}$/;
  
    allKeys.forEach(dateKey => {
      if (dateRegex.test(dateKey)) {
        const dateParts = dateKey.split(' '); 
        const keyMonthAbbr = dateParts[1];
  
        if (keyMonthAbbr === monthAbbr) {
          monthData.forEach(entry => {
            if (entry[dateKey]) {
              days.push({ date: dateKey, value: entry[dateKey] });
            }
          });
        }
      }
    });
  
    // console.log("Entries in Selected Month with Values:", days); 
    setDaysInSelectedMonth(days); 
  };

  const renderCourseData = (course, key) => {
    const courseData = course.data[key];
    if (!courseData || courseData.length === 0) return <div>No data available</div>;

    if (key === 'Master') {
      // Extract data from the Master entry
    const masterData = course.data[key][0]; // Assuming 'Master' data is an array with one entry
    if (!masterData) return <div>No Master data available</div>;

    // Extract required fields
    const {'Roll number': rollNumber, ...scores } = masterData;
    
    // Render Master data
    return (
      <div className="master-data">
        <h4>Master Data</h4>
        <table className="info-table">
          <tbody>
            
            <tr>
              <th>Roll Number</th>
              <td>{rollNumber || 'N/A'}</td>
            </tr>
            {/* Render the mastery scores dynamically */}
            {Object.entries(scores).map(([scoreType, scoreValue], index) => (
              <tr key={index}>
                <th>{scoreType}</th>
                <td>{scoreValue || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

    console.log("course:", course)
    if (course.course_name === 'Attendance' && course.data[key] !== 'Master' && course.data[key] !== 'Score scale') {
      console.log("hello: ", courseData);
      // Handle attendance data and month counts here...
      const getFullMonthFromDate = (dateStr) => {
        const monthMap = {
            'Jan': 'January',
            'Feb': 'February',
            'Mar': 'March',
            'Apr': 'April',
            'May': 'May',
            'Jun': 'June',
            'Jul': 'July',
            'Aug': 'August',
            'Sep': 'September',
            'Oct': 'October',
            'Nov': 'November',
            'Dec': 'December',
        };
        const monthAbbr = dateStr.split(' ')[1]; // Get the short month
        return monthMap[monthAbbr] || monthAbbr; // Return full month name or abbreviation if not found
    };

    // Create a map to store counts of "1"s for each month
    const monthCounts = new Map();

    // Iterate over date keys to populate the unique months and count "1"s
    course.data[key].forEach((entry) => {
        Object.keys(entry).forEach((date) => {
            if (date.includes(',')) { // Basic check for date format
                const month = getFullMonthFromDate(date);
                const value = entry[date];

                // Initialize or increment the count of "1"s for this month
                if (!monthCounts.has(month)) {
                    monthCounts.set(month, 0);
                }
                if (value === "1") {
                    monthCounts.set(month, monthCounts.get(month) + 1);
                }
            }
        });
    });

    // Convert monthCounts map to an array to display the months with counts
    const monthList = Array.from(monthCounts.entries());

    // Display the unique months as links in a list format, with count of "1"s beside each month
    return (
      <div className="vertical-table">
      <div className="month-links">
        <table className="info-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Class Attended</th>
            </tr>
          </thead>
          <tbody>
            {monthList.map(([month, countOfOnes], index) => (
              <tr key={index}>
                <td>
                  <a href="#" className="month-link" onClick={() => handleMonthClick(month, course, key)}>
                    {month}
                  </a>
                </td>
                <td>{countOfOnes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      {selectedMonth && (
        <div className="days-list">
          <h3>{selectedMonth}</h3>
    
          {/* Table to display entries in the selected month */}
          <table className="info-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {daysInSelectedMonth.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.value || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    
    );
    }
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
    setSelectedMonth(null); // Reset selected month when course is changed
    setDaysInSelectedMonth([]); // Reset days list
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
