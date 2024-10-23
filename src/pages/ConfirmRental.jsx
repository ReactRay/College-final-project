import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore'; // Import getDocs for querying Firestore
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique ID generation

function ConfirmRental() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const { listing, startDate, endDate, totalSum } = location.state || {}; // Safe destructuring

  const paypalRef = useRef(); // Reference to the PayPal button container

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
                      value: totalSum, // The total amount to be charged
                      currency_code: 'USD', // Set the currency (USD as default)
                    },
                  },
                ],
              });
            },
            onApprove: async (data, actions) => {
              console.log('Payment approved, capturing payment...');
              return actions.order.capture().then(async (details) => {
                console.log('Payment captured:', details);
                toast.success(
                  `Payment successful for ${details.payer.name.given_name}`
                );
                await handleSubmitRequest('active'); // Proceed with active status after successful payment
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

    return () => clearTimeout(timeout); // Cleanup timeout if component unmounts
  }, [totalSum]);

  // Function to generate a random 5-digit confirmation number
  const generateConfirmationNumber = () => {
    return Math.floor(10000 + Math.random() * 90000); // Generates a number between 10000 and 99999
  };

  // Function to check if confirmation number is unique
  const isConfirmationUnique = async (confirmationNumber) => {
    const q = query(
      collection(db, 'requests'),
      where('confirmation', '==', confirmationNumber)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // If the query returns no results, the confirmation number is unique
  };

  // Function to generate a unique confirmation number by checking existing ones in Firestore
  const getUniqueConfirmationNumber = async () => {
    let confirmationNumber;
    let isUnique = false;
    while (!isUnique) {
      confirmationNumber = generateConfirmationNumber();
      isUnique = await isConfirmationUnique(confirmationNumber);
    }
    return confirmationNumber;
  };

  // Function to submit request to Firestore
  const handleSubmitRequest = async (status) => {
    try {
      const userUid = auth.currentUser.uid;

      // Generate a unique request ID
      const requestId = uuidv4(); // Use uuid for generating unique request ID

      // Generate a unique confirmation number
      const confirmationNumber = await getUniqueConfirmationNumber();

      const requestData = {
        requestId, // Store the unique request ID
        email: auth.currentUser.email,
        name: auth.currentUser.displayName,
        phoneNumber: listing.phoneNumber,
        make: listing.brand,
        model: listing.model,
        startDate,
        endDate,
        sum: totalSum,
        listingRef: listing.id,
        userRef: userUid,
        status, // Either 'pending' for pay later or 'active' for successful payment
        confirmation: confirmationNumber, // Add the unique confirmation number to the request
      };

      console.log('Storing request in Firestore with ID:', requestId);
      console.log('Confirmation Number:', confirmationNumber);

      // Store the request with the generated ID in Firestore
      await setDoc(doc(db, 'requests', requestId), requestData);

      toast.success(`Request submitted successfully with status: ${status}`);
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

  if (!listing) {
    return <div>Loading listing...</div>;
  }

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
        <p>Total Sum: {totalSum} ILS</p>
      </div>
      <div style={styles.buttonContainer}>
        <button
          onClick={() => navigate('/')}
          style={{ ...styles.button, ...styles.buttonCancel }}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSubmitRequest('pending')}
          style={styles.button}
        >
          Pay Later
        </button>
      </div>
      <div ref={paypalRef} style={styles.paypalButton}></div>
    </div>
  );
}

export default ConfirmRental;
