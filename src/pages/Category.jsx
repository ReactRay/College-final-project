import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    // Extract date filters from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const start = queryParams.get('startDate');
    const end = queryParams.get('endDate');

    if (start) setStartDate(new Date(start));
    if (end) setEndDate(new Date(end));
  }, [location.search]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');
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
    const filterByDateAvailability = async () => {
      if (listings && startDate && endDate) {
        const unavailableListings = new Set();

        for (const listing of listings) {
          const requestsQuery = query(
            collection(db, 'requests'),
            where('listingRef', '==', listing.id),
            where('status', '==', 'active')
          );

          const requestsSnap = await getDocs(requestsQuery);

          requestsSnap.forEach((requestDoc) => {
            const requestData = requestDoc.data();
            const requestStart = requestData.startDate.toDate();
            const requestEnd = requestData.endDate.toDate();

            if (startDate <= requestEnd && endDate >= requestStart) {
              unavailableListings.add(listing.id);
            }
          });
        }

        const availableListings = listings.filter(
          (listing) => !unavailableListings.has(listing.id)
        );

        setFilteredListings(availableListings);
      } else {
        setFilteredListings(listings);
      }
    };

    filterByDateAvailability();
  }, [startDate, endDate, listings]);

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
        const matchesSeats = seats
          ? parseInt(listing.data.seats) === parseInt(seats)
          : true;
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
    setYear('');
    setName('');
    setMinPrice('');
    setMaxPrice('');
    setSeats('');
    setCategory('');
    setStartDate(null);
    setEndDate(null);
    setFilteredListings(listings);
  };

  const styles = {
    filterContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '10px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#f0f4f8',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    },
    input: {
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box',
    },
    select: {
      padding: '8px',
      borderRadius: '6px',
      border: '1px solid #ddd',
      fontSize: '16px',
      width: '100%',
      boxSizing: 'border-box',
    },
    filterButton: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '6px',
      backgroundColor: '#00cc66',
      color: '#fff',
      cursor: 'pointer',
      textAlign: 'center',
      border: 'none',
    },
    clearButton: {
      padding: '10px',
      fontSize: '16px',
      borderRadius: '6px',
      backgroundColor: '#FF6347',
      color: '#fff',
      cursor: 'pointer',
      textAlign: 'center',
      border: 'none',
    },
    pageHeader: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '20px',
      textAlign: 'center',
    },
  };

  return (
    <div className="category">
      <header>
        <p style={styles.pageHeader}>Cars for rent</p>
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
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          style={styles.input}
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          style={styles.input}
        />
        <button
          type="button"
          onClick={handleClearFilters}
          style={styles.clearButton}
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
