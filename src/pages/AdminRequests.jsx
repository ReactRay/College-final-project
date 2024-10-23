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
    confirmation: '', // New filter for confirmation number
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

    setRequests(fetchedRequests);
    setFilteredRequests(fetchedRequests);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    const pendingRequests = requests.filter(
      (req) => req.data.status === 'pending'
    );
    const otherRequests = requests.filter(
      (req) => req.data.status !== 'pending'
    );

    otherRequests.sort(
      (a, b) => a.data.startDate.toDate() - b.data.startDate.toDate()
    );

    const sortedRequests = [...pendingRequests, ...otherRequests];
    setFilteredRequests(sortedRequests);
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

  const updateJobs = async () => {
    try {
      const jobsRef = collection(db, 'jobs');
      const activeJobsQuery = query(jobsRef, where('status', '==', 'active'));
      const activeJobsSnap = await getDocs(activeJobsQuery);

      const now = new Date();
      const batchUpdates = [];

      activeJobsSnap.forEach((jobDoc) => {
        const jobData = jobDoc.data();
        const endDate = jobData.endDate.toDate();

        if (endDate < now) {
          const jobDocRef = doc(db, 'jobs', jobDoc.id);
          batchUpdates.push(updateDoc(jobDocRef, { status: 'finished' }));
        }
      });

      await Promise.all(batchUpdates);
      alert('Updated all relevant jobs to finished.');
      fetchRequests();
    } catch (error) {
      console.error('Error updating jobs:', error);
      alert('Failed to update jobs.');
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
      flexWrap: 'wrap',
    },
    input: {
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      marginRight: '10px',
      marginBottom: '10px',
      width: 'calc(20% - 10px)',
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
    updateButton: {
      backgroundColor: '#f39c12',
      color: '#fff',
      padding: '10px 20px',
      margin: '20px 0',
      borderRadius: '4px',
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
        <input
          type="text"
          name="confirmation"
          placeholder="Filter by Confirmation Number" // New filter for confirmation number
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
        <button style={styles.button} onClick={applyFilters}>
          Apply Filters
        </button>
      </div>

      <button style={styles.updateButton} onClick={updateJobs}>
        Update Jobs to Finished
      </button>

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
                <p>Confirmation Number: {request.data.confirmation}</p>{' '}
                {/* Display confirmation number */}
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
