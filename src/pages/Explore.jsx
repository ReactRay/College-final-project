import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import rentCategoryImage from '../assets/jpg/mercedesAmg.png';
import Slider from '../Components/Slider';

function Explore() {
  const [isAdmin, setIsAdmin] = useState(false);
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

    return () => unsubscribe();
  }, [auth]);

  const styles = {
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#00cc66',
      color: '#fff',
      fontSize: '16px',
    },
  };

  return (
    <div className="explore">
      <header>
        <p className="pageHeader">Explore</p>
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
            {/* New Button for Statistics Page */}
            <button
              style={styles.button}
              onClick={() => navigate('/statistics')}
            >
              View Statistics
            </button>
          </div>
        )}
        <Slider />
        <p className="exploreCategoryHeading">Categories</p>
        <div className="exploreCategories">
          <Link to="/category/rent">
            <img
              src={rentCategoryImage}
              alt="rent"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName">Cars for rent</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Explore;
