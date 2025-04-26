import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Profile = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('token');
  const [userID, setUserID] = useState('');
  const [goal, setGoal] = useState('');
  const [currentGoal, setCurrentGoal] = useState(null);
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/getGoal`, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.frequency) {
            setCurrentGoal(data.frequency);
          }
        } else {
          console.error('Failed to fetch goal');
        }
      } catch (error) {
        console.error('Error fetching goal:', error);
      }
    };

    const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserID(decodedToken.userID)
        } 
        else {
          navigate('/login');
        }
    fetchGoal();
    fetchLifts();
  }, []);

  useEffect(() => {
    if (userID) {
      fetchBio(userID);
    }
  }, [userID]);

  const handleGoalSubmit = async () => {

    try {
      const response = await fetch(`${BACKEND_URL}/setGoal`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({ frequency: goal }),
      });

      if (response.ok) {
        setCurrentGoal(goal);
        setGoal('');
      } else {
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };


  const [bench, setBench] = useState('');
const [squat, setSquat] = useState('');
const [deadlift, setDeadlift] = useState('');

const handlePRSubmit = async () => {
  const decoded = jwtDecode(token);
  const userID = decoded.userID;

  const payload = { userID };
  if (bench !== '') payload.bench = bench;
  if (squat !== '') payload.squat = squat;
  if (deadlift !== '') payload.deadlift = deadlift;

  try {
    const response = await fetch(`${BACKEND_URL}/setLifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify( payload),
    });

    if (response.ok) {
      alert('PRs saved!');
      setBench('');
      setSquat('');
      setDeadlift('');
      fetchLifts();

    } else {
      console.error('Failed to save PRs');
    }
  } catch (error) {
    console.error('Error saving PRs:', error);
  }
};
const [benchLabel, setBenchLabel] = useState('');
const [squatLabel, setSquatLabel] = useState('');
const [deadliftLabel, setDeadliftLabel] = useState('');
const fetchLifts = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/getLifts`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data) {
        if (data.bench !== undefined) setBenchLabel(data.bench);
        if (data.squat !== undefined) setSquatLabel(data.squat);
        if (data.deadlift !== undefined) setDeadliftLabel(data.deadlift);
      }
    } else {
      console.error('Failed to fetch lifts');
    }
  } catch (error) {
    console.error('Error fetching lifts:', error);
  }
};

const [bio, setBio] = useState('');
const [currentBio, setCurrentBio] = useState('');

const handleBioSubmit = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/setBio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ bio }),
    });

    if (response.ok) {
      setCurrentBio(bio);
      setBio('');
    } else {
      console.error('Failed to update bio');
    }
  } catch (error) {
    console.error('Error saving bio:', error);
  }
};

const fetchBio = async (userID) => {
  try {
    const response = await fetch(`${BACKEND_URL}/getBio/${userID}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.bio) {
        setCurrentBio(data.bio);
      } else {
        setCurrentBio('');
      }
    } else {
      console.error('Failed to fetch bio');
    }
  } catch (error) {
    console.error('Error fetching bio:', error);
  }
};


  
    return (
      <div className="profile-container">
        <header>
        <Link to="/Dashboard">
            <img src="/fitbuddyLogo.png" alt="Fitbuddy" style={{ width: '100px', height: 'auto' }} />
          </Link>
          <nav>
            <ul>
              <li><Link to="/Dashboard">Home</Link></li>
              <li><Link to="/Friends">Friends</Link></li>
            </ul>
          </nav>
          <hr></hr>
        </header>
        <main>
          <h1>Profile</h1>
          <h2>Your Bio</h2>

        <p>Bio: {currentBio || 'No bio set yet.'}</p>
        <textarea
          rows="4"
          cols="43"
          placeholder="Update your bio.."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <br />
        <button onClick={handleBioSubmit}>Update Bio</button>
          <h2>Set your goal</h2>
          {currentGoal !== null && (
          <p>Current goal: {currentGoal} workouts per week</p>
        )}
          <p>Update Goal</p>
          <input
          type="number"
          min="1"
          max="7"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
        <br></br>
        <button onClick={handleGoalSubmit}>Save Goal</button>

        <h2>Set your Personal Records</h2>
              <h3>Current PRs:</h3>
                <ul>
                  <li>Bench: {benchLabel || 'Not set'} lbs</li>
                  <li>Squat: {squatLabel || 'Not set'} lbs</li>
                  <li>Deadlift: {deadliftLabel || 'Not set'} lbs</li>
                </ul>
          <label>Bench (lbs):</label>
          <input
            type="number"
            value={bench}
            onChange={(e) => setBench(e.target.value)}
          /><br />

          <label>Squat (lbs):</label>
          <input
            type="number"
            value={squat}
            onChange={(e) => setSquat(e.target.value)}
          /><br />

          <label>Deadlift (lbs):</label>
          <input
            type="number"
            value={deadlift}
            onChange={(e) => setDeadlift(e.target.value)}
          /><br />

          <button onClick={handlePRSubmit}>Save PRs</button>


        </main>
      </div>
    );
    };
    
    export default Profile;