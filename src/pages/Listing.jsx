import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase.config';
import Spinner from '../Components/Spinner';
import shareIcon from '../assets/svg/shareIcon.svg';
import ListingSwiper from '../Components/ListingSwiper';

function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log(docSnap.data());
        setListing(docSnap.data());
        setLoading(false);
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
      <ListingSwiper imgUrls={listing.imgUrl} />

      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="share" />
      </div>
      {shareLinkCopied && <p className="linkCopied">Link Copied!</p>}

      <div className="listingDetails">
        <p className="listingName">
          {listing.brand} - {listing.model} ({listing.year})
        </p>
        <p className="listingLocation">{listing.location}</p>
        <p className="listingType">for {listing.type === 'rent' ? 'Rent' : 'Sale'}</p>
        {listing.offer && (
          <p className="discountPrice">
            {listing.price - listing.discountedPrice} ILS discount
          </p>
        )}
        <ul className="listingDetailsList">
          <li>{listing.offer ? listing.discountedPrice : listing.price} ILS</li>
          <li>{listing.seats} seats</li>
        </ul>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            to={`/contact/${listing.userRef}?listingName=${listing.brand}`}
            className="primaryButton"
          >
            Contact Owner
          </Link>
        )}
      </div>
    </main>
  );
}

export default Listing;
