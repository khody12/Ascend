

import React, { useState, useContext } from "react";
import axios from "axios" 

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';
import relaxImage from "./ascend-relax.svg";


const InputField = ({ id, label, type, value, onChange, required = true, autoComplete = "off" }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400
                           focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
                           disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none"
            />
        </div>
    );
};


const Registration = () => {
    const navigate = useNavigate();
    const { setAuthData } = useContext(AuthContext);
    // --- All your existing state variables remain the same ---
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
    const [isLoading, setIsLoading] = useState(false);


    // --- Your handleSubmit function remains largely the same, with added isLoading state ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        setMessage(""); // Clear previous messages
        console.log("starting registration");
        
        if (password !== confirm_password) {
            setMessage("Passwords do not match.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://127.0.0.1:8000/register/", {
                first_name,
                last_name,
                email,
                username,
                password,
                confirm_password, // Django backend might still expect this
                user_weight: Number(user_weight), // Ensure these are numbers if backend expects numbers
                user_height: Number(user_height),
                user_gender
            });

            if (response.status === 201) {
                console.log("Registration successful", response.data);
                const data = response.data;

                setAuthData({
                    token: data.token,
                    userId: data.id,
                    username: data.username, 
                });
                
                // localStorage is handled by AuthContext, so no need to set items here
                // console.log("Attempting to set username: ", data.username);
                // console.log(localStorage.getItem("username"));

                setMessage("Successful registration! Redirecting...");
                // console.log("Successfully registered, navigating to /dashboard...");
                
                setTimeout(() => { // Give a moment for the user to see the success message
                    navigate("/dashboard");
                }, 1500);
            }
        } catch (error) {
            console.error("Registration error:", error.response || error.message);
            if (error.response) {
                // Attempt to parse and display backend error messages
                const errorData = error.response.data;
                let errorMessage = "An error occurred during registration.";
                if (typeof errorData === 'object' && errorData !== null) {
                    // Example: if backend returns { username: ["This username already exists."] }
                    const fieldErrors = Object.values(errorData).flat().join(' ');
                    if (fieldErrors) {
                        errorMessage = fieldErrors;
                    } else if (errorData.detail) {
                         errorMessage = errorData.detail;
                    }
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
                setMessage(errorMessage);
            } else {
                setMessage("An error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false); // Stop loading regardless of outcome
        }
    };

    return (
        <div className="min-h-screen bg-green-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Main container for the registration card */}
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl"> {/* Increased max-width for two columns */}
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16"> {/* Two columns on medium screens and up */}
                        
                        {/* Column 1: Registration Form */}
                        <div className="md:pr-8"> {/* Add some padding to the right on desktop */}
                            <div className="mb-8 text-center md:text-left">
                                <h2 className="text-3xl font-extrabold text-slate-900">
                                    Join Ascend
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    Create your account to start tracking your fitness journey.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <InputField id="first_name" label="First Name" type="text" value={first_name} onChange={(e) => setFirstname(e.target.value)} />
                                    <InputField id="last_name" label="Last Name" type="text" value={last_name} onChange={(e) => setLastname(e.target.value)} />
                                </div>
                                <InputField id="email" label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                                <InputField id="username" label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <InputField id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                                    <InputField id="confirm_password" label="Confirm Password" type="password" value={confirm_password} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                                    <InputField id="user_weight" label="Weight (lbs)" type="number" value={user_weight} onChange={(e) => setUserWeight(e.target.value)} />
                                    <InputField id="user_height" label="Height (inches)" type="number" value={user_height} onChange={(e) => setUserHeight(e.target.value)} />
                                    <InputField id="user_gender" label="Gender" type="text" value={user_gender} onChange={(e) => setUserGender(e.target.value)} />
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-400 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Create Account'}
                                    </button>
                                </div>

                                {message && (
                                <p className={`mt-6 text-center text-sm ${message.includes("Successful") ? 'text-green-600' : 'text-red-600'}`}>
                                    {message}
                                </p>
                            )}

                            </form>

                            
                        </div>

                        {/* Column 2: Info / Image */}
                        <div className="hidden md:flex flex-col items-center justify-center p-8 bg-slate-0 rounded-lg">
                             <img src={relaxImage} alt="Relax and Ascend" className="w-full max-w-sm mb-8 rounded-lg"/>
                             <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Discover new ways to train </h2>
                             <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Track your progress </h2>
                             <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Meet your goals </h2>
                             <h2 className="text-2xl font-bold text-slate-800 mb-3 text-center">Ascend </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;

// const Registration = () => {
//     const navigate = useNavigate();
//     const { setAuthData } = useContext(AuthContext);
//     const [first_name, setFirstname] = useState("");
//     const [last_name, setLastname] = useState("");
//     const [email, setEmail] = useState("");
//     const [username, setUsername] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirm_password, setConfirmPassword] = useState("");
//     const [user_weight, setUserWeight] = useState("");
//     const [user_height, setUserHeight] = useState("");
//     const [user_gender, setUserGender] = useState("");
//     const [message, setMessage] = useState("");

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         console.log("starting registration")
        
//         try {
//             const response = await axios.post("http://127.0.0.1:8000/register/", {
//                 first_name,
//                 last_name,
//                 email,
//                 username, // these user name password are equivalent to the fields we need to fill in within our api view in django
//                 password,
//                 confirm_password,
//                 user_weight,
//                 user_height,
//                 user_gender
//             });
//             if (response.status === 201) {
//                 console.log("Registration succesful", response.data)
//                 const data = response.data

//                 setAuthData({
//                     token: data.token,
//                     userId: data.id,
//                     username: data.username, 
//                 })
                
//                 localStorage.setItem("token", data.token); 
//                 localStorage.setItem("userId", data.id); // primary key for data retrieval in the future. 
//                 localStorage.setItem("username", data.username);
                

//                 console.log("Successfully registered, navigating to /dashboard...");
//                 console.log("Navigation completed.");

//                 setMessage("Succesful registration");

//                 navigate("/dashboard")
//             }
            
//         } catch (error) {
//             if (error.response && error.response.status === 401) {
//                 setMessage("invalid username or password");
//             } else if (error.response && error.response.status === 400) {
//                 setMessage("Please fill in both fields.");
//             } else {
//                 setMessage(error.response?.data?.error || "An error occurred.");
//             }
            
//         }
//     };

//     return (
        
//         <div id="registration-page-container">

//             <div id="registration-container">
//                 <div id="registration-form-container">
//                     <h2>Welcome to Ascend, let's get you set up!</h2>
//                     <form onSubmit={handleSubmit}>
//                         <div class="input-registration-container">
//                             <input
//                                 type="text"
//                                 value={first_name}
//                                 onChange={(e) => setFirstname(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>First name</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="text"
//                                 value={last_name}
//                                 onChange={(e) => setLastname(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Last name</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="text"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Email</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="text"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Username</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Password</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="password"
//                                 value={confirm_password}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Confirm Password:</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="number"
//                                 value={user_weight}
//                                 onChange={(e) => setUserWeight(Number(e.target.value))}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Weight</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="number"
//                                 value={user_height}
//                                 onChange={(e) => setUserHeight(Number(e.target.value))}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Height</label>
//                         </div>
//                         <div class="input-registration-container">
//                             <input
//                                 type="text"
//                                 value={user_gender}
//                                 onChange={(e) => setUserGender(e.target.value)}
//                                 required
//                                 placeholder = " "
//                             />
//                             <label>Gender</label>
//                         </div>
//                         <button type="submit">Register</button>
//                         </form>
                        
//                 </div>
//                 {message && <p>{message}</p>}
//                 <div id="divider"></div>
//                 <div id="ascend-info-container">
//                     <h2>Track your progress &#128200;</h2>
//                     <h2>Meet your goals &#9989;</h2>
//                     <h2>Discover new ways to train&#128170;</h2>
//                     <div className="relax-img">
//                         <img src={relaxImage} alt="woman sitting on a bench with mountains in the background."></img>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );

// };

// export default Registration;