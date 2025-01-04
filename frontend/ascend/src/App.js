import logo from './logo.svg';
import Header from "./components/Header"
import './App.css';
import Login from "./components/Login"
import Registration from "./components/Registration"
import Dashboard from "./components/Dashboard"
import Profile from "./components/Profile"
import { AuthProvider } from "./AuthContext";
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from 'react';



function App() {
  const [username, setUsername] = useState(null)
  useEffect(() => {
      // Retrieve username from localStorage
      const savedUsername = localStorage.getItem('username');
      console.log(savedUsername)
      if (savedUsername) {
          setUsername(savedUsername);
      }
  }, []);

  return (
    <div>
      <Header username={username}/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
    
  )
  
}

export default App;
