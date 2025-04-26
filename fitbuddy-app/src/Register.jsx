import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
        const res = await axios.post(`${BACKEND_URL}/register`, {
          username,
          firstName,
          lastName,
          password,
        });
        if (res.status === 201) {
          navigate('/login');
        }
      } catch (err) {
        setError('Registration failed. Please try again.');
      }
    };

    return (
        <div className="login-container">
          <div>
          <h2>Register</h2>
        {error && <p className="error" style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <p>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'blue', textDecoration: 'underline' }}>
            Log in here
        </Link>
        <br></br>
        <Link to="/">Return to Landing</Link>
        </p>
        </div>
        </div>
    );
};


export default Register;