import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase.config';

const styles = {
  container: {
    padding: '15px',
    maxWidth: '700px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '20px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
  },
  listItem: {
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '8px',
  },
  label: {
    fontWeight: 'bold',
  },
};

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const requestsRef = collection(db, 'requests');
      const requestSnap = await getDocs(requestsRef);

      let fetchedRequests = [];
      requestSnap.forEach((doc) => {
        fetchedRequests.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setRequests(fetchedRequests);
      setLoading(false);
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <p>Loading requests...</p>;
  }

  if (requests.length === 0) {
    return <p>No requests found.</p>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Rental Requests</h3>
      <ul style={styles.list}>
        {requests.map((request) => (
          <li key={request.id} style={styles.listItem}>
            <p>
              <span style={styles.label}>Email:</span> {request.data.email}
            </p>
            <p>
              <span style={styles.label}>Name:</span> {request.data.name}
            </p>
            <p>
              <span style={styles.label}>Phone Number:</span>{' '}
              {request.data.phoneNumber}
            </p>
            <p>
              <span style={styles.label}>Car:</span> {request.data.make}{' '}
              {request.data.model}
            </p>
            <p>
              <span style={styles.label}>Rental Period:</span>{' '}
              {request.data.startDate.toDate().toLocaleDateString()} -{' '}
              {request.data.endDate.toDate().toLocaleDateString()}
            </p>
            <p>
              <span style={styles.label}>Total Price:</span>{' '}
              {parseFloat(request.data.sum).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Requests;
