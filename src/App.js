// src/App.js
import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components and pages
import Navbar from './Components/Navbar';
import PrivateRoute from './Components/PrivateRoute';
import Explore from './pages/Explore';
import Category from './pages/Category';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import CreateListing from './pages/CreateListing';
import Listing from './pages/Listing';
import Contact from './pages/Contact';
import Requests from './pages/Requests';
import ConfirmRental from './pages/ConfirmRental';
import RequestsMade from './pages/RequestsMade';
import AdminRequests from './pages/AdminRequests';
import AdminListings from './pages/AdminListings';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import Statistics from './pages/Statistics'; // Import the Statistics page

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Explore />} />
          <Route path="/category/:categoryName" element={<Category />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/category/:categoryName/:listingId"
            element={<Listing />}
          />
          <Route path="/contact/:carownerId" element={<Contact />} />

          {/* Protected Routes */}
          <Route path="/profile" element={<PrivateRoute />}>
            <Route index element={<Profile />} />
          </Route>

          <Route path="/create-listing" element={<PrivateRoute />}>
            <Route index element={<CreateListing />} />
          </Route>

          <Route path="/requests" element={<PrivateRoute />}>
            <Route index element={<Requests />} />
          </Route>

          {/* Confirm Rental Route */}
          <Route path="/confirm-rental" element={<PrivateRoute />}>
            <Route index element={<ConfirmRental />} />
          </Route>

          {/* Requests Made Page for non-admin users */}
          <Route path="/my-requests" element={<PrivateRoute />}>
            <Route index element={<RequestsMade />} />
          </Route>

          {/* Admin Requests Page for admin users */}
          <Route path="/admin-requests" element={<PrivateRoute />}>
            <Route index element={<AdminRequests />} />
          </Route>

          {/* Admin Listings Page for admins */}
          <Route path="/admin-listings" element={<PrivateRoute />}>
            <Route index element={<AdminListings />} />
          </Route>

          {/* Users Page for admins */}
          <Route path="/users" element={<PrivateRoute />}>
            <Route index element={<Users />} />
          </Route>

          {/* User Profile Page */}
          <Route path="/user-profile/:userId" element={<PrivateRoute />}>
            <Route index element={<UserProfile />} />
          </Route>

          {/* Statistics Page */}
          <Route path="/statistics" element={<PrivateRoute />}>
            <Route index element={<Statistics />} />
          </Route>
        </Routes>

        {/* Navbar and Toast Notifications */}
        <Navbar />
        <ToastContainer />
      </Router>
    </>
  );
}

export default App;
