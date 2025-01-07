import "./Registration.css"

import React, { useState, useContext } from "react";
import axios from "axios" 

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';
import relaxImage from "./ascend-relax.svg";

const Registration = () => {
    const navigate = useNavigate();
    const { setAuthData } = useContext(AuthContext);
    const [first_name, setFirstname] = useState("");
    const [last_name, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm_password, setConfirmPassword] = useState("");
    const [user_weight, setUserWeight] = useState("");
    const [user_height, setUserHeight] = useState("");
    const [user_gender, setUserGender] = useState("");
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
                user_weight,
                user_height,
                user_gender
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
                <div id="registration-form-container">
                    <h2>Welcome to Ascend, let's get you set up!</h2>
                    <form onSubmit={handleSubmit}>
                        <div class="input-registration-container">
                            <input
                                type="text"
                                value={first_name}
                                onChange={(e) => setFirstname(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>First name</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="text"
                                value={last_name}
                                onChange={(e) => setLastname(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>Last name</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>Email</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>Username</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>Password</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="password"
                                value={confirm_password}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>Confirm Password:</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="number"
                                value={user_weight}
                                onChange={(e) => setUserWeight(Number(e.target.value))}
                                required
                                placeholder = " "
                            />
                            <label>Weight</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="number"
                                value={user_height}
                                onChange={(e) => setUserHeight(Number(e.target.value))}
                                required
                                placeholder = " "
                            />
                            <label>Height</label>
                        </div>
                        <div class="input-registration-container">
                            <input
                                type="text"
                                value={user_gender}
                                onChange={(e) => setUserGender(e.target.value)}
                                required
                                placeholder = " "
                            />
                            <label>Gender</label>
                        </div>
                        <button type="submit">Register</button>
                        </form>
                        
                </div>
                {message && <p>{message}</p>}
                <div id="divider"></div>
                <div id="ascend-info-container">
                    <h2>Track your progress &#128200;</h2>
                    <h2>Meet your goals &#9989;</h2>
                    <h2>Discover new ways to train&#128170;</h2>
                    <div className="relax-img">
                        <img src={relaxImage} alt="woman sitting on a bench with mountains in the background."></img>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Registration;