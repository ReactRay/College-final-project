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
  const [seats, setSeats] = useState('');
  const [category, setCategory] = useState('');

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
        const matchesSeats = seats ? listing.data.seats === seats : true;
        const matchesCategory = category
          ? listing.data.category === category
          : true;

        return (
          matchesName &&
          matchesYear &&
          matchesMinPrice &&
          matchesMaxPrice &&
          matchesSeats &&
          matchesCategory
        );
      });
      setFilteredListings(filtered);
    }
  }, [name, year, minPrice, maxPrice, seats, category, listings]);

  const handleClearFilters = () => {
    // Reset all filter values to default
    setYear('');
    setName('');
    setMinPrice('');
    setMaxPrice('');
    setSeats('');
    setCategory('');

    // Reset filtered listings to show all available listings
    setFilteredListings(listings);
  };

  const styles = {
    filterContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#f0f4f8',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    input: {
      flex: '1',
      minWidth: '150px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '16px',
      backgroundColor: '#fff',
      transition: 'border-color 0.3s ease',
      ':focus': {
        borderColor: '#007BFF',
      },
    },
    select: {
      flex: '1',
      minWidth: '150px',
      padding: '12px',
      borderRadius: '8px',
      border: '1px solid #ccc',
      fontSize: '16px',
      backgroundColor: '#fff',
      transition: 'border-color 0.3s ease',
      ':focus': {
        borderColor: '#007BFF',
      },
    },
    filterButton: {
      padding: '12px 24px',
      fontSize: '16px',
      borderRadius: '25px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      transition: 'background-color 0.3s ease',
      ':hover': {
        backgroundColor: '#0056b3',
      },
      alignSelf: 'center',
    },
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Cars for rent</p>
      </header>
      <form style={styles.filterContainer}>
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
        <input
          type="number"
          placeholder="Number of Seats"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
          style={styles.input}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Category</option>
          <option value="suv">SUV</option>
          <option value="sedan">Sedan</option>
          <option value="coupe">Coupe</option>
          <option value="cabriolet">Cabriolet</option>
          <option value="hatchback">Hatchback</option>
        </select>
        <button
          type="button"
          onClick={handleClearFilters}
          style={styles.filterButton}
        >
          Clear
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
