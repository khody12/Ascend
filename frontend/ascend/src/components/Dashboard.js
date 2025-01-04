import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from "react-router-dom"
import "./Dashboard.css"


function Dashboard() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext); // Access authData from context
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            console.log(authData);
            if (authData) {
                try {
                    console.log(authData.userId);
                    const response = await fetch(`http://127.0.0.1:8000/api/user/${authData.userId}/`, { 
                        // fetch data from a Get data api view in backend
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authData.token}`, // Include the token in the request
                        },
                    });

                    if (response.ok) {
                        console.log("successfully acquired profile.")
                        const profile = await response.json();
                        setUserProfile(profile); // Save the fetched profile data
                        // all this data is now available within the userProfile variable
                        //userProfile.email, userProfile.first_name etc. 
                        console.log("profile response from API: ", profile);
                    } else {
                        console.error('Failed to fetch user profile.', response.status, await response.text());
                    }
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        };

        fetchUserProfile();
    }, [authData]);

    if (!authData) {
        navigate("/login")
        return <p>Please log in to view your dashboard.</p>;
    }
    const workoutSquares = userProfile ? userProfile.workouts.slice(0, 4) : [];
    return (
        <div id="dashboard-container">
            <div id="grid-container">
                {userProfile ? (
                    
                    userProfile.workouts.map((workout, index) => (
                        <div key={workout.id} className="grid-item square">
                            <h3>{workout.name}</h3>
                            <p>{workout.description}</p>
                        </div>
                    ))
                
                ) : (
                    <p>Loading user profile...</p>
                )}

                <div className="grid-item vertical-rectangle">
                    <h3>stats</h3>
                    <p>some graphs or whatever</p>
                </div>

                <div className="grid-item wide-rectangle">
                    <h3>up coming goals</h3>
                    <p>planner</p>
                </div>
            </div>
        </div>
    );
}
function getGridClass(index) {
    if (index === 4) return "vertical-rectangle";
    if (index === 5) return "wide-rectangle";
    return "square";
}

export default Dashboard;