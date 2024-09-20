import React from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as DeleteIcon } from '../assets/svg/deleteIcon.svg';

function ListingItem({ listing, id, onDelete, onToggleStatus, isAdmin }) {
  // Calculate discount amount if needed
  const discountAmount = listing.price - listing.discountedPrice;

  const styles = {
    listing: {
      listStyleType: 'none',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '8px',
      position: 'relative',
    },
    link: {
      textDecoration: 'none',
      color: 'inherit',
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    img: {
      width: '120px',
      height: 'auto',
      marginRight: '16px',
      flexShrink: 0,
    },
    details: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    location: {
      fontSize: '16px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
    },
    name: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0 0 8px 0',
    },
    year: {
      fontSize: '16px',
      color: '#555',
      margin: '0 0 8px 0',
    },
    price: {
      fontSize: '18px',
      fontWeight: 'bold',
      margin: '0',
    },
    originalPrice: {
      textDecoration: 'line-through',
      marginRight: '8px',
    },
    discountedPrice: {
      color: '#e74c3c',
      marginRight: '8px',
    },
    discountAmount: {
      color: '#e74c3c',
    },
    phoneNumber: {
      padding: '8px 0',
      fontSize: '16px',
      color: '#333',
      borderTop: '1px solid #ddd',
      backgroundColor: '#f9f9f9',
    },
    status: {
      padding: '8px',
      borderRadius: '4px',
      margin: '0 10px',
      color: listing.status === 'available' ? 'green' : 'red',
    },
    removeIcon: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      cursor: 'pointer',
    },
    toggleButton: {
      padding: '5px 10px',
      fontSize: '14px',
      cursor: 'pointer',
      border: '1px solid #007BFF',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      marginLeft: '10px',
    },
  };

  return (
    <li style={styles.listing}>
      <Link to={`/category/${listing.type}/${id}`} style={styles.link}>
        <img src={listing.imgUrl[0]} alt={listing.name} style={styles.img} />
        <div style={styles.details}>
          <p style={styles.location}>{listing.location}</p>
          <p style={styles.name}>
            {listing.brand} {listing.model}
          </p>
          <p style={styles.year}>{listing.year}</p>

          <p style={styles.price}>
            {listing.offer ? (
              <>
                <span style={styles.originalPrice}>{listing.price}₪</span>
                <span style={styles.discountedPrice}>
                  {listing.discountedPrice}₪
                </span>
                <span style={styles.discountAmount}>
                  (Save {discountAmount}₪)
                </span>
              </>
            ) : (
              `${listing.price}₪`
            )}
            {listing.type === 'rent' ? ' / Day' : ''}
          </p>

          <p style={styles.status}>
            Status:{' '}
            {listing.status === 'available' ? 'Available' : 'Not Available'}
          </p>
        </div>
      </Link>

      {/* Toggle Button for Admins */}
      {isAdmin && (
        <button
          style={styles.toggleButton}
          onClick={() => onToggleStatus(id, listing.status)}
        >
          Toggle Status
        </button>
      )}

      {onDelete && (
        <DeleteIcon
          style={styles.removeIcon}
          fill="rgb(231,76,60)"
          onClick={() => onDelete(id)}
        />
      )}
      <p style={styles.phoneNumber}>Contact: {listing.phoneNumber}</p>
    </li>
  );
}

export default ListingItem;
