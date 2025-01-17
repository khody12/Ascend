
import React, { useState, useContext, useEffect } from "react";
import axios from "axios" 
import "./Profile.css"
import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const { clear } = useContext(AuthContext);
    const { authData } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => { 
        // async is a keyword in js that makes a function asynchronous allowing it to perform tasks that take time to complete without blocking the other code
        // from running, things that take time are things like fetching data. 
        const fetchUserProfile = async () => {
            if (authData) {
                try {
                    console.log(authData.userId);
                    const response = await fetch(`http://127.0.0.1:8000/user/profile/${authData.userId}/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authData.token}`,
                        },
                    });

                    if (response.ok) {
                        console.log("response good");
                        const profile = await response.json(); // response.json() basically gives us the dictionary of key value terms
                        // profile is now basically a dictionary holding these, so profile.username will give us the username value
                        // and this is basically held in storage so we can access it in this page. 
                        setUserProfile(profile);
                        console.log(profile)
                        

                    } else {
                        console.error("Failted to fetch user profile", response.status, await response.text())
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error)
                }
            }

        };

        fetchUserProfile();
    }, [authData]);

    if (!authData) {
        navigate("/login")
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserProfile((prevData) => ({
            ...prevData, // keep all previous key-value pairs in the state
            [name]: value, // update the specific field identified by 'name'
        }));
    }
    // the e here is basically the element that triggered the event.
    const logout = (e) => {
        console.log(authData)
        console.log("hello")
        clear();
        
        
        navigate("/login")


    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://127.0.0.1:8000/user/profile/${authData.userId}/`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authData.token}`,
                },
                body: JSON.stringify(userProfile),
            }
        );

        if (response.ok) {
            console.log("Profile updated successfully!");
            console.log(userProfile)
            setIsEditing(false);
        } else {
            console.error("Failed to update profile");
        }
    } catch (error) {
        console.error("Error:", error)
    }
}

    return (
        <div id="edit-page-container">
            {userProfile ? (
                <>
                <div className="log-out-container">
                    <div>
                        <h1>Welcome {userProfile.first_name}</h1>
                        <button className="sign-out-button" type="button" onClick={() => logout()}>Sign out</button>
                    </div>
                
                </div>
                <div id="edit-container">
                    <form onSubmit={handleSubmit}>
                        <div className="input-profile-container">
                            
                            <input
                                type="text"
                                name="username"
                                placeholder = " "
                                value={userProfile.username}
                                onChange={handleChange}
                                readOnly={!isEditing} // Toggle read-only
                            />
                            <label>Username</label>
                            
                        </div>
                        <div className="input-profile-container">
                            
                            <input
                                type="text"
                                name="first_name"
                                placeholder = " "
                                value={userProfile.first_name || ""} // Handle empty fields
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                            <label>First Name</label>
                        
                        </div>
                        <div className="input-profile-container">
                            
                            <input
                                type="text"
                                name="last_name"
                                placeholder = " "
                                value={userProfile.last_name || ""}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                            <label>Last Name</label>
                            
                        </div>
                        <div className="input-profile-container">
                            
                            <input
                                type="email"
                                name="email"
                                placeholder = " "
                                value={userProfile.email || ""}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                            <label>Email</label>
                            
                        </div>
                        <div className="input-profile-container">
                        
                            <select 
                                id="gender-dropdown"
                                name="user_gender"
                                value={userProfile.user_gender || ""}
                                onChange={handleChange}
                                disabled={!isEditing}>
                                <option value="" disabled>Select your gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="Other">Other</option>
                                
                            </select>
                            <label>Gender</label>
                            
                        </div>
                        <div className="input-profile-container">
                            
                            <input
                                type="text"
                                name="user_weight"
                                placeholder = " "
                                value={userProfile.user_weight || ""}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                            <label>Weight</label>   
                        </div>
                        <div className="input-profile-container">
                            <input
                                type="text"
                                name="user_height"
                                placeholder = " "
                                value={userProfile.user_height || ""}
                                onChange={handleChange}
                                readOnly={!isEditing}
                            />
                            <label>Height</label>
                        </div>
                        {isEditing ? (
                            <>
                                <button className="save-button" type="submit">Save</button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)} // Exit edit mode
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)} // Enable edit mode, we use this () => notation so that it would not immediately execute during rendering phase
                                // we want to define a function that will only execute setIsEditing(true) when the event actually occurs.
                            >
                                Edit
                            </button>
                        )}
                    </form>
                </div>
                </>
            ) : (
                <p></p>
            )}
            
            
        </div>
        
    );

}


export default Profile;
