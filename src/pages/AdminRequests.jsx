import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchRequests = async () => {
      const requestsRef = collection(db, 'requests');
      const querySnap = await getDocs(requestsRef);

      let fetchedRequests = [];
      for (const requestDoc of querySnap.docs) {
        const requestData = requestDoc.data();
        const listingRef = requestData.listingRef
          ? doc(db, 'listings', requestData.listingRef)
          : null;
        const listingData = listingRef
          ? (await getDoc(listingRef)).data()
          : null;
        fetchedRequests.push({
          id: requestDoc.id,
          data: requestData,
          listing: listingData,
        });
      }

      setRequests(fetchedRequests);
      setFilteredRequests(fetchedRequests);
    };

    fetchRequests();
  }, []);

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

  const styles = {
    container: {
      padding: '20px',
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
      flexDirection: 'column',
    },
    image: {
      width: '50%',
      maxHeight: '200px',
      borderRadius: '8px',
      marginBottom: '10px',
    },
    detailItem: {
      fontSize: '16px',
      marginBottom: '5px',
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
    cancelButton: {
      backgroundColor: '#e74c3c',
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

      {filteredRequests.length === 0 ? (
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
                <p style={styles.detailItem}>
                  Car: {request.listing?.brand} {request.listing?.model} (
                  {request.listing?.year})
                </p>
                <p style={styles.detailItem}>Renter: {request.data.name}</p>
                <p style={styles.detailItem}>
                  Phone: {request.data.phoneNumber}
                </p>
                <p style={styles.detailItem}>
                  Dates: {request.data.startDate?.toDate().toLocaleDateString()}{' '}
                  - {request.data.endDate?.toDate().toLocaleDateString()}
                </p>
                <div>
                  <button style={styles.button}>Confirm</button>
                  <button style={{ ...styles.button, ...styles.cancelButton }}>
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminRequests;
