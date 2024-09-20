import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../Components/OAuth';

function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;
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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredential.user) {
        navigate('/');
      }
    } catch (error) {}
  };

  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Welcome Back!</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <input
            type="email"
            className="inputField"
            placeholder="Email"
            id="email"
            value={email}
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
          <Link to="/forgot-password" className="forgotPasswordLink">
            Forgot Password?
          </Link>
          <div className="submitBar">
            <p className="submitText">Sign In</p>
            <button type="submit" className="submitButton">
              Sign In
            </button>
          </div>
          <OAuth />
          <Link to="/sign-up" className="registerLink">
            Sign Up Instead
          </Link>
        </form>
      </main>
    </div>
  );
}

export default SignIn;
