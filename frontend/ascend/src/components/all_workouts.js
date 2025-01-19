import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import "./all_workouts.css"

function Workouts() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            console.log(authData);
            if( authData ) {
                try {
                    const response = await fetch(`http://127.0.0.1:8000/api/user/${authData.userId}/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'applicaton/json',
                            'Authorization': `Token ${authData.token}`,
                        },
                    });

                    if (response.ok) {
                        const profile = await response.json();
                        setUserProfile(profile);
                        console.log("profile response from api: ", profile)
                    }
                } catch (error) {
                    console.error('error fetching user profile:', error)
                }
            } else {
                navigate("/login")
            }

        };
        fetchUserProfile();
    }, [authData]);

    return (
        <div id="all-workouts-container">
            <div className="all-workouts-grid">
            {userProfile ? (
                    
                    userProfile.workouts.map((workout, workoutIndex) => {
                        const workoutGroupedSets = workout.workout_sets.reduce((acc, set) => {
                            const { exercise } = set;
                            acc[exercise.name] = acc[exercise.name] || [];
                            acc[exercise.name].push(set);
                            return acc;
                        }, {});
                        return (
                            <div key={workout.id} className="grid-item square">
                                <div className="info-bar">
                                    
                                    <h2>{workout.name}</h2>
                                    <div>
                                        <div><i class="fa-regular fa-clock"></i></div>
                                        <div>{workout.elapsed_time}</div>
                                    </div>
                                    
                                    <div className="graph-icon">
                                        <i 
                                            class="fa-solid fa-chart-simple" 
                                            style={{fontSize:"25px", cursor:"pointer"}}
                                        ></i>
                                    </div>
                                </div>
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
                    <p></p>
                )}
                


            </div>
        </div>
    )
}
export default Workouts;