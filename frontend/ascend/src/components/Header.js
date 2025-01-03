import React from 'react'
import "./Header.css"
import { Link } from "react-router-dom";
import logo from "./ascend-logo.png"

function Header({ username }) {
    
    return (
        <header className="app-header">
            <nav className="nav">
                <div className="nav-logo">
                    <img src={logo} alt="App Logo" className="logo" />
                </div>
                <div className="nav-list">

                    <Link to="/">Home</Link>
                    <Link to="/Dashboard">Dashboard</Link>
                    {!username && (
                    <Link to="/Login">Login</Link>
                    )}
                    {username && (
                        <li>
                            <Link to="/profile" className="username-link">
                                {username}
                            </Link>
                        </li>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Header