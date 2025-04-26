import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 
import WorkoutCalendar from './workoutCalendar';

const Dashboard = () => {

  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [userID, setUserID] = useState(null);
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token');
  });

  //decode token for relevant info
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decoded = jwtDecode(token);
      setUserID(decoded.userID);
      setUsername(decoded.username);
    } catch (error) {
      console.error('Invalid token:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [token, navigate]);


  //set friends List
  const [friends, setFriends] = useState([]);
  useEffect(() => {
    if (!token || !userID) return; 
    const fetchFriends = async () => {
  
      try {
        const response = await fetch(`${BACKEND_URL}/friendslist/${userID}`, {
          method: 'GET',
          headers: {
            Authorization: token,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch friends list');
        }
  
        const data = await response.json();
        setFriends(data.friendsList);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };
    fetchFriends();
  }, [userID, token]);


//retrieve friends Streaks for leaderboard
 const [leaderboardFriends, setLeaderoardFriends] = useState([]);
  const getFriendsStreaks = async (friends) => {
    if (!token || !userID) return;

    try {
      const response = await fetch(`${BACKEND_URL}/getLeaderboardFriends/${userID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
         body: JSON.stringify({ friends }),
      });

        const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to retrieve friends leaderboard.');
      }
      setLeaderoardFriends(data);

    } catch (error) {
      alert(error.message);
    }
  };
  //getting friends Streaks is dependant on friends being set
  useEffect(() => {
      getFriendsStreaks(friends);

  }, [friends]);




//retrieve and set streak information
const [streak, setStreak] = useState(0);
const [remainingThisWeek,setRemainingThisWeek] = useState(null);
useEffect(() => {
  if (!token || !userID) return; 
  const fetchStreakInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/getStreakInfo/${userID}`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (response.status === 404) {
        setStreak(0);
        setRemainingThisWeek(null); 
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch streak info');
      }
      const data = await response.json();
      setStreak(data.goal_streak); 
      setRemainingThisWeek(data.remainingWorkouts); 
    } catch (error) {
      console.error('Error fetching workout dates:', error);
      alert(error.message);
    }
  };

  fetchStreakInfo();
}, [userID, token]);


//get workout Dates for calendar
const [workoutDates, setWorkoutDates] = useState([]);
useEffect(() => {
  if (!token) return; 
  const fetchWorkoutDates = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/getWorkoutDates`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout dates.');
      }

      const dates = await response.json();
      setWorkoutDates(dates); 
    } catch (error) {
      console.error('Error fetching workout dates:', error);
      alert(error.message);
    }
  };

  fetchWorkoutDates();
}, [token]);


//retrieve recently logged workouts
const [recentWorkouts, setRecentWorkouts] = useState([]);
useEffect(() => {
  const fetchRecentWorkouts = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/recentWorkouts`, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workout dates.');
      }

      const workouts = await response.json();
      setRecentWorkouts(workouts); 
    } catch (error) {
      console.error('Error fetching recent workouts:', error);
      alert(error.message);
    }
  };
  fetchRecentWorkouts();
}, [token]);


//submit logged workouts from form to backend
const [workoutType, setWorkoutType] = useState('');
const [mood, setMood] = useState('');
const [note, setNote] = useState('');
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    if (!workoutType) {
      alert('Workout type is required');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/logWorkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token,
        },
        body: JSON.stringify({
          workout_type: workoutType,
          mood: mood || null,
          note: note || null,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to log workout.');
      }
  
      alert('Workout logged successfully!');
      setWorkoutType('');
      setMood('');
      setNote('');
  
    } catch (error) {
      console.error('Error submitting workout:', error);
      alert(error.message);
    }
  };


  //remove token upon logging out
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    navigate('/');
  };





    return (
      <div>
        <header>
        <Link to="/Dashboard">
            <img src="/fitbuddyLogo.png" alt="Fitbuddy" style={{ width: '100px', height: 'auto' }} />
          </Link>
          <nav>
            <ul>
              <li><Link to="/UserProfile">Profile</Link></li>
              <li><Link to="/Friends">Friends</Link></li>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </ul>
          </nav>
          <hr></hr>
        </header>
        <h1>Welcome, {username}</h1>
        <div className='lift-cards-container' id='streak-container'>
        <div className = 'lift-card'>
        <p className='streak-labels'>Current Streak: <strong><big>{streak}</big></strong> week(s) (Updates 1x a week)</p>
          <p style={{ fontSize: '2rem' }}>{'🔥'.repeat(streak)}</p>
          {remainingThisWeek === null ? (
              <p className='streak-labels'>Set a goal in your <Link to="/userProfile">profile</Link> to start tracking your streak!</p>
            ) : (
              <p className='streak-labels'>Log <strong><big>{remainingThisWeek}</big></strong> more workouts this week to add to the streak!</p>
            )}
          </div>
          <div className = 'lift-card'>
        <h3>Friend Leaderboard</h3>
                {friends.length === 0 ? (
                <p>No friends found.</p>
              ) : (
                <ul className="friend-list">
                {leaderboardFriends.map((friend, index) => (
                  <li key={friend.userID} className="friend-item">
                    <span className="ranking">{index + 1}.</span>
                    <Link to={`/FriendProfile/${friend.userID}`} className="item-list" id='streak-names'>
                      {friend.username}
                    </Link>
                    <span>{friend.goal_streak} Weeks 🔥</span>
                  </li>
                  ))}
                </ul>
              )}
        </div>
          </div>
        <div className="card-container">
        <h2>Workout Calendar</h2>
        <WorkoutCalendar workoutDates={workoutDates} />
        </div>
        <div className="card-container">
        <h2>Log today's workout</h2>
        <h3>Congrats on checking in!</h3>
        <div className ="entry-form">
        <form onSubmit={handleSubmit}>
      <div >
        <label>Workout Type *</label>
        <input
          type="text"
          value={workoutType}
          onChange={(e) => setWorkoutType(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Mood (1-5)</label>
        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="">Select mood</option>
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows="3"
          placeholder="Add any notes about your workout..."
        />
      </div>

      <button type="submit">Log Workout</button>
    </form>
    </div>
    </div>
    <div className="card-container">
        <h2>Recent Workouts</h2>
        {recentWorkouts.length === 0 ? (
    <p>No workouts logged yet.</p>
  ) : (
    <table className="recent-workouts-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Mood</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {recentWorkouts.map((workout, index) => (
          <tr key={index}>
            <td>{new Date(workout.workout_date).toLocaleDateString()}</td>
            <td>{workout.workout_type}</td>
            <td>{workout.mood ?? '—'}</td>
            <td>{workout.note || '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
    </div>


      </div>
    );
    };
    
    export default Dashboard;