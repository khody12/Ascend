import "./Registration.css"

import React, { useState, useContext } from "react";
import axios from "axios" 

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

const Registration = () => {
    const navigate = useNavigate();
    const { setAuthData } = useContext(AuthContext);
    const [first_name, setFirstname] = useState("");
    const [last_name, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [UserWeight, setUserWeight] = useState("");
    const [UserHeight, setUserHeight] = useState("");
    const [UserGender, setUserGender] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("starting registration")
        try {
            const response = await axios.post("http://127.0.0.1:8000/register/", {
                first_name,
                last_name,
                email,
                username, // these user name password are equivalent to the fields we need to fill in within our api view in django
                password,
                confirm_password,
                UserWeight,
                UserHeight,
                UserGender
            });
            if (response.status === 201) {
                console.log("Registration succesful", response.data)
                const data = response.data

                setAuthData({
                    token: data.token,
                    userId: data.id,
                })
                
                localStorage.setItem("token", data.token); 
                localStorage.setItem("userId", data.id); // primary key for data retrieval in the future. 
                localStorage.setItem("username", data.username);

                console.log("Successfully registered, navigating to /dashboard...");
                console.log("Navigation completed.");

                setMessage("Succesful registration");

                navigate("/dashboard")
            }
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage("invalid username or password");
            } else if (error.response && error.response.status === 400) {
                setMessage("Please fill in both fields.");
            } else {
                setMessage(error.response?.data?.error || "An error occurred.");
            }
            
        }
    };

    return (
        <div id="registration-page-container">
            <div id="registration-container">
                <h2>Welcome to Ascend, let's get you set up!</h2>
                <form onSubmit={handleSubmit}>
                    <div class="input-container">
                        <label>First name:</label>
                        <input
                            type="text"
                            value={first_name}
                            onChange={(e) => setFirstname(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Last name:</label>
                        <input
                            type="text"
                            value={last_name}
                            onChange={(e) => setLastname(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Email:</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Confirm Password:</label>
                        <input
                            type="password"
                            value={confirm_password}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Weight:</label>
                        <input
                            type="text"
                            value={UserWeight}
                            onChange={(e) => setUserWeight(e.target.value)}
                            required
                        />
                    </div>
                    <div class="input-container">
                        <label>Height:</label>
                        <input
                            type="text"
                            value={UserHeight}
                            onChange={(e) => setUserHeight(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Login</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );

};

export default Registration;