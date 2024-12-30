import React, { useState } from "react";
import axios from "axios" 


const Registration = () => {
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
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/register/", {
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
        <div>
            <h2>Welcome to Ascend, let's get you set up!</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>First name:</label>
                    <input
                        type="text"
                        value={first_name}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Last name:</label>
                    <input
                        type="text"
                        value={last_name}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        value={confirm_password}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Weight:</label>
                    <input
                        type="text"
                        value={UserWeight}
                        onChange={(e) => setUserWeight(e.target.value)}
                        required
                    />
                </div>
                <div>
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
    );

};

export default Registration;