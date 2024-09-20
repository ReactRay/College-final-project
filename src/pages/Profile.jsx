import React, { useState, useEffect } from 'react';
import { getAuth, updateProfile } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

function Profile() {
  const auth = getAuth();
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser ? auth.currentUser.displayName : '',
    email: auth.currentUser ? auth.currentUser.email : '',
    phoneNumber: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);

  const { name, email, phoneNumber } = formData;
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/sign-in');
      return;
    }

    const fetchUserData = async () => {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setFormData((prevState) => ({
          ...prevState,
          phoneNumber: userData.phoneNumber || '',
        }));
        setIsAdmin(userData.isAdmin || false);
      }
    };

    fetchUserData();
  }, [auth.currentUser, navigate]);

  const onLogOut = () => {
    auth.signOut();
    navigate('/');
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name,
        phoneNumber,
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Could not update profile details');
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '800px',
      margin: '40px auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    pageTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#00cc66',
      color: '#fff',
    },
    personalDetails: {
      marginBottom: '20px',
      padding: '10px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      backgroundColor: '#f9f9f9',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    input: {
      marginBottom: '10px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
    },
    buttonContainer: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>My Profile</h1>
        <button onClick={onLogOut} style={styles.button}>
          Logout
        </button>
      </header>
      <main>
        <div style={styles.personalDetails}>
          <h2>Personal Details</h2>
          <form style={styles.form}>
            <input
              type="text"
              id="name"
              style={styles.input}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              style={styles.input}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
            <input
              type="tel"
              id="phoneNumber"
              style={styles.input}
              disabled={!changeDetails}
              value={phoneNumber}
              onChange={onChange}
            />
          </form>
          <button
            onClick={() => {
              if (changeDetails) onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
            style={styles.button}
          >
            {changeDetails ? 'Save' : 'Change'}
          </button>
        </div>
        <div style={styles.buttonContainer}>
          {isAdmin ? (
            <>
              <Link to="/admin-requests">
                <button style={styles.button}>View Rental Requests</button>
              </Link>
              <Link to="/admin-listings">
                <button style={styles.button}>All Listings</button>
              </Link>
              <Link to="/create-listing">
                <button style={styles.button}>Create New Listing</button>
              </Link>
            </>
          ) : (
            <Link to="/my-requests">
              <button style={styles.button}>View My Requests</button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}

export default Profile;
