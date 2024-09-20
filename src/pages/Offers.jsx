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

function Offers() {
  const [listings, setListings] = useState(null);
  const [filteredListings, setFilteredListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const listingsRef = collection(db, 'listings');

        let filters = [where('offer', '==', true)];
        if (year) filters.push(where('year', '==', parseInt(year)));

        const q = query(
          listingsRef,
          ...filters,
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

        setListings(listings);
        setFilteredListings(listings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching listings:', error);
        toast.error('Could not fetch listings');
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    if (listings) {
      const filtered = listings.filter((listing) => {
        const discountedPrice = parseFloat(listing.data.discountedPrice);
        const parsedMinPrice = parseFloat(minPrice);
        const parsedMaxPrice = parseFloat(maxPrice);
        const parsedYear = parseInt(year);

        // Debugging output
        console.log('Discounted Price:', discountedPrice);
        console.log('Min Price:', parsedMinPrice);
        console.log('Max Price:', parsedMaxPrice);
        console.log('Year:', parsedYear);

        const listingYear = parseInt(listing.data.year); // Ensure year is an integer

        const matchesName = listing.data.brand
          .toLowerCase()
          .includes(name.toLowerCase());
        const matchesYear = isNaN(parsedYear)
          ? true
          : listingYear === parsedYear;
        const matchesMinPrice = isNaN(parsedMinPrice)
          ? true
          : discountedPrice >= parsedMinPrice;
        const matchesMaxPrice = isNaN(parsedMaxPrice)
          ? true
          : discountedPrice <= parsedMaxPrice;

        // Debugging output
        console.log('Matches Name:', matchesName);
        console.log('Matches Year:', matchesYear);
        console.log('Matches Min Price:', matchesMinPrice);
        console.log('Matches Max Price:', matchesMaxPrice);

        return matchesName && matchesYear && matchesMinPrice && matchesMaxPrice;
      });
      setFilteredListings(filtered);
    }
  }, [name, year, minPrice, maxPrice, listings]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Filtering is handled automatically by useEffect
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
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
        <p>There are no current offers {params.categoryName}</p>
      )}
    </div>
  );
}

export default Offers;
