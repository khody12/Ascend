import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from "react-router-dom"
import "./Dashboard.css"
import { Link } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext); // Access authData from context
    const [userProfile, setUserProfile] = useState(null);
    // use useEffect functions when needing to fetch data from an API, use regular functions when we just need to submit data or do other miscellaneous things
    // useEffect is for purposes of using side effects which are operations that interact with the outside world
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
                        console.log(profile.workouts[0].workout_sets)
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
    const recentWorkouts = userProfile ? userProfile.workouts.slice(userProfile.workouts.length - 4, userProfile.workouts.length) : [];
    
    if (!authData) {
        navigate("/login")
    }
    
    return (
        <div id="dashboard-container">
            <div id="grid-container">
                {userProfile ? (
                    
                    recentWorkouts.map((workout, workoutIndex) => {
                        const workoutGroupedSets = workout.workout_sets.reduce((acc, set) => {
                            const { exercise } = set;
                            acc[exercise.name] = acc[exercise.name] || [];
                            acc[exercise.name].push(set);
                            return acc;
                        }, {});
                        return (
                            <div key={workout.id} className="grid-item square">
                                <h2>{workout.name}</h2>
                                { Object.entries(workoutGroupedSets).map(([exerciseName, sets], exerciseIndex) => (
                                    <div key={exerciseIndex}>
                                        <h4>{exerciseName}</h4>
                                        {sets.map((set, idx) => (
                                            <div className="workout-component" key={idx}>
                                                <div className="cell">{idx + 1}.</div> 
                                                <div className="cell">Reps: {set.reps}</div>  
                                                <div className="cell">{set.weight} lbs</div> 
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <p>{workout.description}</p>
                            </div>
                        );
                    })
                
                ) : (
                    <p>Loading user profile...</p>
                )}

                <div className="grid-item vertical-rectangle">
                    <h3>stats</h3>
                    <p>some graphs or whatever</p>
                </div>
                <Link to="/new_workout" style={{display: 'contents'}}>
                    <div className="grid-item wide-rectangle">
                        <h3>New workout</h3>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default Dashboard;