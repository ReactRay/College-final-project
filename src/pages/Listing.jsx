import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import Spinner from '../Components/Spinner';
import ListingSwiper from '../Components/ListingSwiper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState('');

  const navigate = useNavigate();
  const params = useParams();

  // Fetch listing and owner details
  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const listingData = docSnap.data();
        setListing(listingData);

        // Fetch owner's phone number
        const userDocRef = doc(db, 'users', listingData.userRef);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setOwnerPhoneNumber(userDocSnap.data().phoneNumber);
        }
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  // Calculate total rental price
  const calculateTotalPrice = () => {
    const price = parseFloat(listing.price);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysRequested = timeDiff / (1000 * 3600 * 24);
    return (price * daysRequested).toFixed(2);
  };

  // Navigate to ConfirmRental page
  const handleRentCar = () => {
    if (startDate >= endDate) {
      alert('End date must be after start date.');
      return;
    }

    const totalSum = calculateTotalPrice();

    navigate('/confirm-rental', {
      state: {
        listing: { ...listing, id: params.listingId },
        startDate: startDate,
        endDate: endDate,
        totalSum: totalSum,
      },
    });
  };

  if (loading) {
    return <Spinner />;
  }

  const isOwner = listing.userRef === params.userId;

  const styles = {
    listingName: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    listingLocation: {
      fontSize: '16px',
      color: '#555',
      marginBottom: '10px',
    },
    listingType: {
      fontSize: '14px',
      color: '#888',
      marginBottom: '10px',
    },
    listingStatus: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: listing.status === 'available' ? '#27ae60' : '#e74c3c',
    },
    listingDetailsList: {
      listStyleType: 'none',
      padding: 0,
      marginBottom: '20px',
    },
    listingOwnerPhone: {
      fontSize: '14px',
      color: '#444',
      marginBottom: '20px',
    },
    primaryButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      display: 'block',
      margin: '10px 0',
      textAlign: 'center',
    },
    rentSection: {
      marginTop: '20px',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      backgroundColor: '#f9f9f9',
    },
    datePicker: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '10px',
    },
    label: {
      marginBottom: '5px',
      fontWeight: 'bold',
    },
  };

  return (
    <main style={styles.container}>
      <ListingSwiper imgUrls={listing.imgUrl} />

      <div className="listingDetails">
        <p style={styles.listingName}>
          {listing.brand} - {listing.model} ({listing.year})
        </p>
        <p style={styles.listingLocation}>{listing.location}</p>
        <p style={styles.listingType}>
          for {listing.type === 'rent' ? 'Rent' : 'Sale'}
        </p>
        <p style={styles.listingStatus}>
          Status:{' '}
          {listing.status === 'available' ? 'Available' : 'Not Available'}
        </p>
        <ul style={styles.listingDetailsList}>
          <li>{listing.price} ₪</li>
        </ul>

        <p style={styles.listingOwnerPhone}>Owner Phone: {ownerPhoneNumber}</p>

        {!isOwner && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.brand}`}
            style={styles.primaryButton}
          >
            Contact Owner
          </Link>
        )}

        {listing.type === 'rent' && !isOwner && (
          <div style={styles.rentSection}>
            <div style={styles.datePicker}>
              <label style={styles.label}>Start Date:</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={new Date()}
              />
            </div>
            <div style={styles.datePicker}>
              <label style={styles.label}>End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate}
              />
            </div>
            <br />
            <button style={styles.primaryButton} onClick={handleRentCar}>
              Rent Car
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Listing;
