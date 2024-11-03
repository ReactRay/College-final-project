import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

function ConfirmRental() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const { listing, startDate, endDate, totalSum } = location.state || {};

  const paypalRef = useRef();
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [showPayLaterConfirmation, setShowPayLaterConfirmation] =
    useState(false);

  useEffect(() => {
    const loadPayPalButton = () => {
      if (window.paypal) {
        window.paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: totalSum,
                      currency_code: 'ILS',
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
                const confirmationNumber = await handleSubmitRequest('active');
                alert(
                  `Payment successful! Your confirmation number is: ${confirmationNumber}. Dates: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} (${numberOfDays} days).`
                );
                navigate('/my-requests');
              });
            },
            onError: (err) => {
              console.error('PayPal Checkout onError:', err);
              toast.error('Payment failed. Please try again.');
            },
          })
          .render(paypalRef.current);
      }
    };

    const timeout = setTimeout(() => {
      loadPayPalButton();
    }, 500);

    setNumberOfDays(calculateNumberOfDays(startDate, endDate));

    return () => clearTimeout(timeout);
  }, [totalSum, startDate, endDate]);

  const generateConfirmationNumber = () =>
    Math.floor(10000 + Math.random() * 90000);

  const isConfirmationUnique = async (confirmationNumber) => {
    const q = query(
      collection(db, 'requests'),
      where('confirmation', '==', confirmationNumber)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const getUniqueConfirmationNumber = async () => {
    let confirmationNumber;
    let isUnique = false;
    while (!isUnique) {
      confirmationNumber = generateConfirmationNumber();
      isUnique = await isConfirmationUnique(confirmationNumber);
    }
    return confirmationNumber;
  };

  const handleSubmitRequest = async (status) => {
    try {
      const userUid = auth.currentUser.uid;
      const requestId = uuidv4();
      const confirmationNumber = await getUniqueConfirmationNumber();

      const requestData = {
        requestId,
        email: auth.currentUser.email,
        name: auth.currentUser.displayName,
        phoneNumber: listing.phoneNumber,
        make: listing.brand,
        model: listing.model,
        category: listing.category,
        startDate,
        endDate,
        sum: totalSum,
        listingRef: listing.id,
        userRef: userUid,
        status,
        confirmation: confirmationNumber,
        timestamp: serverTimestamp(), // Add timestamp field
      };

      await setDoc(doc(db, 'requests', requestId), requestData);

      toast.success(`Request submitted successfully with status: ${status}`);
      return confirmationNumber;
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request.');
    }
  };

  const calculateNumberOfDays = (start, end) => {
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return Math.ceil(daysDiff);
  };

  const handlePayLater = async () => {
    const confirmationNumber = await handleSubmitRequest('pending');
    alert(
      `Your confirmation number is: ${confirmationNumber}. Dates: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} (${numberOfDays} days).`
    );
    navigate('/my-requests');
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '500px',
      margin: '30px auto 200px',
      borderRadius: '12px',
      backgroundColor: '#ffffff',
      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
    },
    image: {
      width: '100%',
      borderRadius: '12px',
      marginBottom: '20px',
      objectFit: 'cover',
    },
    heading: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#2c3e50',
      textAlign: 'center',
      marginBottom: '20px',
    },
    details: {
      marginTop: '20px',
      backgroundColor: '#f9f9f9',
      padding: '15px',
      borderRadius: '12px',
      fontSize: '16px',
      color: '#34495e',
      lineHeight: '1.6',
      textAlign: 'center',
    },
    detailsItem: {
      marginBottom: '10px',
      fontWeight: '500',
    },
    totalSum: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#27ae60',
      marginTop: '15px',
      textAlign: 'center',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '30px',
    },
    button: {
      padding: '12px 20px',
      fontSize: '16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      flex: 1,
      margin: '0 5px',
      textAlign: 'center',
      transition: 'background-color 0.3s ease',
    },
    buttonCancel: {
      backgroundColor: '#e74c3c',
    },
    paypalButton: {
      width: '100%',
      marginTop: '20px',
    },
    confirmationPopup: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
      zIndex: 1000,
    },
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 999,
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Confirm Rental</h1>
      <img src={listing.imgUrl[0]} alt={listing.brand} style={styles.image} />
      <div style={styles.details}>
        <p style={styles.detailsItem}>
          <strong>Car:</strong> {listing.brand} {listing.model} ({listing.year})
        </p>
        <p style={styles.detailsItem}>
          <strong>Rental Period:</strong> {startDate.toLocaleDateString()} to{' '}
          {endDate.toLocaleDateString()}
        </p>
        <p style={styles.detailsItem}>
          <strong>Number of Days:</strong> {numberOfDays}
        </p>
        <p style={styles.detailsItem}>
          <strong>Owner Contact:</strong> {listing.phoneNumber}
        </p>
        <p style={styles.totalSum}>Total: {totalSum} ILS</p>
      </div>

      <div style={styles.buttonContainer}>
        <button
          onClick={() => navigate('/')}
          style={{ ...styles.button, ...styles.buttonCancel }}
        >
          Cancel
        </button>
        <button
          onClick={() => setShowPayLaterConfirmation(true)}
          style={styles.button}
        >
          Pay Later
        </button>
      </div>
      <div ref={paypalRef} style={styles.paypalButton}></div>

      {showPayLaterConfirmation && (
        <>
          <div
            style={styles.overlay}
            onClick={() => setShowPayLaterConfirmation(false)}
          ></div>
          <div style={styles.confirmationPopup}>
            <p>
              "Choosing to pay later means that if someone else rents this car
              and pays online, your request could be canceled. Would you like to
              proceed with the 'Pay Later' option?"
            </p>
            <button
              onClick={handlePayLater}
              style={{ ...styles.button, marginTop: '10px' }}
            >
              Confirm Pay Later
            </button>
            <button
              onClick={() => setShowPayLaterConfirmation(false)}
              style={{
                ...styles.button,
                ...styles.buttonCancel,
                marginTop: '10px',
              }}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ConfirmRental;
