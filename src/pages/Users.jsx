// src/pages/Users.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../Components/Spinner';
import { useNavigate } from 'react-router-dom';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: '',
    phoneNumber: '',
    email: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('isAdmin', '==', false)); // Fetch only non-admin users
        const querySnap = await getDocs(q);

        let fetchedUsers = [];
        querySnap.forEach((doc) => {
          fetchedUsers.push({ id: doc.id, data: doc.data() });
        });

        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));

    const filtered = users.filter((user) => {
      const matchesName = user.data.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const matchesPhone = user.data.phoneNumber.includes(filters.phoneNumber);
      const matchesEmail = user.data.email
        .toLowerCase()
        .includes(filters.email.toLowerCase());
      return matchesName && matchesPhone && matchesEmail;
    });

    setFilteredUsers(filtered);
  };

  const handleUserClick = (id) => {
    navigate(`/user-profile/${id}`);
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '30px auto 80px',
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      cursor: 'pointer',
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '24px',
      fontWeight: 'bold',
    },
    userDetail: {
      fontSize: '16px',
      color: '#555',
    },
    filterContainer: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      justifyContent: 'center',
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      width: '30%',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Users List</h1>
      <div style={styles.filterContainer}>
        <input
          type="text"
          name="name"
          placeholder="Filter by Name"
          value={filters.name}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Filter by Phone Number"
          value={filters.phoneNumber}
          onChange={handleFilterChange}
          style={styles.input}
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by Email"
          value={filters.email}
          onChange={handleFilterChange}
          style={styles.input}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user.id}
            style={styles.card}
            onClick={() => handleUserClick(user.id)}
          >
            <p style={styles.userDetail}>Name: {user.data.name}</p>
            <p style={styles.userDetail}>Phone: {user.data.phoneNumber}</p>
            <p style={styles.userDetail}>Email: {user.data.email}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Users;
