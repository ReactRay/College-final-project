import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
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
  const [bookedDates, setBookedDates] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const params = useParams();

  // Fetch listing and owner details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const docRef = doc(db, 'listings', params.listingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const listingData = docSnap.data();
          setListing(listingData);

          // Fetch owner's phone number if userRef exists
          if (listingData.userRef) {
            const userDocRef = doc(db, 'users', listingData.userRef);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setOwnerPhoneNumber(userDocSnap.data().phoneNumber);
            }
          }

          // Fetch active requests to disable booked dates
          const requestsQuery = query(
            collection(db, 'requests'),
            where('listingRef', '==', params.listingId),
            where('status', '==', 'active')
          );
          const requestsSnap = await getDocs(requestsQuery);
          const datesToDisable = [];

          requestsSnap.forEach((request) => {
            const requestData = request.data();
            const requestStart = requestData.startDate.toDate();
            const requestEnd = requestData.endDate.toDate();

            // Add each day between start and end to the disabled dates
            let currentDate = new Date(requestStart);
            while (currentDate <= requestEnd) {
              datesToDisable.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
          });

          setBookedDates(datesToDisable);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching listing data:', error);
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

  // Check if any date in the range is booked
  const isDateRangeValid = () => {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (
        bookedDates.some(
          (date) => date.toDateString() === currentDate.toDateString()
        )
      ) {
        return false; // A booked date is found within the range
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true; // No booked dates within the range
  };

  // Navigate to ConfirmRental page
  const handleRentCar = () => {
    if (startDate >= endDate) {
      setErrorMessage('End date must be after start date.');
      return;
    }

    if (!isDateRangeValid()) {
      setErrorMessage('Selected dates include unavailable (booked) days.');
      return;
    }

    setErrorMessage(''); // Clear any previous error message

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
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '12px',
      marginBottom: '80px',
    },
    listingName: {
      fontSize: '28px',
      fontWeight: '700',
      marginBottom: '12px',
      color: '#2c3e50',
    },
    listingLocation: {
      fontSize: '18px',
      color: '#7f8c8d',
      marginBottom: '12px',
      fontWeight: '500',
    },
    listingType: {
      fontSize: '16px',
      color: '#95a5a6',
      marginBottom: '12px',
    },
    listingStatus: {
      fontSize: '18px',
      fontWeight: '600',
      color: listing.status === 'available' ? '#27ae60' : '#e74c3c',
      backgroundColor: listing.status === 'available' ? '#e9f7ef' : '#fceae9',
      padding: '8px 16px',
      borderRadius: '20px',
      marginBottom: '16px',
      display: 'inline-block',
    },
    listingDetailsList: {
      listStyleType: 'none',
      padding: 0,
      marginBottom: '20px',
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
    },
    listingDetailsItem: {
      fontSize: '16px',
      fontWeight: '500',
      color: '#34495e',
    },
    listingOwnerPhone: {
      fontSize: '16px',
      color: '#333',
      backgroundColor: '#f9f9f9',
      padding: '10px',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    primaryButton: {
      padding: '12px 24px',
      fontSize: '16px',
      borderRadius: '25px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      textAlign: 'center',
      display: 'inline-block',
      transition: 'background-color 0.3s ease',
      ':hover': {
        backgroundColor: '#0056b3',
      },
    },
    rentSection: {
      marginTop: '30px',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      backgroundColor: '#f9f9f9',
    },
    datePicker: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '20px',
    },
    label: {
      marginBottom: '8px',
      fontWeight: '600',
      color: '#34495e',
    },
    errorMessage: {
      color: 'red',
      fontWeight: 'bold',
      marginBottom: '20px',
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
          <li>Price: {listing.price} ₪ per day</li>
          <li>Seats: {listing.seats}</li> {/* New field for seats */}
          <li>Category: {listing.category}</li> {/* New field for category */}
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
                excludeDates={bookedDates}
              />
            </div>
            <div style={styles.datePicker}>
              <label style={styles.label}>End Date:</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                minDate={startDate}
                excludeDates={bookedDates}
              />
            </div>

            {/* Error message display */}
            {errorMessage && <p style={styles.errorMessage}>{errorMessage}</p>}

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
