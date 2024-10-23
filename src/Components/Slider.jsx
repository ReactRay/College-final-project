import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.config';
import Spinner from './Spinner';
import MySwiper from './MySwiper';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Slider() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const auth = getAuth();

  // Check for authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // Fetch listings from Firestore
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(10));
        const querySnap = await getDocs(q);

        let listingsArray = [];
        querySnap.forEach((doc) => {
          listingsArray.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listingsArray);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleClick = (listingId, listingType) => {
    if (user) {
      // If the user is logged in, navigate to the listing page
      navigate(`/category/${listingType}/${listingId}`);
    } else {
      // If the user is not logged in, redirect to the login page
      navigate('/sign-in');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!listings || listings.length === 0) {
    return <></>; // If no listings are found, return nothing
  }

  return (
    <>
      <p className="exploreHeading">Recommended</p>
      <MySwiper listings={listings} onClick={handleClick} />
    </>
  );
}

export default Slider;
