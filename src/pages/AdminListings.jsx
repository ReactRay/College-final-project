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
import { useNavigate } from 'react-router-dom';

function AdminListings() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    year: '',
    seats: '',
    category: '',
  });
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser.uid),
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
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const applyFilters = () => {
    const filtered = listings.filter((listing) => {
      const matchesBrand = filters.brand
        ? listing.data.brand.toLowerCase().includes(filters.brand.toLowerCase())
        : true;
      const matchesModel = filters.model
        ? listing.data.model.toLowerCase().includes(filters.model.toLowerCase())
        : true;
      const matchesYear = filters.year
        ? listing.data.year === filters.year
        : true;
      const matchesSeats = filters.seats
        ? listing.data.seats === filters.seats
        : true;
      const matchesCategory = filters.category
        ? listing.data.category
            .toLowerCase()
            .includes(filters.category.toLowerCase())
        : true;

      return (
        matchesBrand &&
        matchesModel &&
        matchesYear &&
        matchesSeats &&
        matchesCategory
      );
    });

    setFilteredListings(filtered);
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      model: '',
      year: '',
      seats: '',
      category: '',
    });
    setFilteredListings(listings); // Reset the listings to show all
  };

  const handleToggleStatus = async (listingId, currentStatus) => {
    const newStatus =
      currentStatus === 'available' ? 'not-available' : 'available';
    const listingDocRef = doc(db, 'listings', listingId);

    try {
      await updateDoc(listingDocRef, { status: newStatus });

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

  const handleDeleteListing = async (listingId) => {
    const listingDocRef = doc(db, 'listings', listingId);

    try {
      await deleteDoc(listingDocRef);

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
      flexWrap: 'wrap',
      gap: '10px',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      marginBottom: '20px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      width: '180px',
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '16px',
    },
    filterButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      marginTop: '10px',
    },
    clearButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#FF6347',
      color: '#fff',
      marginTop: '10px',
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
    listingItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9',
    },
    image: {
      width: '100px',
      height: 'auto',
      borderRadius: '8px',
      marginRight: '10px',
    },
    toggleButton: {
      padding: '10px 16px',
      fontSize: '14px',
      borderRadius: '20px',
      border: '2px solid #007BFF',
      cursor: 'pointer',
      backgroundColor: '#f0f8ff',
      color: '#007BFF',
      transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    deleteButton: {
      padding: '8px 12px',
      fontSize: '14px',
      borderRadius: '20px',
      border: '2px solid #e74c3c',
      cursor: 'pointer',
      backgroundColor: '#fdecea',
      color: '#e74c3c',
      marginLeft: '10px',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>All Listings</h1>
        <button
          onClick={() => navigate('/profile')}
          style={styles.filterButton}
        >
          Go Back to Profile
        </button>
      </header>

      <div style={styles.filterContainer}>
        <div style={styles.inputGroup}>
          <label>Brand</label>
          <input
            type="text"
            name="brand"
            placeholder="Brand"
            value={filters.brand}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Model</label>
          <input
            type="text"
            name="model"
            placeholder="Model"
            value={filters.model}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Year</label>
          <input
            type="text"
            name="year"
            placeholder="Year"
            value={filters.year}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Seats</label>
          <input
            type="text"
            name="seats"
            placeholder="Seats"
            value={filters.seats}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label>Category</label>
          <input
            type="text"
            name="category"
            placeholder="Category"
            value={filters.category}
            onChange={handleFilterChange}
            style={styles.input}
          />
        </div>
        <button onClick={applyFilters} style={styles.filterButton}>
          Apply Filters
        </button>
        <button onClick={clearFilters} style={styles.clearButton}>
          Clear Filters
        </button>
      </div>

      {loading ? (
        <p style={styles.noListings}>Loading listings...</p>
      ) : filteredListings.length === 0 ? (
        <p style={styles.noListings}>No listings found.</p>
      ) : (
        <ul style={styles.listingList}>
          {filteredListings.map((listing) => (
            <li key={listing.id} style={styles.listingItem}>
              {listing.data.imgUrl && listing.data.imgUrl.length > 0 ? (
                <img
                  src={listing.data.imgUrl[0]} // Display the first image
                  alt={listing.data.brand}
                  style={styles.image}
                />
              ) : (
                <p>No Image Available</p>
              )}
              <div>
                <h3>
                  {listing.data.brand} {listing.data.model}
                </h3>
                <p>Year: {listing.data.year}</p>
                <p>Seats: {listing.data.seats}</p>
                <p>Category: {listing.data.category}</p>
                <p>Price: {listing.data.price}₪ / Day</p>
                <p>Status: {listing.data.status}</p>
                <p>Contact: {listing.data.phoneNumber}</p>
              </div>
              <div>
                <button
                  style={styles.toggleButton}
                  onClick={() =>
                    handleToggleStatus(listing.id, listing.data.status)
                  }
                >
                  Toggle Status
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDeleteListing(listing.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminListings;
