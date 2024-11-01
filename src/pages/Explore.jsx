import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import rentCategoryImage from '../assets/jpg/mercedesAmg.png';
import Slider from '../Components/Slider';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Explore() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setIsAdmin(userData.isAdmin || false);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData();
      } else {
        setIsAdmin(false);
      }
    });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [auth]);

  const handleSearchWithDates = () => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());

    navigate(`/category/rent?${queryParams.toString()}`);
  };

  // Conditional styles based on screen width
  const isMobile = windowWidth <= 480;
  const isTablet = windowWidth > 480 && windowWidth <= 768;

  const styles = {
    explore: {
      padding: '20px',
    },
    pageHeader: {
      fontSize: isMobile ? '18px' : isTablet ? '20px' : '24px',
      fontWeight: 'bold',
      color: '#2c2c2c',
      textAlign: 'center',
      marginBottom: '20px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: '20px',
    },
    button: {
      padding: isMobile ? '6px 12px' : isTablet ? '8px 16px' : '10px 20px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#00cc66',
      color: '#fff',
      fontSize: isMobile ? '12px' : isTablet ? '14px' : '16px',
      transition: 'background-color 0.3s ease',
    },
    headerWithButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      flexDirection: isMobile || isTablet ? 'column' : 'row',
      margin: '30px 0',
    },
    datePicker: {
      width: isMobile ? '100%' : '150px',
      maxWidth: '200px',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '14px',
    },
    imageLink: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      marginTop: '20px',
    },
    image: {
      width: isMobile ? '100%' : isTablet ? '250px' : '300px',
      height: 'auto',
      borderRadius: '8px',
      marginBottom: '10px',
    },
    imageText: {
      fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px',
      fontWeight: 'bold',
      color: '#2c2c2c',
    },
  };

  return (
    <div style={styles.explore}>
      <header>
        <p style={styles.pageHeader}>EasyCar</p>
      </header>
      <main>
        {isAdmin && (
          <div style={styles.buttonContainer}>
            <button
              style={styles.button}
              onClick={() => navigate('/admin-requests')}
            >
              View Rental Requests
            </button>
            <button
              style={styles.button}
              onClick={() => navigate('/admin-listings')}
            >
              All Listings
            </button>
            <button
              style={styles.button}
              onClick={() => navigate('/create-listing')}
            >
              Create New Listing
            </button>
            <button style={styles.button} onClick={() => navigate('/users')}>
              Manage Users
            </button>
            <button
              style={styles.button}
              onClick={() => navigate('/statistics')}
            >
              View Statistics
            </button>
          </div>
        )}
        <Slider />

        {/* Date filters and search button in a row with "Check Availability" header */}
        <div style={styles.headerWithButton}>
          <p style={styles.pageHeader}>Check Availability</p>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            placeholderText="Start Date"
            style={styles.datePicker}
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            minDate={startDate}
            placeholderText="End Date"
            style={styles.datePicker}
          />
          <button style={styles.button} onClick={handleSearchWithDates}>
            Search Available Cars
          </button>
        </div>

        <div style={styles.imageLink}>
          <Link to="/category/rent">
            <img
              src={rentCategoryImage}
              alt="Cars for rent"
              style={styles.image}
            />
            <p style={styles.imageText}>All Cars</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Explore;
