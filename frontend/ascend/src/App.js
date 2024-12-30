import logo from './logo.svg';
import './App.css';
import Login from "./components/Login"
import Registration from "./components/Registration"

import {BrowserRouter as Router, Routes, Route } from "react-router-dom";



function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
        </Routes>
      </div>
    </Router>
  )
  
}

export default App;
