import logo from './logo.svg';
import './App.css';
import Login from "./components/Login"
import Registration from "./components/Registration"
import Dashboard from "./components/Dashboard"
import { AuthProvider } from "./AuthContext";
import {BrowserRouter as Router, Routes, Route } from "react-router-dom";



function App() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    
  )
  
}

export default App;
