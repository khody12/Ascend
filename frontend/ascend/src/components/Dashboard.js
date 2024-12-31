import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';


function Dashboard() {
    const { authData } = useContext(AuthContext); // Access authData from context
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (authData) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/user/${authData.userId}/`, { 
                        // fetch data from a Get data api view in backend
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Token ${authData.token}`, // Include the token in the request
                        },
                    });

                    if (response.ok) {
                        const profile = await response.json();
                        setUserProfile(profile); // Save the fetched profile data
                        // all this data is now available within the userProfile variable
                        //userProfile.email, userProfile.first_name etc. 
                    } else {
                        console.error('Failed to fetch user profile.');
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        fetchUserProfile();
    }, [authData]);

    if (!authData) {
        return <p>Please log in to view your dashboard.</p>;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            {userProfile ? (
                <div>
                    <p>Welcome, {userProfile.name}</p>
                    <p>Email: {userProfile.email}</p>
                    <p>Weight: {userProfile.weight}</p>
                    <p>Height: {userProfile.height}</p>
                </div>
            ) : (
                <p>Loading user profile...</p>
            )}
        </div>
    );
}

export default Dashboard;