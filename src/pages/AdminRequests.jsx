import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);

  // Function to fetch requests
  const fetchRequests = async () => {
    setLoading(true);
    const requestsRef = collection(db, 'requests');
    const querySnap = await getDocs(requestsRef);

    let fetchedRequests = [];
    for (const requestDoc of querySnap.docs) {
      const requestData = requestDoc.data();
      const listingRef = requestData.listingRef
        ? doc(db, 'listings', requestData.listingRef)
        : null;
      const listingData = listingRef ? (await getDoc(listingRef)).data() : null;

      fetchedRequests.push({
        id: requestDoc.id,
        data: requestData,
        listing: listingData,
      });
    }

    setRequests(fetchedRequests);
    setFilteredRequests(fetchedRequests);
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    fetchRequests();
  }, []);

  // Apply filters to requests
  const applyFilters = () => {
    const { minPrice, maxPrice, startDate, endDate } = filters;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');

    const filtered = requests.filter((request) => {
      const requestPrice = parseFloat(request.listing?.price || 0);
      const requestStart = request.data.startDate.toDate();
      const requestEnd = request.data.endDate.toDate();

      return (
        requestPrice >= min &&
        requestPrice <= max &&
        requestStart >= start &&
        requestEnd <= end
      );
    });

    setFilteredRequests(filtered);
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const confirmRequest = async (request) => {
    const requestDocRef = doc(db, 'requests', request.id);

    try {
      await updateDoc(requestDocRef, { status: 'active' });

      const jobData = {
        listingRef: request.data.listingRef,
        make: request.data.make,
        model: request.data.model,
        phoneNumber: request.data.phoneNumber,
        startDate: request.data.startDate,
        endDate: request.data.endDate,
        status: 'active',
        sum: request.data.sum,
        userRef: request.data.userRef,
      };

      await addDoc(collection(db, 'jobs'), jobData);
      alert('Request confirmed and added to jobs.');

      // Refetch requests after confirming
      fetchRequests();
    } catch (error) {
      console.error('Error confirming request:', error);
      alert('Failed to confirm request.');
    }
  };

  const cancelRequest = async (requestId) => {
    const requestDocRef = doc(db, 'requests', requestId);

    try {
      await updateDoc(requestDocRef, { status: 'canceled' });
      alert('Request canceled.');

      // Refetch requests after canceling
      fetchRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      alert('Failed to cancel request.');
    }
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1000px',
      margin: '40px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
    },
    filters: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
    },
    input: {
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      marginRight: '10px',
      width: 'calc(25% - 10px)',
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
      width: '50%',
      maxHeight: '200px',
      borderRadius: '8px',
      marginRight: '10px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      marginRight: '10px',
    },
    confirmButton: {
      backgroundColor: '#27ae60',
      color: '#fff',
    },
    cancelButton: {
      backgroundColor: '#e74c3c',
      color: '#fff',
    },
  };

  return (
    <div style={styles.container}>
      <h1>Manage All Requests</h1>

      <div style={styles.filters}>
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={filters.endDate}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <button style={styles.button} onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <ul style={styles.requestList}>
          {filteredRequests.map((request) => (
            <li key={request.id} style={styles.requestItem}>
              {request.listing &&
              request.listing.imgUrl &&
              request.listing.imgUrl.length > 0 ? (
                <img
                  src={request.listing.imgUrl[0]}
                  alt={request.listing.brand}
                  style={styles.image}
                />
              ) : (
                <p>No Image Available</p>
              )}
              <div>
                <p>
                  Car: {request.data.make} {request.data.model}
                </p>
                <p>Renter: {request.data.name}</p>
                <p>Phone: {request.data.phoneNumber}</p>
                <p>
                  Dates: {request.data.startDate.toDate().toLocaleDateString()}{' '}
                  - {request.data.endDate.toDate().toLocaleDateString()}
                </p>
                <p>Status: {request.data.status}</p>
                {request.data.status === 'pending' && (
                  <div>
                    <button
                      style={{ ...styles.button, ...styles.confirmButton }}
                      onClick={() => confirmRequest(request)}
                    >
                      Confirm
                    </button>
                    <button
                      style={{ ...styles.button, ...styles.cancelButton }}
                      onClick={() => cancelRequest(request.id)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminRequests;
