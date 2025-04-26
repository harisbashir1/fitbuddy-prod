import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';

const Landing = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);
  
    return (
      <div>
        <img src="/fitbuddyLogo.png" alt="Fitbuddy" style={{ width: '100px', height: 'auto' }} />
        
        <h1>Fitbuddy</h1>
        <Link to="/login" class='registration-button'>Login</Link>
        <br></br><br></br><br></br>
        <Link to="/register "class='registration-button'>Register</Link>
        <h2>
          Fitbuddy is a dynamic fitness tracker and social media platform designed
          to help users stay on top of their fitness goals while connecting with
          friends and fellow fitness enthusiasts. With Fitbuddy, you can track workouts, set goals, share progress, 
            and engage with a supportive community to stay motivated and reach your full potential.
        </h2>
        <img src="/brandImage.png" alt="Brand Image" style={{ width: '50%', height: 'auto' }} />
        <img src="/brandImage2.png" alt="Brand Image 2" style={{  width: '50%', height: 'auto' }} />
      </div>
    );
    };
    
    export default Landing;