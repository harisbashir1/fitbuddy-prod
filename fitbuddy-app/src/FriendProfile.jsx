import React, { useEffect, useState } from 'react';
import WorkoutCalendar from './workoutCalendar';
import { useParams, useNavigate, Link } from 'react-router-dom';


const FriendProfile = () => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  //fetch and set profile for visited link
  const { friendID } = useParams();
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch(`${BACKEND_URL}/friendProfile/${friendID}`, {
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error(err));
  }, [friendID]);

  //get workout dates for calendar
  const [workoutDates, setWorkoutDates] = useState([]);
  useEffect(() => {
    const fetchWorkoutDates = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${BACKEND_URL}/getWorkoutDates?friendID=${friendID}`, {
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
  }, [navigate]);


  //get lift rankings among friends
  const [liftRankings, setLiftRankings] = useState(null);

    useEffect(() => {
        const fetchLiftRankings = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${BACKEND_URL}/getLiftRankings?friendID=${friendID}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': token,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setLiftRankings(data);
                } else {
                    console.error('Failed to fetch lift rankings');
                }
            } catch (error) {
                console.error('Error fetching lift rankings:', error);
            }
        };

        fetchLiftRankings();
    }, []);

    //set bio
    const [bio, setBio] = useState('');
    useEffect(() => {
      const fetchBio = async () => {
        try {
          const response = await fetch(`${BACKEND_URL}/getBio/${friendID}`);
          if (response.ok) {
            const data = await response.json();
            setBio(data.bio || '');
          } else {
            console.error('Failed to fetch bio');
          }
        } catch (error) {
          console.error('Error fetching bio:', error);
        }
      };
    
      if (friendID) {
        fetchBio();
      }
    }, [friendID]);
  

  if (!profile) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
        <Link to="/Dashboard">
            <img src="/fitbuddyLogo.png" alt="Fitbuddy" style={{ width: '100px', height: 'auto' }} />
          </Link>
          <nav>
            <ul>
            <li><Link to="/Dashboard">Home</Link></li>
            <li><Link to="/Friends">Friends</Link></li>
              <li><Link to="/UserProfile">Profile</Link></li>
            </ul>
          </nav>
          <hr></hr>
      <h2 id='profile-name'>You are viewing {profile.username}'s Profile</h2>
      <div className="card-container">
        <h2>Bio</h2>
        <p>{bio || 'No bio set.'}</p>
      </div>

      <div className="card-container">
        <h2>Workout Calendar</h2>
        <WorkoutCalendar workoutDates={workoutDates || []} />
      </div>
      <div className="card-container">
        <h2>Lift Leaderboard Rankings</h2>
        {liftRankings && liftRankings.bench !== undefined ? (
    <div className="lift-cards-container">
    <div className="lift-card">
      <h3>Bench Press</h3>
      <p>{liftRankings.bench} lbs</p>
      <p>#{liftRankings.bench_rank} in friends</p>
    </div>
    <div className="lift-card">
      <h3>Squat</h3>
      <p>{liftRankings.squat} lbs</p>
      <p>#{liftRankings.squat_rank} in friends</p>
    </div>
    <div className="lift-card">
      <h3>Deadlift</h3>
      <p>{liftRankings.deadlift} lbs</p>
      <p>#{liftRankings.deadlift_rank} in friends</p>
    </div>
  </div>
  ) : (
    <p>This user hasn't logged any lifts yet.</p>
  )}
      </div>
    </div>
  );
};

export default FriendProfile;