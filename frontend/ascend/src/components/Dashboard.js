import React, { useContext, useEffect, useState, useRef, useMemo } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaDumbbell, FaChartLine, FaPlus, FaListUl, FaClock, FaUserCircle } from 'react-icons/fa'; // Example icons
import Modal from "./Modal"
import WeightChart from './WeightChart';
import WeightCheckInModal from './WeightCheckInModal.js';
import formatWorkoutDate from '../utils/formatDate.js';
import * as d3 from 'd3';
import VolumeChart from './VolumeChart.js';


const StatPill = ({ title, value, icon }) => (
    <div className="flex items-center gap-3 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700/60 rounded-full px-4 py-2 text-sm">
        <div className="text-green-400">{icon}</div>
        <span className="text-neutral-300 font-medium">{title}:</span>
        <span className="text-white font-bold">{value}</span>
    </div>
);

const RecentWorkoutCard = ({ workout }) => {
    // You can define a mapping of exercise types to icons
    // This is just a basic example; you could make this much more detailed
    const getIconForWorkout = (workout) => {
        const lowerCaseName = workout.name.toLowerCase();
        if (lowerCaseName.includes('push') || lowerCaseName.includes('chest') || lowerCaseName.includes('bench')) return <FaDumbbell />;
        if (lowerCaseName.includes('pull') || lowerCaseName.includes('back')) return <FaDumbbell style={{ transform: 'rotate(180deg)' }}/>; // Just an example
        if (lowerCaseName.includes('leg') || lowerCaseName.includes('squat')) return <FaDumbbell style={{ transform: 'rotate(90deg)' }}/>;
        return <FaDumbbell />; // Default icon
    };
    
    // Use the new date formatting function
    const formattedDate = formatWorkoutDate(workout.date);

    return (
        // Main card with new styling and hover effect
        <div className="bg-gray-800 rounded-2xl p-5 flex gap-5 items-center border border-transparent hover:border-blue-500 transition-all duration-300">
            
            {/* Left side: The Icon */}
            <div className="flex-shrink-0 h-20 w-20 rounded-xl flex items-center justify-center">
                <div className="text-blue-400 text-4xl">
                    {getIconForWorkout(workout)}
                </div>
            </div>

            {/* Right side: The Details */}
            <div className="flex-grow">
                {/* Top Row: Title and Duration */}
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-xl text-white tracking-tight">{workout.name}</h3>
                    <span className="text-sm font-mono text-neutral-400 flex items-center gap-1">
                        <FaClock /> {workout.elapsed_time}
                    </span>
                </div>
                
                {/* Bottom Row: Date and Exercises */}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm font-semibold text-blue-400">{formattedDate}</p>
                        <p className="text-xs text-neutral-400 mt-1">
                            {workout.workout_sets.length} total sets
                        </p>
                    </div>
                    {/* The button is now more subtle but still clearly a button */}
                    <button 
                        onClick={() => alert(`Viewing details for ${workout.name}`)}
                        className="text-xs bg-neutral-700 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-full transition-colors duration-200"
                    >
                        Details
                    </button>
                </div>
            </div>
        </div>
    );
};


function Dashboard() {
    const navigate = useNavigate();
    const { authData, logout } = useContext(AuthContext); // logout placeholder for now.
    const [userProfile, setUserProfile] = useState(null);
    // const [userWeights, setUserWeights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
    const location = useLocation();

    // D3 Chart placeholder
    const d3ChartRef = useRef(null);

    const weeklyVolumeData = useMemo(() => {
        if (!userProfile?.workouts) {
            return []; // Return empty array if there's no data
        }
        // Use d3.timeMonday.floor to group workouts by the start of their week
        const volumeByWeek = d3.group(userProfile.workouts, w => d3.timeMonday.floor(new Date(w.date)));
        const formattedData = Array.from(volumeByWeek, ([date, workouts]) => {
            // For each week, calculate the total volume
            const totalVolume = d3.sum(workouts, w => 
                d3.sum(w.workout_sets, s => s.reps * s.weight)
            );
            return { week: date, totalVolume: totalVolume };
        });
    
        // Sort the data chronologically
        return formattedData.sort((a, b) => a.week - b.week);
    
    }, [userProfile]);

    useEffect(() => {
        // Effect runs when component loads, checks if we navigated here with the special flag we specified in new_workout.js
        if (location.state?.showWeightPrompt) {// from New_workout.js, we pass in a key value pair, the key is "showWeightPrompt" and its a bool
            setIsWeightModalOpen(true);
            navigate(location.pathname, {replace: true, state:{}}); // clearing state so modal doesn't reopen on refresh.

        } 

    }, [location, navigate])

    useEffect(() => {
        const fetchUserProfile = async () => {
            checkIfLoggedIn();

            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/user/${authData.userId}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${authData.token}`,
                    },
                });

                if (response.ok) {
                    const profile = await response.json();
                    setUserProfile(profile);
                    console.log("Profile response from API: ", profile);
                } else {
                    const errorText = await response.text();
                    console.error('Failed to fetch user profile.', response.status, errorText);
                    setError(`Failed to load profile: ${response.status}`);
                    if (response.status === 401) { // Unauthorized
                        logout(); // Clear auth data and redirect
                        navigate("/login");
                    }
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('An error occurred while fetching your profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
        
    }, [authData, navigate, logout]); // Added logout to dependency array

    // Example: data for d3 chart.
    useEffect(() => {
        if (userProfile && userProfile.workouts && d3ChartRef.current) {
            // get data from backend for user and put into chart.
            d3ChartRef.current.innerHTML = '<p class="text-center text-gray-400 p-4">D3.js Chart will render here.</p>';
        }
    }, [userProfile, d3ChartRef]);

    //logout is place holder.
    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsLogoutModalOpen(false); // Close modal after logging out
    };
    const checkIfLoggedIn = () => {
        if (!authData || !authData.userId || !authData.token) {
            navigate("/login");
            return;
        }
    }


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <FaDumbbell className="text-blue-500 text-6xl animate-spin" />
                <p className="text-white text-2xl ml-4">Loading Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-4">
                <p className="text-2xl text-red-500 mb-4">{error}</p>
                <button
                    onClick={() => navigate("/login")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Go to Login
                </button>
            </div>
        );
    }
    // few error states 
    
    if (loading) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white"><FaDumbbell className="text-blue-500 text-5xl animate-spin mr-4" /> Loading...</div>;
    if (error) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-red-400">Error: {error}</div>;
    if (!userProfile) return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-500">No profile data found.</div>;
    // data for the stat pills.
    const recentWorkouts = userProfile?.workouts?.slice(-3).reverse() || []; // Get last 3, newest first
    const totalWorkouts = userProfile?.workouts?.length || 0;
    const workoutsThisWeek = userProfile.workouts?.filter(w => {
        const workoutDate = new Date(w.date); // Assuming 'created_at'
        const today = new Date();
        const oneWeekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        return workoutDate >= oneWeekAgo;
    }).length || 0;

    

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
            <div className="container mx-auto">
                {/* Header */}
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-white">
                            Welcome back, {userProfile.username || 'Fitness Pro'}!
                        </h1>
                        <p className="text-gray-400">Let's track those gains.</p>
                    </div>
                    <div className="relative">
                        <button onClick={() => setIsLogoutModalOpen(true)}
                            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full">
                           <FaUserCircle className="text-2xl" />
                        </button>
                        {/* expand into a dropdown for Profile/Settings/Logout */}
                    </div>
                </header>

                <Modal
                    isOpen={isLogoutModalOpen}
                    onClose={() => setIsLogoutModalOpen(false)}
                    title="Confirm Logout"
                    onConfirm={handleLogout}
                    confirmText="Logout"
                    cancelText="Cancel"
                >
                    <p>Are you sure you want to log out?</p>
                </Modal>

                

                {/* quick stats Row */}
                <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatPill title="Workouts This Week" value={workoutsThisWeek} icon={<FaDumbbell />} color="bg-green-600" />
                    <StatPill title="Total Workouts" value={totalWorkouts} icon={<FaListUl />} color="bg-indigo-600" />
                    <StatPill title="Active Streak" value="Placeholder-todo" icon={<FaChartLine />} color="bg-orange-500" /> {/* Placeholder */}
                </section>

                {/* main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* left col ; recent workouts & actions */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* actions */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Link 
                                to="/new_workout"
                                className="flex items-center justify-center text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-4 rounded-xl shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
                            >
                                <FaPlus className="mr-3 text-2xl" /> Start New Workout
                            </Link>
                            <Link 
                                to="/all_workouts"
                                className="flex items-center justify-center text-lg bg-gray-700 hover:bg-gray-600 text-white font-bold py-6 px-4 rounded-xl shadow-lg transition duration-150 ease-in-out transform hover:scale-105"
                            >
                                <FaListUl className="mr-3 text-2xl" /> View All Workouts
                            </Link>
                        </section>
                        
                        {/* recent Workouts */}
                        <section>
                            <h2 className="text-3xl font-semibold mb-6 text-white">Recent Activity</h2>
                            {recentWorkouts.length > 0 ? (
                                <div className="space-y-6">
                                    {recentWorkouts.map(workout => (
                                        <RecentWorkoutCard key={workout.id} workout={workout} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-800 p-10 rounded-xl shadow-lg text-center">
                                    <FaDumbbell className="text-5xl text-gray-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg">No recent workouts logged.</p>
                                    <p className="text-gray-500">Time to hit the gym!</p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* right col,  Stats / Graph */}
                    <aside className="lg:col-span-2">
                        <h2 className="text-3xl font-semibold mb-6 text-white">Your Progress</h2>
                        {/* The new Volume Chart */}
                        {loading ? (
                            <p>Loading Volume Data...</p>
                        ) : weeklyVolumeData && weeklyVolumeData.length > 0 ? (
                            <VolumeChart data={weeklyVolumeData} />
                        ) : (
                            <div className="bg-neutral-800 p-4 rounded-lg text-center text-neutral-500">
                                <p>Complete a workout to see your volume trend.</p>
                            </div>
                        )}
                        {/* more stats/graphs */}
                        <div className="mt-8">
                            {loading ? (
                                <p>Loading Chart Data...</p>
                            ) : userProfile.weight_entries && userProfile.weight_entries.length > 0 ? (
                                <WeightChart data={userProfile.weight_entries} 
                                onLogWeightClick={() => setIsWeightModalOpen(true)}/>
                            ) : (
                                <div className="bg-gray-700 p-4 rounded-lg text-center text-neutral-500">
                                    <p>Log your weight to see your progress chart here.</p>
                                </div>
                            )}
                        </div>
                        
                    </aside>
                </div>
                {isWeightModalOpen && 
                    <WeightCheckInModal 
                        onClose={() => setIsWeightModalOpen(false)} 
                        authData={authData} 
                    />
                }

                <footer className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
                    <p>© {new Date().getFullYear()} Ascend</p>
                </footer>
            </div>
        </div>
    );
}

export default Dashboard;