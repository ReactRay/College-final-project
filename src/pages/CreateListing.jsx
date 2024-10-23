import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../Components/Spinner';

function CreateListing() {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: 2020,
    price: 0,
    location: '',
    images: [],
    seats: 5, // Changed from doors to seats
    category: 'suv', // Category dropdown
    userRef: '',
  });

  const {
    brand,
    model,
    year,
    price,
    location,
    images,
    seats,
    category,
    userRef,
  } = formData;

  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted.current) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFormData((prevState) => ({
            ...prevState,
            userRef: user.uid,
          }));

          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setPhoneNumber(userData.phoneNumber);
            setIsAdmin(userData.isAdmin);
          } else {
            toast.error('User data not found');
          }
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [auth, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Check if any images are selected
    if (!images || images.length === 0) {
      setLoading(false);
      toast.error('Please upload at least one image.');
      return;
    }

    // Limit the number of images to 6
    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 images are allowed.');
      return;
    }

    // Function to store images in Firebase Storage and return their URLs
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then((downloadURL) => {
                resolve(downloadURL);
              })
              .catch((error) => {
                reject(error);
              });
          }
        );
      });
    };

    // Upload images and retrieve their URLs
    let imgUrl;
    try {
      imgUrl = await Promise.all([...images].map((image) => storeImage(image)));
      // Ensure all URLs are valid
      if (!imgUrl || imgUrl.some((url) => !url)) {
        throw new Error('Failed to retrieve all image URLs.');
      }
    } catch (error) {
      setLoading(false);
      console.error('Image upload error:', error);
      toast.error('Failed to upload images. Please try again.');
      return;
    }

    // Prepare the form data to be sent to Firestore
    const formDataCopy = {
      ...formData,
      type: 'rent', // All listings are for rent
      imgUrl, // Image URLs from storage
      phoneNumber, // Add the phone number to the listing data
      status: 'available', // Set the default status to 'available'
      timestamp: serverTimestamp(),
    };

    // Set location field and remove images array
    formDataCopy.location = location;
    delete formDataCopy.images;

    // Add listing to Firestore
    try {
      const docRef = await addDoc(collection(db, 'listings'), formDataCopy);
      setLoading(false);
      toast.success('Listing saved successfully.');
      navigate(`/category/rent/${docRef.id}`);
    } catch (error) {
      setLoading(false);
      console.error('Failed to save listing:', error);
      toast.error('Failed to save listing. Please try again.');
    }
  };

  const onMutate = (e) => {
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create a Rental Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Brand</label>
          <input
            className="formInputName"
            type="text"
            id="brand"
            value={brand}
            onChange={onMutate}
            maxLength="20"
            minLength="2"
            required
          />

          <label className="formLabel">Model</label>
          <input
            className="formInputName"
            type="text"
            id="model"
            value={model}
            onChange={onMutate}
            maxLength="20"
            minLength="2"
            required
          />

          <div className="formRooms flex">
            <div>
              <label className="formLabel">Year</label>
              <input
                className="formInputSmall"
                type="number"
                id="year"
                value={year}
                onChange={onMutate}
                min="1900"
                max="2024"
                required
              />
            </div>
          </div>

          <label className="formLabel">Location</label>
          <textarea
            className="formInputAddress"
            type="text"
            id="location"
            value={location}
            onChange={onMutate}
            required
          />

          <label className="formLabel">Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="price"
              value={price}
              onChange={onMutate}
              min="50"
              max="1000000"
              required
            />
            <p className="formPriceText">ILS / Day</p>
          </div>

          {/* Add number of seats */}
          <label className="formLabel">Number of Seats</label>
          <input
            className="formInputSmall"
            type="number"
            id="seats"
            value={seats}
            onChange={onMutate}
            min="2"
            max="7"
            required
          />

          {/* Add category dropdown */}
          <label className="formLabel">Category</label>
          <select
            className="formInputSmall"
            id="category"
            value={category}
            onChange={onMutate}
            required
          >
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="coupe">Coupe</option>
            <option value="cabriolet">Cabriolet</option>
            <option value="hatchback">Hatchback</option>
          </select>

          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.jpeg,.png,.JPG,.JPEG,.PNG"
            multiple
            required
          />

          <button type="submit" className="primaryButton createListingButton">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
