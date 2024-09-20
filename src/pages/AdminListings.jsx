import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import ListingItem from '../Components/ListingItem'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';

function AdminListings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ brand: '', model: '', year: '' });
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid), // Only show listings added by the current admin
        orderBy('timestamp', 'desc')
      );
      const querySnap = await getDocs(q);

      let fetchedListings = [];
      querySnap.forEach((doc) => {
        fetchedListings.push({ id: doc.id, data: doc.data() });
      });

      setListings(fetchedListings);
      setFilteredListings(fetchedListings);
      setLoading(false);
    };

    fetchListings();
  }, [auth.currentUser.uid]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    const filtered = listings.filter((listing) => {
      const matchesBrand = listing.data.brand
        .toLowerCase()
        .includes(filters.brand.toLowerCase());
      const matchesModel = listing.data.model
        .toLowerCase()
        .includes(filters.model.toLowerCase());
      const matchesYear = filters.year
        ? listing.data.year === filters.year
        : true;

      return matchesBrand && matchesModel && matchesYear;
    });

    setFilteredListings(filtered);
  };

  // Function to toggle status and update Firestore
  const handleToggleStatus = async (listingId, currentStatus) => {
    const newStatus =
      currentStatus === 'available' ? 'not-available' : 'available';
    const listingDocRef = doc(db, 'listings', listingId);

    try {
      await updateDoc(listingDocRef, { status: newStatus });

      // Update local state to reflect the change immediately
      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === listingId
            ? { ...listing, data: { ...listing.data, status: newStatus } }
            : listing
        )
      );
      setFilteredListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === listingId
            ? { ...listing, data: { ...listing.data, status: newStatus } }
            : listing
        )
      );
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Function to delete listing and update Firestore
  const handleDeleteListing = async (listingId) => {
    const listingDocRef = doc(db, 'listings', listingId);

    try {
      await deleteDoc(listingDocRef);

      // Update local state to remove the deleted listing
      setListings((prevListings) =>
        prevListings.filter((listing) => listing.id !== listingId)
      );
      setFilteredListings((prevListings) =>
        prevListings.filter((listing) => listing.id !== listingId)
      );
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const styles = {
    container: {
      padding: '20px',
      margin: '30px auto',
      maxWidth: '1200px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    filterContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      marginRight: '10px',
      width: '30%',
    },
    goBackButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      marginBottom: '20px',
    },
    listingList: {
      listStyleType: 'none',
      padding: 0,
    },
    noListings: {
      textAlign: 'center',
      fontSize: '18px',
      color: '#777',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>All Listings</h1>
        <button
          onClick={() => navigate('/profile')}
          style={styles.goBackButton}
        >
          Go Back to Profile
        </button>
      </header>

      <div style={styles.filterContainer}>
        <input
          type="text"
          name="brand"
          placeholder="Filter by brand"
          value={filters.brand}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="text"
          name="model"
          placeholder="Filter by model"
          value={filters.model}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="text"
          name="year"
          placeholder="Filter by year"
          value={filters.year}
          onChange={handleFilterChange}
          style={styles.input}
        />
      </div>

      {loading ? (
        <p style={styles.noListings}>Loading listings...</p>
      ) : filteredListings.length === 0 ? (
        <p style={styles.noListings}>No listings found.</p>
      ) : (
        <ul style={styles.listingList}>
          {filteredListings.map((listing) => (
            <ListingItem
              key={listing.id}
              listing={listing.data}
              id={listing.id}
              isAdmin={auth.currentUser.email === 'raydiaz1899@gmail.com'}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteListing} // Pass the delete handler
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminListings;
