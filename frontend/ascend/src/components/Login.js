import "./Login.css"
import React, { useState } from "react"; // imports react library, 
//usestate is react hook that lets you add data that changes to your components
import axios from "axios" 
// "state" in react is used to store and track dynamic data that affects what the UI displays
// useState allows us to store the name the user enters and display it later, its basically a variable here.
// use state initializes the value, so we have an initial value of ""

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/login/", {
                username, // these user name password are equivalent to the fields we need to fill in within our api view in django
                password,
            });
            setMessage(response.data.message);
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
        <div id="login-container">
            <h2>Ascend</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-container">
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-container">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Continue</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );

};

export default Login;