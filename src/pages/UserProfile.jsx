import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import Spinner from '../Components/Spinner';
import { toast } from 'react-toastify';

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user data
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          toast.error('User not found');
        }

        // Fetch user requests
        const requestsRef = collection(db, 'requests');
        const q = query(requestsRef, where('userRef', '==', userId));
        const querySnap = await getDocs(q);

        let fetchedRequests = [];
        querySnap.forEach((doc) => {
          fetchedRequests.push({ id: doc.id, data: doc.data() });
        });

        // Fetch associated listings for each request
        const requestsWithListings = await Promise.all(
          fetchedRequests.map(async (request) => {
            if (request.data.listingRef) {
              const listingDocRef = doc(
                db,
                'listings',
                request.data.listingRef
              );
              const listingDocSnap = await getDoc(listingDocRef);
              if (listingDocSnap.exists()) {
                return { ...request, listingData: listingDocSnap.data() };
              }
            }
            return { ...request, listingData: null };
          })
        );

        setRequests(requestsWithListings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '30px auto',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    requestImage: {
      width: '100px',
      height: 'auto',
      borderRadius: '4px',
      marginRight: '10px',
    },
    userDetail: {
      fontSize: '16px',
      color: '#555',
    },
    requestDetail: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 0',
      borderBottom: '1px solid #ddd',
    },
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>User Profile</h1>
      {user && (
        <div style={styles.card}>
          <p style={styles.userDetail}>Name: {user.name}</p>
          <p style={styles.userDetail}>Phone: {user.phoneNumber}</p>
          <p style={styles.userDetail}>Email: {user.email}</p>
        </div>
      )}
      <h2 style={styles.header}>Requests</h2>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        requests.map((request) => (
          <div key={request.id} style={styles.requestDetail}>
            {request.listingData && request.listingData.imgUrl ? (
              <img
                src={request.listingData.imgUrl[0]} // Display the first image from the listing
                alt="Car"
                style={styles.requestImage}
                onError={(e) => {
                  e.target.src = 'path/to/placeholder/image.png'; // Replace with a path to your placeholder image
                  e.target.style.objectFit = 'contain';
                }}
              />
            ) : (
              <p style={styles.userDetail}>No Image Available</p>
            )}
            <div>
              <p style={styles.userDetail}>
                {request.data.make} {request.data.model}
              </p>
              <p style={styles.userDetail}>
                Start Date:{' '}
                {new Date(
                  request.data.startDate.seconds * 1000
                ).toLocaleDateString()}
              </p>
              <p style={styles.userDetail}>
                End Date:{' '}
                {new Date(
                  request.data.endDate.seconds * 1000
                ).toLocaleDateString()}
              </p>
              <p style={styles.userDetail}>
                Status: {request.data.status || 'N/A'}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UserProfile;
