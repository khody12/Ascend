import React from 'react'
import "./Header.css"
import { Link } from "react-router-dom";

function Header({ username }) {
    
    return (
        <header className="app-header">
            <nav className="nav">
                <ul className="nav-list">
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/Dashboard">Dashboard</Link></li>
                    {!username && (
                    <li><Link to="/Login">Login</Link></li>
                    )}
                    {username && (
                        <li>
                            <Link to="/profile" className="username-link">
                                {username}
                            </Link>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    )
}

export default Header