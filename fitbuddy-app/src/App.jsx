import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Landing from './Landing';
import UserProfile from './UserProfile'
import Dashboard from './Dashboard'
import './App.css';
import Register from './Register';
import Login from './Login';
import Friends from './friends'
import PrivateRoute from './PrivateRoute';
import FriendProfile from './friendProfile';

function App() {

  return (
    <Router>
    <Routes>
      <Route path="/" element={<Landing />} /> 
      <Route path="/Dashboard" element={ <PrivateRoute><Dashboard/> </PrivateRoute>} /> 
      <Route path="/UserProfile" element={<UserProfile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/friends" element={<Friends />} />
      <Route path="/FriendProfile/:friendID" element={<FriendProfile />} />

    </Routes>
  </Router>
  );
}

export default App
