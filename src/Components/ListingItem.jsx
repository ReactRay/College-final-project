import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg';

function ListingItem({ listing, id, onDelete, onToggleStatus, isAdmin }) {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);

  // Check for authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [auth]);

  const handleClick = () => {
    // If the user is logged in, navigate to the listing page
    if (user) {
      navigate(`/category/${listing?.type}/${id}`);
    } else {
      // If the user is not logged in, redirect to the login page
      navigate('/sign-in');
    }
  };

  const styles = {
    listing: {
      listStyleType: 'none',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '16px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#fff',
      transition: 'box-shadow 0.3s ease',
      cursor: 'pointer',
      ':hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
    img: {
      width: '150px',
      height: 'auto',
      marginRight: '20px',
      borderRadius: '8px',
      objectFit: 'cover',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    location: {
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '4px',
      color: '#555',
    },
    name: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '8px',
      color: '#333',
    },
    year: {
      fontSize: '16px',
      color: '#777',
      marginBottom: '8px',
    },
    price: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2c3e50',
    },
    status: {
      padding: '8px 16px',
      borderRadius: '20px',
      margin: '8px 0',
      fontWeight: '500',
      color: listing?.status === 'available' ? '#27ae60' : '#e74c3c',
      backgroundColor: listing?.status === 'available' ? '#e9f7ef' : '#fceae9',
      alignSelf: 'flex-start',
    },
    phoneNumber: {
      padding: '10px 0',
      fontSize: '16px',
      color: '#333',
      borderTop: '1px solid #e0e0e0',
      marginTop: '16px',
      textAlign: 'right',
      backgroundColor: '#fafafa',
      paddingTop: '8px',
    },
    removeIcon: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      cursor: 'pointer',
    },
    toggleButton: {
      padding: '8px 12px',
      fontSize: '14px',
      cursor: 'pointer',
      border: '1px solid #007BFF',
      backgroundColor: '#007BFF',
      color: '#fff',
      borderRadius: '20px',
      alignSelf: 'flex-start',
      marginTop: '8px',
      ':hover': {
        backgroundColor: '#0056b3',
      },
    },
  };

  // Prevent rendering if `listing` is not defined or `status` is missing
  if (!listing || typeof listing.status === 'undefined') {
    return <p>Loading...</p>; // Add a loading state if data is missing
  }

  return (
    <li style={styles.listing} onClick={handleClick}>
      <img
        src={listing?.imgUrl?.[0] || 'default-image-url'}
        alt={listing?.name || 'No name'}
        style={styles.img}
      />
      <div style={styles.details}>
        <p style={styles.location}>{listing?.location || 'Unknown location'}</p>
        <p style={styles.name}>
          {listing?.brand || 'Unknown Brand'}{' '}
          {listing?.model || 'Unknown Model'}
        </p>
        <p style={styles.year}>{listing?.year || 'Unknown Year'}</p>
        <p style={styles.price}>
          {listing?.price || 'N/A'}₪ {listing?.type === 'rent' ? '/ Day' : ''}
        </p>
        <p style={styles.status}>
          Status:{' '}
          {listing?.status === 'available'
            ? 'Available'
            : listing?.status === 'not-available'
            ? 'Not Available'
            : 'unknown'}
        </p>
        {/* Displaying new fields: Seats and Category */}
        <p style={styles.year}>Seats: {listing?.seats || 'N/A'}</p>{' '}
        {/* Seats */}
        <p style={styles.year}>Category: {listing?.category || 'N/A'}</p>{' '}
        {/* Category */}
      </div>

      {isAdmin && (
        <button
          style={styles.toggleButton}
          onClick={(e) => {
            e.stopPropagation(); // Prevent parent click handler
            onToggleStatus(id, listing?.status);
          }}
        >
          Toggle Status
        </button>
      )}

      {onDelete && (
        <DeleteIcon
          style={styles.removeIcon}
          fill="rgb(231,76,60)"
          onClick={(e) => {
            e.stopPropagation(); // Prevent parent click handler
            onDelete(id);
          }}
        />
      )}
      <p style={styles.phoneNumber}>Contact: {listing?.phoneNumber || 'N/A'}</p>
    </li>
  );
}

export default ListingItem;
