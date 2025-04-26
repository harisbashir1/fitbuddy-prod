import React from 'react';
import { Navigate } from 'react-router-dom';  // Import the Navigate component to handle redirection
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return <Navigate to="/login" />;
      }
      return children;
    } catch (error) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  }
  // No token – redirect to login
  return <Navigate to="/login" />;
};

export default PrivateRoute;