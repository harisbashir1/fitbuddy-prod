## How to Run the Project

Follow these steps to clone and run this project on your local machine.

### Step 1: Clone or Download the project

First, clone or download this project to your local machine.


   https://github.com/harisbashir1/fitbuddy.git

   git@github.com:harisbashir1/fitbuddy.git


### Step 2: Set Up the Backend (Express & MySQL)
### -Make sure MySQL service is running before proceeding. You can use XAMPP, MAMP, or MySQL Workbench to start the MySQL service.

1. **Navigate to the `backend` directory**:

   ```bash
   cd backend
   ```

2. **Install the backend dependencies**:

   ```bash
   npm install
   ```

3. **Create the MySQL Database and Table**:

   - Start your MySQL service (using XAMPP, MAMP, or MySQL Workbench).
   - Open a MySQL client (like MySQL Workbench or the command line) and run the following SQL commands to create the database and tables:

```sql
CREATE DATABASE IF NOT EXISTS Fitbuddy;
USE Fitbuddy;

CREATE TABLE users (
  userID INT(11) NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (userID)
);

CREATE TABLE friendships (
  friendship_id INT(11) NOT NULL AUTO_INCREMENT,
  userID1 INT(11) NOT NULL,
  userID2 INT(11) NOT NULL,
  smaller_userID INT(11) GENERATED ALWAYS AS (LEAST(userID1, userID2)) STORED,
  larger_userID INT(11) GENERATED ALWAYS AS (GREATEST(userID1, userID2)) STORED,
  PRIMARY KEY (friendship_id),
  UNIQUE KEY (smaller_userID, larger_userID),
  KEY fk_user1 (userID1),
  KEY fk_user2 (userID2),
  FOREIGN KEY (userID1) REFERENCES users(userID) ON DELETE CASCADE,
  FOREIGN KEY (userID2) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE friend_requests (
  request_id INT(11) NOT NULL AUTO_INCREMENT,
  sender_id INT(11) NOT NULL,
  receiver_id INT(11) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  PRIMARY KEY (request_id),
  UNIQUE KEY (sender_id, receiver_id),
  KEY fk_receiver (receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users(userID) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE user_goals (
  goalID INT(11) NOT NULL AUTO_INCREMENT,
  userID INT(11) NOT NULL UNIQUE,
  frequency INT(11) NOT NULL CHECK (frequency BETWEEN 1 AND 7),
  goal_streak INT(11) NOT NULL DEFAULT 0,
  last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (goalID),
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE workouts (
  workout_id INT(11) NOT NULL AUTO_INCREMENT,
  workout_date DATETIME NOT NULL,
  workout_type VARCHAR(50) NOT NULL,
  mood INT(1) DEFAULT NULL CHECK (mood BETWEEN 1 AND 5),
  note TEXT DEFAULT NULL,
  userID INT(11) NOT NULL,
  PRIMARY KEY (workout_id),
  KEY fk_user (userID),
  FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

CREATE TABLE `profile_lifts` (
  `id` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `bench` float DEFAULT NULL,
  `squat` float DEFAULT NULL,
  `deadlift` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `profile_lifts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `userID` (`userID`);
  ALTER TABLE `profile_lifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;
  ALTER TABLE `profile_lifts`
  ADD CONSTRAINT `profile_lifts_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`) ON DELETE CASCADE;

```
4. **Start the backend server (ensuring you are still in backend directory)**:

   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5051`.

### Step 3: Set Up the Frontend (React)

1. **In another terminal Navigate to the `fitbuddy-app` directory**:

2. **Install the frontend dependencies**:

   ```bash
   npm install
   ```

3. **Start the frontend server**:

   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

### Step 4: Usage

1. **Access the Web Application**:

   Open your browser and go to `http://localhost:5173`. This will load the homepage of the application.