
import React, { useState, useContext, useEffect } from "react";
import axios from "axios" 
import "./Profile.css"
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
        <div id="edit-page-container">
            <div id="edit-container">
            <h1>Edit Profile</h1>
            {userProfile ? (
                <form onSubmit={handleSubmit}>
                    <div class="input-container">
                        <label>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={userProfile.username}
                            onChange={handleChange}
                            readOnly={!isEditing} // Toggle read-only
                        />
                    </div>
                    <div class="input-container">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="first_name"
                            value={userProfile.first_name || ""} // Handle empty fields
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div class="input-container">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="last_name"
                            value={userProfile.last_name || ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div class="input-container">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={userProfile.email || ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div class="input-container">
                        <label>Gender</label>
                        <select 
                            id="gender-dropdown"
                            name="gender"
                            value={userProfile.gender || ""}
                            onChange={handleChange}
                            disabled={!isEditing}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="input-container">
                        <label>Weight</label>
                        <input
                            type="text"
                            name="weight"
                            value={userProfile.UserWeight || ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
                    </div>
                    <div class="input-container">
                        <label>Height</label>
                        <input
                            type="text"
                            name="Height"
                            value={userProfile.UserHeight || ""}
                            onChange={handleChange}
                            readOnly={!isEditing}
                        />
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
        </div>
    );

}


export default Profile;
