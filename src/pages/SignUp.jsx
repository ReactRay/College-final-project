import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { db } from '../firebase.config';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../Components/OAuth';

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '', // Added phone number field
  });
  const { name, email, password, phoneNumber } = formData;
  const navigate = useNavigate();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await updateProfile(auth.currentUser, {
        displayName: name,
      });

      const formDataCopy = { ...formData };
      delete formDataCopy.password;
      formDataCopy.timestamp = serverTimestamp();
      formDataCopy.isAdmin = false; // Set isAdmin to false

      await setDoc(doc(db, 'users', user.uid), formDataCopy);

      navigate('/');
    } catch (error) {
      toast.error('Something went wrong with registration');
    }
  };

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Welcome!</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            className="inputField"
            placeholder="Name"
            id="name"
            value={name}
            onChange={onChange}
          />
          <input
            type="email"
            className="inputField"
            placeholder="Email"
            id="email"
            value={email}
            onChange={onChange}
          />
          <input
            type="tel"
            className="inputField"
            placeholder="Phone Number"
            id="phoneNumber"
            value={phoneNumber}
            onChange={onChange}
          />
          <div className="inputFieldDiv">
            <input
              type={showPassword ? 'text' : 'password'}
              className="inputField"
              placeholder="Password"
              id="password"
              value={password}
              onChange={onChange}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prevState) => !prevState)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="submitBar">
            <p className="submitText">Sign Up</p>
            <button type="submit" className="submitButton">
              Sign Up
            </button>
          </div>
          <OAuth />
          <Link to="/sign-in" className="registerLink">
            Sign In Instead
          </Link>
        </form>
      </main>
    </div>
  );
}

export default SignUp;
