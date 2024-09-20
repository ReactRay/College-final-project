import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';

function ConfirmRental() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const { listing, startDate, endDate, totalSum } = location.state;

  const handleSubmitRequest = async () => {
    try {
      const userUid = auth.currentUser.uid;

      // Fetch phone number from Firestore
      const userDocRef = doc(db, 'users', userUid);
      const userDocSnap = await getDoc(userDocRef);

      let userPhoneNumber = '';

      if (userDocSnap.exists()) {
        userPhoneNumber = userDocSnap.data().phoneNumber || '';
        console.log('Phone number from Firestore:', userPhoneNumber);
      } else {
        console.warn('No user data found in Firestore for UID:', userUid);
      }

      if (!userPhoneNumber) {
        alert('No phone number found. Please update your profile.');
        return;
      }

      const requestData = {
        email: auth.currentUser.email,
        name: auth.currentUser.displayName,
        phoneNumber: userPhoneNumber,
        make: listing.brand,
        model: listing.model,
        startDate: startDate,
        endDate: endDate,
        sum: totalSum,
        listingRef: listing.id,
        userRef: userUid,
      };

      const newRequestRef = doc(db, 'requests', `${userUid}_${listing.id}`);
      await setDoc(newRequestRef, requestData);

      alert('Request submitted successfully.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request.');
    }
  };

  const styles = {
    container: {
      padding: '20px',
      marginBottom: '100px', // Adjust to avoid overlap with the Navbar
      maxWidth: '400px',
      margin: '30px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    image: {
      width: '100%',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    details: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    detailItem: {
      fontSize: '18px',
      marginBottom: '10px',
    },
    buttonsContainer: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      transition: 'background-color 0.3s ease',
    },
    buttonCancel: {
      backgroundColor: '#e74c3c',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Confirm Rental</h1>
      <img src={listing.imgUrl[0]} alt={listing.brand} style={styles.image} />

      <div style={styles.details}>
        <p style={styles.detailItem}>Brand: {listing.brand}</p>
        <p style={styles.detailItem}>Model: {listing.model}</p>
        <p style={styles.detailItem}>Year: {listing.year}</p>
        <p style={styles.detailItem}>Total Sum: {totalSum} ₪</p>
      </div>

      <div style={styles.buttonsContainer}>
        <button
          onClick={() => navigate('/')}
          style={{ ...styles.button, ...styles.buttonCancel }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmitRequest}
          style={styles.button}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor =
              styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = styles.button.backgroundColor)
          }
        >
          Submit Request
        </button>
      </div>
    </div>
  );
}

export default ConfirmRental;
