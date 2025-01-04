
import React, { useState, useContext, useEffect } from "react";
import axios from "axios" 

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

function Profile() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
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
            setIsEditing(false);
        } else {
            console.error("Failed to update profile");
        }
    } catch (error) {
        console.error("Error:", error)
    }
}

    return (
        <div>
            <h1>Edit Profile</h1>
            {userProfile ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Username:</label>
                        <input
                            type="text"
                            name="username"
                            value={userProfile.username}
                            onChange={handleChange}
                            readOnly={!isEditing} // Toggle read-only
                        />
                    </div>
                    <div>
                        <label>First Name:</label>
                        <input
                            type="text"
                            name="first_name"
                            value={userProfile.first_name || ""} // Handle empty fields
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <label>Last Name:</label>
                        <input
                            type="text"
                            name="last_name"
                            value={userProfile.last_name || ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={userProfile.email || ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    {isEditing ? (
                        <>
                            <button type="submit">Save</button>
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
                            onClick={() => setIsEditing(true)} // Enable edit mode
                        >
                            Edit
                        </button>
                    )}
                </form>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );

}


export default Profile;
