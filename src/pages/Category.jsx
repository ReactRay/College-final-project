import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../Components/Spinner';
import ListingItem from '../Components/ListingItem';

function Category() {
  const [listings, setListings] = useState(null);
  const [filteredListings, setFilteredListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('');
  const [name, setName] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');

        // Fetch all listings of the specified category
        const q = query(
          listingsRef,
          where('type', '==', params.categoryName),
          orderBy('timestamp', 'desc'),
          limit(100)
        );

        const querySnap = await getDocs(q);

        let listings = [];
        querySnap.forEach((doc) => {
          listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        // Filter listings to only show available ones
        const availableListings = listings.filter(
          (listing) => listing.data.status === 'available'
        );

        setListings(availableListings);
        setFilteredListings(availableListings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch listings');
        setLoading(false);
      }
    };

    fetchListings();
  }, [params.categoryName]);

  useEffect(() => {
    if (listings) {
      const filtered = listings.filter((listing) => {
        const matchesName = name
          ? listing.data.brand.toLowerCase().includes(name.toLowerCase())
          : true;
        const matchesYear = year ? listing.data.year === year : true;
        const matchesMinPrice = minPrice
          ? parseFloat(listing.data.price) >= parseFloat(minPrice)
          : true;
        const matchesMaxPrice = maxPrice
          ? parseFloat(listing.data.price) <= parseFloat(maxPrice)
          : true;

        return matchesName && matchesYear && matchesMinPrice && matchesMaxPrice;
      });
      setFilteredListings(filtered);
    }
  }, [name, year, minPrice, maxPrice, listings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
  };

  const styles = {
    filterContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#f4f4f4',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    input: {
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '16px',
    },
    filterButton: {
      padding: '10px 20px',
      fontSize: '16px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#00cc66',
      color: '#fff',
      marginTop: '10px',
    },
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Cars for rent</p>
      </header>
      <form onSubmit={handleSearch} style={styles.filterContainer}>
        <input
          type="text"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Brand Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.filterButton}>
          Search
        </button>
      </form>
      {loading ? (
        <Spinner />
      ) : filteredListings && filteredListings.length > 0 ? (
        <main>
          <ul className="categoryListings">
            {filteredListings.map((listing) => (
              <ListingItem
                listing={listing.data}
                id={listing.id}
                key={listing.id}
              />
            ))}
          </ul>
        </main>
      ) : (
        <p>No listings available for this category</p>
      )}
    </div>
  );
}

export default Category;
