import React, {useContext} from 'react'
import "./Header.css"
import { Link } from "react-router-dom";
import {AuthContext} from "../AuthContext";

function Header({ username }) {
    const { authData } = useContext(AuthContext)
    
    return (
        <header className="app-header">
            <nav className="nav">
                <div className="nav-list">

                    <Link to="/login">Home</Link>
                    <Link to="/Dashboard">Dashboard</Link>
                    {!authData && (
                    <Link to="/Login">Login</Link>
                    )}
                    {authData && (
                        
                        <Link to="/profile" className="username-link">
                            {authData.username}
                        </Link>
                        
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Header;