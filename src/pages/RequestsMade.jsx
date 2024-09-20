import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';

function RequestsMade() {
  const [requests, setRequests] = useState([]);
  const [listings, setListings] = useState({});
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    brand: '',
    model: '',
    startDate: '',
    endDate: '',
  });

  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      const q = query(
        collection(db, 'requests'),
        where('userRef', '==', auth.currentUser.uid)
      );

      const querySnap = await getDocs(q);
      let fetchedRequests = [];
      querySnap.forEach((doc) => {
        fetchedRequests.push({ id: doc.id, data: doc.data() });
      });

      setRequests(fetchedRequests);
      setFilteredRequests(fetchedRequests);

      const listingData = {};
      for (const request of fetchedRequests) {
        if (request.data.listingRef) {
          const listingDocRef = doc(db, 'listings', request.data.listingRef);
          const listingDocSnap = await getDoc(listingDocRef);
          if (listingDocSnap.exists()) {
            listingData[request.data.listingRef] = listingDocSnap.data();
          }
        }
      }
      setListings(listingData);
    };

    fetchRequests();
  }, [auth.currentUser.uid]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const filtered = requests.filter((request) => {
      const { brand, model, startDate, endDate } = filters;
      const requestStartDate = request.data.startDate.toDate();
      const requestEndDate = request.data.endDate.toDate();

      const matchesBrand = brand
        ? request.data.make.toLowerCase().includes(brand.toLowerCase())
        : true;
      const matchesModel = model
        ? request.data.model.toLowerCase().includes(model.toLowerCase())
        : true;
      const matchesStartDate = startDate
        ? requestStartDate >= new Date(startDate)
        : true;
      const matchesEndDate = endDate
        ? requestEndDate <= new Date(endDate)
        : true;

      return matchesBrand && matchesModel && matchesStartDate && matchesEndDate;
    });

    setFilteredRequests(filtered);
  };

  const styles = {
    container: {
      padding: '20px',
      marginBottom: '200px',
      maxWidth: '1000px',
      margin: '40px auto',
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
    filters: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '20px',
    },
    filterInput: {
      marginBottom: '10px',
      padding: '8px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      fontSize: '14px',
    },
    filterButton: {
      padding: '10px',
      backgroundColor: '#00cc66',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
    requestList: {
      listStyleType: 'none',
      padding: 0,
    },
    requestItem: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'center',
    },
    image: {
      width: '120px',
      height: 'auto',
      marginRight: '15px',
      borderRadius: '8px',
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
    },
    detailItem: {
      fontSize: '16px',
      marginBottom: '5px',
    },
    goBackButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      display: 'block',
      margin: '20px auto',
      width: 'fit-content',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>My Rental Requests</h1>

      {/* Filter Inputs */}
      <div style={styles.filters}>
        <input
          type="text"
          name="brand"
          placeholder="Filter by Brand"
          value={filters.brand}
          onChange={handleFilterChange}
          style={styles.filterInput}
        />
        <input
          type="text"
          name="model"
          placeholder="Filter by Model"
          value={filters.model}
          onChange={handleFilterChange}
          style={styles.filterInput}
        />
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={handleFilterChange}
          style={styles.filterInput}
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={filters.endDate}
          onChange={handleFilterChange}
          style={styles.filterInput}
        />
        <button onClick={applyFilters} style={styles.filterButton}>
          Apply Filters
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul style={styles.requestList}>
          {filteredRequests.map((request) => {
            const listing = listings[request.data.listingRef];
            return (
              <li key={request.id} style={styles.requestItem}>
                {listing && listing.imgUrl && listing.imgUrl.length > 0 ? (
                  <img
                    src={listing.imgUrl[0]}
                    alt={listing.make}
                    style={styles.image}
                  />
                ) : (
                  <p>No Image Available</p>
                )}
                <div style={styles.details}>
                  <p style={styles.detailItem}>Brand: {request.data.make}</p>
                  <p style={styles.detailItem}>Model: {request.data.model}</p>
                  <p style={styles.detailItem}>
                    Year: {listing ? listing.year : 'N/A'}
                  </p>
                  <p style={styles.detailItem}>Price: {request.data.sum} ₪</p>
                  <p style={styles.detailItem}>
                    Start Date:{' '}
                    {request.data.startDate.toDate().toLocaleDateString()}
                  </p>
                  <p style={styles.detailItem}>
                    End Date:{' '}
                    {request.data.endDate.toDate().toLocaleDateString()}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <button onClick={() => navigate('/profile')} style={styles.goBackButton}>
        Go Back to Profile
      </button>
    </div>
  );
}

export default RequestsMade;
