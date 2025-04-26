import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const Friends = () => {
const navigate = useNavigate();
const [username, setUsername] = useState(null);
const [userID, setUserID] = useState(null);
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

//get friend requests
const [incomingFriendRequests, setIncomingFriendRequests] = useState([]);
const fetchIncomingFriendRequests = () => {
  if (userID) {
    fetch(`${BACKEND_URL}/friendRequests/${userID}`, {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    })
      .then((response) => response.json())
      .then((data) => setIncomingFriendRequests(data))
      .catch((error) => console.error('Error fetching friend requests:', error));
  }
};
useEffect(() => {
  fetchIncomingFriendRequests();
}, [userID]);


  //send friend Request
  const handleSendFriendRequest = async (receiverId) => {
    const requestBody = {
      senderId: userID,
      receiverId: receiverId,
    };
    try {
      const response = await fetch(`${BACKEND_URL}/friendRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify(requestBody)
      })
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send friend request.');
      }
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  //accept friend request
  const handleAcceptFriendRequest = async (requestId) => {
    const requestBody = {
      senderId: requestId,
      receiverId: userID,
    };
    try {
      const response = await fetch(`${BACKEND_URL}/acceptFriendRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept friend request.');
      }

        fetch(`${BACKEND_URL}/friendslist/${userID}`, {
          headers: {
            Authorization: localStorage.getItem('token'),
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setFriends(data.friendsList);
            setFriendCount(data.friendCount);
          })
          .catch((error) => console.error('Error fetching friends after accepting:', error));

          fetchIncomingFriendRequests();

    } catch (error) {
      alert(error.message);
    }
  };

  //reject friend request
  const handleRejectFriendRequest = async (requestId) => {
    const requestBody = {
      senderId: requestId,
      receiverId: userID,
    };
    try {
      const response = await fetch(`${BACKEND_URL}/rejectFriendRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token'),
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject friend request.');
      }

      fetchIncomingFriendRequests();

    } catch (error) {
      alert(error.message);
    }
  };

//for searching users and displaying
const [searchUsername, setSearchUsername] = useState('');
const [userSearchResults, setUserSearchResults] = useState([]);
const searchUsers = async() => {
    if (!searchUsername) {
      alert('Please enter a username to search.');
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/searchUsers?username=${searchUsername}`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to send request');
      }
      const data = await response.json();
      setUserSearchResults(data);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = jwtDecode(token);
      setUsername(decodedToken.username);
      setUserID(decodedToken.userID)
    } 
    else {
      navigate('/login');
    }
  }, [navigate]);

  const [friends, setFriends] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  
useEffect(() => {
    if (userID) {
      fetch(`${BACKEND_URL}/friendslist/${userID}`, {
        headers: {
          Authorization: localStorage.getItem('token'),
        },
      })
      .then(response => response.json())
      .then((data) => {
        console.log(data);
        setFriends(data.friendsList); 
        setFriendCount(data.friendCount);
      })
        .catch((error) => console.error('Error fetching friends:', error));
    }
  }, [userID]); 



    return (
      <div className='profile-container'>
    <header>
      <Link to="/Dashboard">
          <img src="/fitbuddyLogo.png" alt="Fitbuddy" style={{ width: '100px', height: 'auto' }} />
        </Link>
        <nav>
          <ul>
          <li><Link to="/Dashboard">Home</Link></li>
            <li><Link to="/UserProfile">Profile</Link></li>
          </ul>
        </nav>

          <hr></hr>
        </header>
        <h1>Welcome {username}, Here is the Friends Page.</h1>
        <div className='card-container'>
        <h2>Friend Requests ({incomingFriendRequests.length})</h2>
        {incomingFriendRequests.length === 0 ? (
          <p>No pending friend requests.</p>
        ) : (
          <ul>
            {incomingFriendRequests.map((request) => (
              <li key={request.userID}>
                <Link to={`/FriendProfile/${request.userID}`} className="item-list" >{request.username}</Link>
                {/* <span className="request-list">{request.username}</span> */}
                <button onClick={() => handleAcceptFriendRequest(request.userID)} id='accept-button'>	&#10004;</button>
                <button onClick={() => handleRejectFriendRequest(request.userID)} id='reject-button'>&#x2716;</button>
                </li>
            ))}
          </ul>
        )}
        </div>
        <div className='card-container'>
        <h2>Add a friend</h2>
        <input
        type="text"
        placeholder="Search by username"
        value={searchUsername}
        onChange={(e) => setSearchUsername(e.target.value)}
      />
            <br></br>
      <button onClick={searchUsers}>Search</button>
      {userSearchResults.length > 0 && (
  <div>
    <h3>Search Results:</h3>
    <ul>
      {userSearchResults.map((user) => {
      const isYou = user.userID === userID;
      const isFriend = friends.some(friend => friend.userID === user.userID);

      return (
        <li key={user.userID}>
          <span className="search-results">{user.username}</span>
          {isYou ? (
            <span><strong> (You)</strong></span>
          ) : isFriend ? (
            <span> (Friends)</span>
          ) : (
            <button onClick={() => handleSendFriendRequest(user.userID)} id='accept-button'>Send</button>
          )}
        </li>
      );
    }
  )}
    </ul>
  </div>
  )}
  </div>
  <div className='card-container'>
        <h2>Friends ({friendCount})</h2>
        {friends.length === 0 ? (
        <p>No friends found.</p>
      ) : (
        <ul className="friend-list">
          {friends.map((friend) => (
              <li key={friend.userID}>
              <Link to={`/FriendProfile/${friend.userID}`} className='item-list'>{friend.username}</Link>
            </li>
          ))}
        </ul>
      )}
      </div>
      </div>


    );
    };
    
    export default Friends;