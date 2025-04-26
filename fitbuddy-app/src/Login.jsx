import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
  
      try {
        const res = await axios.post(`${BACKEND_URL}/login`, { username, password });
        localStorage.setItem('token', res.data.token); // Save JWT token in localStorage
        navigate('/dashboard'); // Redirect to dashboard after successful login
      } catch (err) {
        setError('Login failed. Please try again.');
      }
    };

    return (
        <div>
          <div className='login-container'>
            <h2>Login</h2>

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
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
        <p>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'blue', textDecoration: 'underline' }}>
            Register here
        </Link>
        <br></br>
        <Link to="/">Return to Landing</Link>
        </p>
        </div>
        </div>
  );
};
export default Login;