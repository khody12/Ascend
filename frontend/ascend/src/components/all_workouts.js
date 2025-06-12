import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Workouts() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // State for loading indicator

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!authData) {
            navigate("/login");
            return;
        }

        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/user/${authData.userId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json', // Corrected typo from 'applicaton'
                        'Authorization': `Token ${authData.token}`,
                    },
                });

                if (response.ok) {
                    const profile = await response.json();
                    setUserProfile(profile);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setIsLoading(false); // Stop loading regardless of success or error
            }
        };

        fetchUserProfile();
    }, [authData, navigate]);

    // Loading State UI
    if (isLoading) {
        return (
            <div className="bg-black text-gray-100 min-h-screen p-8 text-center">
                <p className="text-lg text-neutral-400">Loading your workouts...</p>
            </div>
        );
    }

    return (
        // Main container with dark background and padding
        <div className="bg-black text-gray-100 min-h-screen p-4 md:p-8">
            {/* Centered content container */}
            <div className="max-w-screen-xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-white">Your Past Workouts</h1>
                
                {/* Responsive grid for the workout cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userProfile && userProfile.workouts.length > 0 ? (
                        userProfile.workouts.map((workout) => {
                            const workoutGroupedSets = workout.workout_sets.reduce((acc, set) => {
                                const { exercise } = set;
                                acc[exercise.name] = acc[exercise.name] || [];
                                acc[exercise.name].push(set);
                                return acc;
                            }, {});

                            return (
                                
                                <div key={workout.id} className="bg-neutral-800 rounded-lg border border-neutral-700 p-5 flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-1">
                                    
                                    
                                    <div className="flex justify-between items-start pb-3 border-b border-neutral-700">
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-blue-500">{workout.name || 'Untitled Workout'}</h2>
                                            <div className="flex items-center gap-2 text-sm text-neutral-400 mt-1">
                                                <i className="fa-regular fa-clock"></i>
                                                <span>{workout.elapsed_time}</span>
                                            </div>
                                        </div>
                                        <div className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-1">
                                            <i className="fa-solid fa-chart-simple text-xl"></i>
                                        </div>
                                    </div>

                                    
                                    <div className="flex-grow space-y-3">
                                        {Object.entries(workoutGroupedSets).map(([exerciseName, sets], exerciseIndex) => (
                                            <div key={exerciseIndex}>
                                                <h4 className="font-semibold text-gray-300">{exerciseName}</h4>
                                                {sets.map((set, idx) => (
                                                    <div className="flex justify-between text-sm text-neutral-300 pl-2" key={idx}>
                                                        <span>{idx + 1}. Reps: <span className="font-medium text-white">{set.reps}</span></span>
                                                        <span className="font-medium text-white">{set.weight} lbs</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    
                                    {workout.comment && (
                                        <p className="text-sm text-neutral-400 bg-neutral-900/50 p-3 rounded-md mt-auto">
                                            {workout.comment}
                                        </p>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-16">
                             <p className="text-lg text-neutral-500">You haven't completed any workouts yet.</p>
                             <button onClick={() => navigate('/new-workout')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Start Your First Workout</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Workouts;