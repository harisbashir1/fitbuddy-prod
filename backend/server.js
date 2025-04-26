const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getISOWeek } = require('date-fns');
require('dotenv').config();

const app = express();
const PORT = 5051;

app.use(bodyParser.json());
app.use(cors());

//create mySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the MySQL database
db.connect(err => {
    if (err) {
      console.error('Database connection failed:', err.stack);
      return;
    }
    console.log('Connected to MySQL database.');
  });

    // Start the server and listen on port defined
    app.listen(PORT,'0.0.0.0', () => {
        console.log(`Server is running on port ${PORT}`);
      });

app.post('/register', async (req, res) => {
    const { username, firstName, lastName, password } = req.body;  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Insert the new user into the 'users' table
    db.execute(
      'INSERT INTO users (username, firstname, lastname, password) VALUES (?, ?, ?, ?)',
      [username, firstName, lastName, hashedPassword],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'User registration failed', error: err }); 
        }
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });

// User login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;  // Extract username and password from request body
  
    // Query the database for the user with the provided username
    db.execute('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(400).json({ message: 'User not found' });  // Send error response if user is not found
      }
  
      const user = results[0];  // Get the user record from the query result
      const passwordMatch = await bcrypt.compare(password, user.password);  // Compare the provided password with the hashed password
  
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });  // Send error response if the password does not match
      }
  
      // Generate a JWT token with the user ID and a secret key, valid for 3 hour
      const token = jwt.sign({ username: user.username, userID: user.userID }, 'your-jwt-secret', { expiresIn: '3h' });
  
      // Send the JWT token as the response
      res.json({ token });
    });
  });

// Middleware function to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];  // Get the token from the 'Authorization' header
  
    if (!token) return res.status(401).json({ message: 'Access denied' });  // If no token is provided, deny access
  
    // Verify the JWT token
    jwt.verify(token, 'your-jwt-secret', (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });  // If the token is invalid, send a 403 error
      req.user = user; // Store the decoded user data in the request object
      next();  // Proceed to the next middleware/route handler
    });
  };


  //send friend requests
  app.post('/friendRequest', async (req, res) => {
    try {
      const { senderId, receiverId } = req.body;
      if (senderId === receiverId) {
        return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
      }

      db.query(
        'INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)',
        [senderId, receiverId]
      );
      res.status(201).json({ message: 'Friend request sent' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  });


  //get incoming friend requests 
  app.get('/friendRequests/:userId', (req, res) => {
    const { userId } = req.params;
  
    db.query(
      `SELECT fr.sender_id AS userID, u.username
       FROM friend_requests fr
       JOIN users u ON fr.sender_id = u.userID
       WHERE fr.receiver_id = ?  AND fr.status = 'pending'`,
      [userId],
      (err, results) => {
        if (err) {
          console.error('Error fetching friend requests:', err);
          return res.status(500).json({ message: 'Server error' });
        }
        res.json(results);
      }
    );
  });

  // Reject Friend Request
app.post('/rejectFriendRequest', (req, res) => {
  const { senderId, receiverId } = req.body;
  db.query(
    'UPDATE friend_requests SET status = "rejected" WHERE sender_id = ? AND receiver_id = ?',
    [senderId, receiverId],
    (err, results) => {
      if (err) {
        console.error('Error rejecting friend request:', err);
        return res.status(500).json({ message: 'Error rejecting friend request' });
      }

      res.status(200).json({ message: 'Friend request rejected' });
    }
  );
});

// Accept Friend Request
app.post('/acceptFriendRequest', (req, res) => {
  const { senderId, receiverId } = req.body;

  // Update friend request status to 'accepted'
  db.query(
    'UPDATE friend_requests SET status = "accepted" WHERE sender_id = ? AND receiver_id = ?',
    [senderId, receiverId],
    (err, results) => {
      if (err) {
        console.error('Error accepting friend request:', err);
        return res.status(500).json({ message: 'Error accepting friend request' });
      }

      // Create a new friendship record in the 'friendships' table
      db.query(
        'INSERT INTO friendships (userID1, userID2) VALUES (?, ?)',
        [senderId, receiverId],
        (err, results) => {
          if (err) {
            console.error('Error creating friendship:', err);
            return res.status(500).json({ message: 'Error creating friendship' });
          }

          res.status(200).json({ message: 'Friend request accepted and friendship created' });
        }
      );
    }
  );
});



app.get('/friendslist/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.query(
    `SELECT u.userID, u.username
     FROM friendships f
     JOIN users u ON 
       (f.userID1 = ? AND f.userID2 = u.userID) OR 
       (f.userID2 = ? AND f.userID1 = u.userID)`,
    [userId, userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to fetch friends list', error: err });
      }
      const friendsList = results;

      db.query(
        `SELECT COUNT(*) AS friendCount
         FROM friendships f
         WHERE f.userID1 = ? OR f.userID2 = ?`,
        [userId, userId],
        (err, results) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to fetch friend count', error: err });
          }

          const friendCount = results[0].friendCount || 0;

          res.json({ friendsList, friendCount });
        }
      );
    }
  );
});

  app.get('/searchUsers', (req, res) => {
    const { username } = req.query;  // Extract userId from the URL parameter

  
    // Query to fetch friends based on userId
    db.query(
      `SELECT * FROM users WHERE username LIKE ?`,
      [`%${username}%`],
      (err, results) => {
        if (err) {
          // Handle error and send appropriate response
          return res.status(500).json({ message: 'Failed to fetch user list', error: err });
        }
        // Send results (friends list) as the response
        res.json(results);
      }
    );
  });


  app.post('/logWorkout', authenticateToken, (req, res) => {
    const {workout_type, mood, note} = req.body;
    const userID = req.user.userID; 
    const currentDate = new Date();
    db.query(`INSERT INTO workouts (workout_date, workout_type, mood, note, userID) VALUES (?, ?, ?, ?, ?)`,
       [currentDate, workout_type, mood || null, note || null, userID ], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to insert workout', error: err });
      }
      res.json(results);
    });
  });

  app.get('/getWorkoutDates', authenticateToken, (req, res) => {
    const userID = req.query.friendID || req.user.userID;
  
    db.query(
      'SELECT workout_date FROM workouts WHERE userID = ?',
      [userID],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to fetch workout dates', error: err });
        }
  
        const dates = results.map(row => {
          const dateObj = new Date(row.workout_date);
          return dateObj.toISOString().split('T')[0];
        });
  
        res.json(dates);
      }
    );
  });


  app.get('/friendProfile/:friendID', authenticateToken, (req, res) => {
    const { friendID } = req.params;
  
    db.query('SELECT username FROM users WHERE userID = ?', [friendID], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error retrieving profile' });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });
  
      res.json(results[0]);
    });
  });

  app.post('/setGoal', authenticateToken,(req, res) => {
    const { frequency } = req.body;
    const userID = req.user.userID;
  
    if (!frequency || frequency < 1 || frequency > 7) {
      return res.status(400).json({ error: 'Invalid frequency' });
    }
  
    const sql = `
    INSERT INTO user_goals (userID, frequency)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE frequency = VALUES(frequency)
  `;

    db.query(sql, [userID, frequency], (err, result) => {
      if (err) {
        console.error('Error saving goal:', err);
        return res.status(500).json({ error: 'Server error' });
      }
  
      res.json({ message: 'Goal saved successfully', frequency });
    });
  });


  app.get('/getGoal', authenticateToken, (req, res) => {
    const userID = req.user.userID;
  
    db.query(
      'SELECT frequency FROM user_goals WHERE userID = ?',
      [userID],
      (err, result) => {
        if (err) {
          console.error('Error fetching goal:', err);
          return res.status(500).json({ error: 'Server error' });
        }
  
        if (result.length > 0) {
          res.json(result[0]);
        } else {
          res.json({ frequency: null });
        }
      }
    );
  });


  app.get('/getStreakInfo/:userID', async (req, res) => {
    const userID = req.params.userID;
  
    try {
      const [goalRows] = await db.promise().query(
        'SELECT frequency, goal_streak, last_updated FROM user_goals WHERE userID = ?',
        [userID]
      );

      if (goalRows.length === 0) {
        return res.status(404).json({ message: 'no goal info found'});
      }
  
  
      const frequency = goalRows[0].frequency;
      var goal_streak = goalRows[0].goal_streak ;
      const lastUpdated = goalRows[0].last_updated;
  
      const today = new Date();
      // const today = new Date('2025-05-15');
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay()); //to get Sunday


      const startOfLastWeek = new Date(firstDayOfWeek);
      startOfLastWeek.setDate(startOfLastWeek.getDate() - 7); //last sunday

      const endOfLastWeek = new Date(firstDayOfWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 1); 

      const lastUpdatedDate = new Date(lastUpdated);
      const isSameWeek = getISOWeek(lastUpdatedDate) === getISOWeek(today); 

      if (!isSameWeek) {
      const [workoutsLastWeek] = await db.promise().query(
        'SELECT COUNT(*) AS count FROM workouts WHERE userID = ? AND workout_date BETWEEN ? AND ?',
        [userID, startOfLastWeek, endOfLastWeek]
      );
  
      const completedLastWeek = workoutsLastWeek[0].count;
  
      if (completedLastWeek >= frequency) {
        goal_streak += 1;
      } else {
        goal_streak = 0;
      }
      

      await db.promise().query(
        'UPDATE user_goals SET goal_streak = ?, last_updated = ? WHERE userID = ?',
        [goal_streak, today, userID]
      );
    }
  
      const [workoutsThisWeek] = await db.promise().query(
        'SELECT COUNT(*) AS count FROM workouts WHERE userID = ? AND workout_date >= ?',
        [userID, firstDayOfWeek]
      );
  
      const completedThisWeek = workoutsThisWeek[0].count;
      const remainingWorkouts = Math.max(frequency - completedThisWeek, 0);
      res.json({
        goal_streak,
        remainingWorkouts,
      });
  
    } catch (error) {
      console.error('Error fetching streak info:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


  app.post('/setLifts', authenticateToken, (req, res) => {
    const { userID, bench, squat, deadlift } = req.body;
  
    if (!userID) {
      return res.status(400).json({ error: 'Missing userID' });
    }
    //since we want to be able to only update 1, dynamically build query
    let columns = ['userID'];
    let values = [userID];
    let updates = [];
  
    if (bench !== undefined) {
      columns.push('bench');
      values.push(bench);
      updates.push('bench = VALUES(bench)');
    }
  
    if (squat !== undefined) {
      columns.push('squat');
      values.push(squat);
      updates.push('squat = VALUES(squat)');
    }
  
    if (deadlift !== undefined) {
      columns.push('deadlift');
      values.push(deadlift);
      updates.push('deadlift = VALUES(deadlift)');
    }
  
    const query = `
      INSERT INTO profile_lifts (${columns.join(', ')})
      VALUES (${columns.map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${updates.join(', ')}
    `;
  
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json({ message: 'Lifts saved' });
    });
  });


  app.get('/getLifts', authenticateToken, (req, res) => {
    const decoded = req.user;
    const userID = decoded.userID;
  
    db.query(
      'SELECT bench, squat, deadlift FROM profile_lifts WHERE userID = ?',
      [userID],
      (err, results) => {
        if (err) {
          console.error('DB error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
  
        if (results.length === 0) {
          return res.status(200).json({});
        }
  
        res.status(200).json(results[0]);
      }
    );
  });

 
// get rankings for each lift among friends
  app.get('/getLiftRankings', authenticateToken, (req, res) => {
    const { friendID } = req.query;
    const userID = req.user.userID;
  
    const query = `
      SELECT 
        friend.userID,
        friend.username,
        friend_lifts.bench,
        CASE 
          WHEN friend_lifts.bench IS NULL THEN NULL
          ELSE (
            SELECT COUNT(*) + 1 
            FROM profile_lifts pl
            JOIN users u ON pl.userID = u.userID
            LEFT JOIN friendships f ON 
              (f.userID1 = ? AND f.userID2 = u.userID) OR 
              (f.userID2 = ? AND f.userID1 = u.userID)
            WHERE 
              (u.userID = ? OR f.userID1 IS NOT NULL) AND
              pl.bench > friend_lifts.bench AND pl.bench IS NOT NULL
          )
        END AS bench_rank,
  
        friend_lifts.squat,
        CASE 
          WHEN friend_lifts.squat IS NULL THEN NULL
          ELSE (
            SELECT COUNT(*) + 1 
            FROM profile_lifts pl
            JOIN users u ON pl.userID = u.userID
            LEFT JOIN friendships f ON 
              (f.userID1 = ? AND f.userID2 = u.userID) OR 
              (f.userID2 = ? AND f.userID1 = u.userID)
            WHERE 
              (u.userID = ? OR f.userID1 IS NOT NULL) AND
              pl.squat > friend_lifts.squat AND pl.squat IS NOT NULL
          )
        END AS squat_rank,
  
        friend_lifts.deadlift,
        CASE 
          WHEN friend_lifts.deadlift IS NULL THEN NULL
          ELSE (
            SELECT COUNT(*) + 1 
            FROM profile_lifts pl
            JOIN users u ON pl.userID = u.userID
            LEFT JOIN friendships f ON 
              (f.userID1 = ? AND f.userID2 = u.userID) OR 
              (f.userID2 = ? AND f.userID1 = u.userID)
            WHERE 
              (u.userID = ? OR f.userID1 IS NOT NULL) AND
              pl.deadlift > friend_lifts.deadlift AND pl.deadlift IS NOT NULL
          )
        END AS deadlift_rank
  
      FROM 
        users friend
      JOIN 
        profile_lifts friend_lifts ON friend.userID = friend_lifts.userID
      LEFT JOIN 
        friendships f ON 
          (f.userID1 = ? AND f.userID2 = friend.userID) OR 
          (f.userID2 = ? AND f.userID1 = friend.userID)
      WHERE 
        friend.userID = ?;
    `;
  
    db.query(
      query, 
      [
        userID, userID, userID, 
        userID, userID, userID, 
        userID, userID, userID, 
        userID, userID, friendID
      ],
      (error, results) => {
        if (error) {
          console.error('Error fetching rankings:', error);
          return res.status(500).json({ message: 'Error fetching rankings' });
        }
        res.json(results[0] || {});
      }
    );
  });

  //get 10 recent workouts for user
  app.get('/recentWorkouts', authenticateToken, (req, res) => {
    const userID = req.user.userID;
  
    db.query(
      `SELECT workout_date, workout_type, mood, note 
       FROM workouts 
       WHERE userID = ? 
       ORDER BY workout_date DESC 
       LIMIT 10`,
      [userID],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to fetch recent workouts', error: err });
        }
        res.json(results);
      }
    );
  });

  app.get('/recentWorkouts', authenticateToken, (req, res) => {
    const userID = req.user.userID;
  
    db.query(
      `SELECT workout_date, workout_type, mood, note 
       FROM workouts 
       WHERE userID = ? 
       ORDER BY workout_date DESC 
       LIMIT 10`,
      [userID],
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to fetch recent workouts', error: err });
        }
        res.json(results);
      }
    );
  });


  //set bio in profile
  app.post('/setBio', authenticateToken, (req, res) => {
    const userID = req.user.userID;
    const { bio } = req.body;
  
    try {
      db.query('UPDATE profile_lifts SET bio = ? WHERE userID = ?', [bio, userID], (err, results) => {
        if (err) {
          console.error('Error updating bio:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        res.status(200).json({ message: 'Bio updated successfully' });
      });
    } catch (err) {
    }
  });

  //retrieve specific users bio
  app.get('/getBio/:userID', (req, res) => {
    const { userID } = req.params;
  
    try {
  
      db.query('SELECT bio FROM profile_lifts WHERE userID = ?', [userID], (err, results) => {
        if (err) {
          console.error('Error fetching bio:', err);
          return res.status(500).json({ message: 'Server error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
  
        res.json({bio: results[0].bio || '' });
      });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  });


// Endpoint to get 5 friends with longest streaks (including self)
app.post('/getLeaderboardFriends/:userID', (req, res) => {
  const { userID } = req.params; 
  const { friends } = req.body;

  const friendIDs = friends.map(friend => friend.userID);
  const userIDs = friendIDs.concat(parseInt(userID));

  if (!userID || !friends) {
    return res.status(400).json({ message: 'Invalid userID or friends list' });
  }

  const sql = `
    SELECT u.username, g.goal_streak, u.userID
    FROM user_goals g
    JOIN users u ON g.userID = u.userID
    WHERE g.userID IN (?) AND g.goal_streak > 0
    ORDER BY g.goal_streak DESC
    LIMIT 5;
  `;

  db.query(sql, [userIDs],  (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});
