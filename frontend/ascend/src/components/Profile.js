
// src/components/Profile.js

import React, { useState, useContext, useEffect } from "react";
import axios from "axios"; // You were using fetch, but if you prefer axios, ensure it's imported. Sticking to fetch for now as per your original code.
import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

// Reusable InputField component (copied from Registration.js)
const InputField = ({ id, label, type, value, onChange, required = false, autoComplete = "off", readOnly = false }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
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
                readOnly={readOnly}
                className={`mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 shadow-sm placeholder-gray-400
                           focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500
                           ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}
                           disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none`}
            />
        </div>
    );
};

// Reusable SelectField component (copied from Registration.js)
const SelectField = ({ id, label, value, onChange, options, required = false, disabled = false }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`mt-1 block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 bg-white rounded-md shadow-sm 
                           focus:outline-none focus:ring-green-500 focus:border-green-500
                           ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} disabled={option.value === "" && required}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

function Profile() {
    const navigate = useNavigate();
    const { authData, clear } = useContext(AuthContext); // Combined destructuring
    const [userProfile, setUserProfile] = useState(null);
    const [originalUserProfile, setOriginalUserProfile] = useState(null); // To store original data for cancel
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // For initial profile fetch
    const [isSaving, setIsSaving] = useState(false); // For save operation
    const [message, setMessage] = useState("");


    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authData && authData.userId && authData.token) {
                setIsLoading(true);
                setMessage("");
                try {
                    const response = await fetch(`http://127.0.0.1:8000/user/profile/${authData.userId}/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authData.token}`,
                        },
                    });

                    if (response.ok) {
                        const profile = await response.json();
                        setUserProfile(profile);
                    } else {
                        const errorText = await response.text();
                        console.error("Failed to fetch user profile", response.status, errorText);
                        setMessage(`Error: Could not load profile (${response.status}).`);
                        if (response.status === 401 || response.status === 403) {
                            clear(); // Clear auth data if unauthorized
                            navigate("/login");
                        }
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setMessage("An error occurred while loading your profile.");
                } finally {
                    setIsLoading(false);
                }
            } else {
                // If authData is not fully available, redirect to login.
                // This also handles the case where authData might be cleared by another tab/action.
                navigate("/login");
            }
        };

        fetchUserProfile();
    }, [authData, navigate, clear]); // Added navigate and clear to dependency array

    // Gender options for the profile page
    // Ensure these values ("male", "female", "Other") match what your backend sends/expects for user_gender
    const genderProfileOptions = [
        { value: "", label: "Select Gender..." }, // Placeholder
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "Other", label: "Other" },
    ];
     // If your backend uses 'M', 'F', 'O', you'd use:
    // const genderProfileOptions = [
    //     { value: "", label: "Select Gender..." },
    //     { value: "M", label: "Male" },
    //     { value: "F", label: "Female" },
    //     { value: "O", label: "Other" },
    // ];


    const handleChange = (e) => {
        const { name, value } = e.target; // e.target = specific html element that triggered the event.
        setUserProfile((prevData) => ({
            ...prevData, // this spread syntax ... creates shallow copy of existing userProfile object
            [name]: value, //updates the value thats at key name.
        }));
    };

    const handleLogout = () => {
        clear(); // This function from AuthContext should handle localStorage.clear() and setAuthData(null)
        navigate("/login");
    };

    const handleEdit = () => {
        // console.log("Edit button clicked, setting isEditing to true"); // Diagnostic log
        setOriginalUserProfile(userProfile); 
        setIsEditing(true);
        setMessage(""); 
    };

    const handleCancel = () => {
        // console.log("Cancel button clicked, setting isEditing to false and reverting changes"); // Diagnostic log
        setUserProfile(originalUserProfile); 
        setIsEditing(false);
        setMessage("");
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }

        e.preventDefault();
        setIsSaving(true);
        setMessage("");
        try {
            // Ensure numeric fields are numbers if backend expects them
            const profileToSave = {
                ...userProfile,
                user_weight: userProfile.user_weight ? Number(userProfile.user_weight) : null,
                user_height: userProfile.user_height ? Number(userProfile.user_height) : null,
            };

            const response = await fetch(`http://127.0.0.1:8000/user/profile/${authData.userId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${authData.token}`,
                },
                body: JSON.stringify(profileToSave),
            });

            if (response.ok) {
                const updatedProfile = await response.json();
                setUserProfile(updatedProfile); // Update state with potentially processed data from backend
                setIsEditing(false);
                setMessage("Profile updated successfully!");
                setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
            } else {
                const errorData = await response.json();
                let errorMessage = "Failed to update profile.";
                if (typeof errorData === 'object' && errorData !== null) {
                    const fieldErrors = Object.values(errorData).flat().join(' ');
                    if (fieldErrors) errorMessage = fieldErrors;
                    else if (errorData.detail) errorMessage = errorData.detail;
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
                setMessage(errorMessage);
                console.error("Failed to update profile", response.status, errorData);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage("An error occurred while saving your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-green-50 flex items-center justify-center">
                <p className="text-gray-700 text-lg animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (!userProfile) {
        // This case might be hit if fetch failed but didn't redirect, or if authData is somehow invalid
        // The useEffect should handle redirecting if authData is missing/invalid.
        // If message is set from fetch error, it will be shown. Otherwise, a generic message or redirect.
        return (
             <div className="min-h-screen bg-green-50 flex items-center justify-center text-center px-4">
                <p className="text-red-600 text-lg">
                    {message || "Could not load profile. Please try logging in again."}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-300 shadow-xl rounded-lg w-full max-w-2xl">
                {/* Welcome and Logout Section */}
                <div className="p-6 sm:p-8 border-b border-gray-200 flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                        Welcome, {userProfile.first_name || userProfile.username}!
                    </h1>
                    <button 
                        onClick={handleLogout}
                        className="ml-4 flex-shrink-0 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Profile Form Section */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField 
                            id="username" 
                            label="Username" 
                            type="text" 
                            name="username" 
                            value={userProfile.username || ""} 
                            onChange={handleChange} 
                            readOnly={!isEditing} 
                        />
                        <InputField 
                            id="email" 
                            label="Email" 
                            type="email" 
                            name="email" 
                            value={userProfile.email || ""} 
                            onChange={handleChange} 
                            readOnly={!isEditing} 
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InputField 
                            id="first_name" 
                            label="First Name" 
                            type="text" 
                            name="first_name" 
                            value={userProfile.first_name || ""} 
                            onChange={handleChange} 
                            readOnly={!isEditing} 
                        />
                        <InputField 
                            id="last_name" 
                            label="Last Name" 
                            type="text" 
                            name="last_name" 
                            value={userProfile.last_name || ""} 
                            onChange={handleChange} 
                            readOnly={!isEditing} 
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <InputField 
                            id="user_weight" 
                            label="Weight (lbs)" 
                            type="number" 
                            name="user_weight" 
                            value={userProfile.user_weight || ""} 
                            onChange={handleChange} 
                            readOnly={!isEditing} 
                        />
                        <InputField 
                            id="user_height" 
                            label="Height (inches)" 
                            type="number" 
                            name="user_height" 
                            value={userProfile.user_height || ""} 
                            onChange={handleChange} 
                            readOnly={!isEditing} 
                        />
                        <SelectField
                            id="user_gender"
                            label="Gender"
                            name="user_gender" // Ensure name attribute is set for handleChange
                            value={userProfile.user_gender || ""}
                            onChange={handleChange}
                            options={genderProfileOptions}
                            disabled={!isEditing}
                        />
                    </div>

                    {/* Message display area */}
                    {message && (
                        <p className={`text-center text-sm ${message.includes("success") ? 'text-green-600' : 'text-red-600'}`}>
                            {message}
                        </p>
                    )}

                    {/* Buttons Section */}
                    <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 pt-4 space-y-3 sm:space-y-0">
                        {isEditing ? (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto order-1 sm:order-2 flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="w-full sm:w-auto order-2 sm:order-1 flex justify-center py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="w-full sm:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;
