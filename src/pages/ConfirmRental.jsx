import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function ConfirmRental() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const { listing, startDate, endDate, totalSum } = location.state;

  const paypalRef = useRef(); // Reference to the PayPal button container

  useEffect(() => {
    if (window.paypal) {
      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: totalSum, // The total amount to be charged
                    currency_code: 'USD', // Set the currency (USD as default)
                  },
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            return actions.order.capture().then(async (details) => {
              toast.success(
                `Payment successful for ${details.payer.name.given_name}`
              );
              await handleSubmitRequest(); // Proceed with the request after successful payment
            });
          },
          onError: (err) => {
            console.error('PayPal Checkout onError:', err);
            toast.error('Payment failed. Please try again.');
          },
        })
        .render(paypalRef.current);
    }
  }, [totalSum]);

  const handleSubmitRequest = async () => {
    try {
      const userUid = auth.currentUser.uid;
      const userDocRef = doc(db, 'users', userUid);
      const userDocSnap = await getDoc(userDocRef);

      let userPhoneNumber = userDocSnap.exists()
        ? userDocSnap.data().phoneNumber
        : '';

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
        startDate,
        endDate,
        sum: totalSum,
        listingRef: listing.id,
        userRef: userUid,
        status: 'pending',
      };

      const newRequestRef = doc(db, 'requests', `${userUid}_${listing.id}`);
      await setDoc(newRequestRef, requestData);

      toast.success('Request submitted successfully with status pending.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request.');
    }
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '400px',
      margin: '30px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      marginRight: '10px',
    },
    buttonCancel: {
      backgroundColor: '#e74c3c',
    },
    paypalButton: {
      width: '100%',
      marginTop: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <h1>Confirm Rental</h1>
      <img
        src={listing.imgUrl[0]}
        alt={listing.brand}
        style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }}
      />
      <div>
        <p>Brand: {listing.brand}</p>
        <p>Model: {listing.model}</p>
        <p>Year: {listing.year}</p>
        <p>Total Sum: {totalSum} USD</p>
      </div>
      <div style={styles.buttonContainer}>
        <button
          onClick={() => navigate('/')}
          style={{ ...styles.button, ...styles.buttonCancel }}
        >
          Cancel
        </button>
        <button onClick={handleSubmitRequest} style={styles.button}>
          Confirm
        </button>
      </div>
      <div ref={paypalRef} style={styles.paypalButton}></div>
    </div>
  );
}

export default ConfirmRental;
