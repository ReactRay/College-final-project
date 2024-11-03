import React, { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
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
    status: 'all',
    confirmation: '',
  });
  const [loading, setLoading] = useState(true);

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

    // Separate pending requests and sort the rest by timestamp
    const pendingRequests = fetchedRequests.filter(
      (req) => req.data.status === 'pending'
    );
    const otherRequests = fetchedRequests
      .filter((req) => req.data.status !== 'pending')
      .sort((a, b) => b.data.timestamp.toDate() - a.data.timestamp.toDate());

    const sortedRequests = [...pendingRequests, ...otherRequests];
    setRequests(sortedRequests);
    setFilteredRequests(sortedRequests);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests]);

  const applyFilters = () => {
    const { minPrice, maxPrice, startDate, endDate, status, confirmation } =
      filters;
    const min = minPrice ? parseFloat(minPrice) : 0;
    const max = maxPrice ? parseFloat(maxPrice) : Infinity;
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-12-31');

    const filtered = requests.filter((request) => {
      const requestPrice = parseFloat(request.listing?.price || 0);
      const requestStart = request.data.startDate.toDate();
      const requestEnd = request.data.endDate.toDate();
      const requestStatus = request.data.status;
      const requestConfirmation = request.data.confirmation;

      const statusMatch = status === 'all' || requestStatus === status;
      const confirmationMatch = confirmation
        ? requestConfirmation.toString() === confirmation
        : true;

      return (
        requestPrice >= min &&
        requestPrice <= max &&
        requestStart >= start &&
        requestEnd <= end &&
        statusMatch &&
        confirmationMatch
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
    const { listingRef, startDate, endDate } = request.data;

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
      fetchRequests();
    } catch (error) {
      console.error('Error canceling request:', error);
      alert('Failed to cancel request.');
    }
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '40px auto 150px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)',
    },
    header: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#34495e',
      marginBottom: '20px',
      textAlign: 'center',
      letterSpacing: '1px',
    },
    filters: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: '30px',
      gap: '15px',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    },
    input: {
      padding: '10px',
      flex: '1',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '16px',
      backgroundColor: '#fff',
    },
    filterButton: {
      padding: '10px 18px',
      fontSize: '16px',
      borderRadius: '6px',
      backgroundColor: '#2980b9',
      color: '#fff',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#1b6ca8',
      },
    },
    requestList: {
      listStyle: 'none',
      padding: 0,
    },
    requestItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: '15px 20px',
      borderRadius: '10px',
      marginBottom: '15px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)',
    },
    image: {
      width: '120px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '8px',
      marginRight: '20px',
    },
    details: {
      flex: '1',
    },
    detailText: {
      fontSize: '16px',
      color: '#2c3e50',
      marginBottom: '6px',
    },
    status: (status) => ({
      fontSize: '16px',
      fontWeight: 'bold',
      color:
        status === 'pending'
          ? '#f1c40f'
          : status === 'active'
          ? '#27ae60'
          : status === 'canceled'
          ? '#e74c3c'
          : '#3498db', // default to blue for "finished"
      marginBottom: '6px',
    }),
    buttons: {
      display: 'flex',
      gap: '10px',
    },
    button: {
      padding: '10px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      border: 'none',
      fontSize: '14px',
      transition: 'background-color 0.2s ease',
      minWidth: '80px',
    },
    confirmButton: {
      backgroundColor: '#27ae60',
      color: '#fff',
      ':hover': {
        backgroundColor: '#219150',
      },
    },
    cancelButton: {
      backgroundColor: '#e74c3c',
      color: '#fff',
      ':hover': {
        backgroundColor: '#c0392b',
      },
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Manage All Requests</h1>

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
          value={filters.startDate}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="text"
          name="confirmation"
          placeholder="Confirmation Number"
          value={filters.confirmation}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          style={styles.input}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
          <option value="finished">Finished</option>
        </select>
        <button onClick={applyFilters} style={styles.filterButton}>
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
              <img
                src={
                  request.listing?.imgUrl[0] ||
                  'https://via.placeholder.com/150'
                }
                alt={request.listing?.brand || 'No Image'}
                style={styles.image}
              />
              <div style={styles.details}>
                <p style={styles.detailText}>
                  Car: {request.data.make} {request.data.model}
                </p>
                <p style={styles.detailText}>Renter: {request.data.name}</p>
                <p style={styles.detailText}>
                  Phone: {request.data.phoneNumber}
                </p>
                <p style={styles.detailText}>
                  Dates: {request.data.startDate.toDate().toLocaleDateString()}{' '}
                  - {request.data.endDate.toDate().toLocaleDateString()}
                </p>
                <p style={styles.detailText}>
                  Confirmation Number: {request.data.confirmation}
                </p>
                <p style={styles.detailText}>
                  Request Made:{' '}
                  {request.data.timestamp
                    ? request.data.timestamp.toDate().toLocaleString()
                    : 'N/A'}
                </p>
                <p style={styles.status(request.data.status)}>
                  Status: {request.data.status}
                </p>
              </div>
              {request.data.status === 'pending' && (
                <div style={styles.buttons}>
                  <button
                    onClick={() => confirmRequest(request)}
                    style={{ ...styles.button, ...styles.confirmButton }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => cancelRequest(request.id)}
                    style={{ ...styles.button, ...styles.cancelButton }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminRequests;
