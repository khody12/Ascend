import React, {useContext} from 'react'
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { motion } from 'framer-motion';
import { FiLogIn, FiUser } from 'react-icons/fi';

export default function Header() {
    const { authData } = useContext(AuthContext);

    // This is a simple reusable component for nav links to keep the main return clean
    const NavItem = ({ to, children }) => {
        return (
            //NavLinks know when they are active unlike regular Links. The component constantly compares its 'to' prop (like /dashboard)
            // with the current URL in the browser's address bar. 
            // This isActive allows us to have this nice little blue underline that moves depending on which page were on. 
            <NavLink to={to} className={({ isActive }) =>
                `relative px-3 py-2 text-base font-medium transition-colors duration-300 ${isActive ? 'text-cyan-500' : 'text-slate-600 hover:text-cyan-500'}`
            }>
                {({ isActive }) => (
                    <>
                        <span className="flex items-center space-x-2">
                            {children}
                        </span>
                        
                        {isActive && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                                layoutId="underline" // This creates the magic-move animation
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <motion.header 
            className="w-full bg-green-50 backdrop-blur-lg border-b border-slate-300/80 sticky top-0 z-50"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-4">
                {/* Left Side: Logo/Brand */}
                <Link to="/" className="text-2xl font-bold text-slate-800">
                    Ascend
                </Link>

                {/* Center: Main Navigation */}
                <div className="flex items-center space-x-4">
                    <NavItem to="/">Home</NavItem> {/* we need to define 'to' so it knows wheres its going */}
                    <NavItem to="/dashboard">Dashboard</NavItem>
                    {/* can add other links here later.*/}
                </div>

                {/* on the right side we access our profile info. */}
                <div className="flex items-center space-x-4">
                    {authData ? (
                        <NavItem to="/profile" className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-cyan-500 transition-colors duration-300">
                            <FiUser/>
                            <span>{authData.username}</span>
                        </NavItem>
                    ) : (
                        <NavItem to="/login" className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-cyan-500 transition-colors duration-300">
                            <FiLogIn/>
                            <span>Login</span>
                        </NavItem>
                    )}
                </div>
            </nav>
        </motion.header>
    );
}
