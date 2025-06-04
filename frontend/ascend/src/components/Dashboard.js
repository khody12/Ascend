import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaDumbbell, FaChartLine, FaPlus, FaListUl, FaClock, FaUserCircle } from 'react-icons/fa'; // Example icons
import Modal from "./Modal"
// You might want to create separate components for these later
const StatCard = ({ title, value, icon, color = "bg-blue-600" }) => (
    <div className={`p-6 rounded-xl shadow-lg text-white ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-blue-100 uppercase">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            {icon && <div className="text-4xl opacity-80">{icon}</div>}
        </div>
    </div>
);

const RecentWorkoutCard = ({ workout }) => {
    const navigate = useNavigate();

    // Simplified display of exercises for the card
    const displayedExercises = workout.workout_sets
        .reduce((acc, set) => {
            if (!acc.find(ex => ex.name === set.exercise.name)) {
                acc.push({ name: set.exercise.name, sets: 1 });
            } else {
                acc.find(ex => ex.name === set.exercise.name).sets++;
            }
            return acc;
        }, [])
        .slice(0, 3); // Show first 3 unique exercises

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-white">{workout.name}</h3>
                <span className="text-xs text-gray-400 flex items-center">
                    <FaClock className="mr-1" /> {workout.elapsed_time}
                </span>
            </div>
            <p className="text-sm text-gray-400 mb-1">
                {new Date(workout.date).toLocaleDateString()} 
            </p>
            <div className="mb-4">
                {displayedExercises.map(ex => (
                    <p key={ex.name} className="text-sm text-gray-300">
                        {ex.name} ({ex.sets} sets)
                    </p>
                ))}
                {workout.workout_sets.length > 3 && <p className="text-xs text-gray-500">...and more</p>}
            </div>
            {/* Placeholder for now */}
            <button 
                onClick={() => alert(`Viewing details for ${workout.name}`)} 
                className="w-full text-center mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out"
            >
                View Details
            </button>
        </div>
    );
};


function Dashboard() {
    const navigate = useNavigate();
    const { authData, logout } = useContext(AuthContext); // logout placeholder for now.
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // D3 Chart placeholder
    const d3ChartRef = useRef(null);
    //logout is place holder.
    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsLogoutModalOpen(false); // Close modal after logging out
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!authData || !authData.userId || !authData.token) {
                navigate("/login");
                return;
            }
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

    if (!userProfile) { // Should be covered by loading/error but as a fallback
        return <div className="min-h-screen bg-gray-900 text-white p-4">No user profile data.</div>;
    }
    
    const recentWorkouts = userProfile.workouts?.slice(-3).reverse() || []; // Get last 3, newest first
    const totalWorkouts = userProfile.workouts?.length || 0;
    // additional stats can be created here.
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
                    <StatCard title="Workouts This Week" value={workoutsThisWeek} icon={<FaDumbbell />} color="bg-green-600" />
                    <StatCard title="Total Workouts" value={totalWorkouts} icon={<FaListUl />} color="bg-indigo-600" />
                    <StatCard title="Active Streak" value="Placeholder-todo" icon={<FaChartLine />} color="bg-cyan-700" /> {/* Placeholder */}
                </section>

                {/* main content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* left col ; recent workouts & actions */}
                    <div className="lg:col-span-2 space-y-8">
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
                    <aside className="lg:col-span-1">
                        <h2 className="text-3xl font-semibold mb-6 text-white">Your Progress</h2>
                        <div 
                            ref={d3ChartRef} 
                            id="d3-chart-container" 
                            className="bg-gray-800 p-6 rounded-xl shadow-lg min-h-[300px] flex items-center justify-center"
                        >
                            {/* D3 Chart here via useeffect */}
                        </div>
                        {/* more stats/graphs */}
                        <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-lg">
                            <h4 className="text-lg font-semibold text-white mb-3">Body Weight Trend</h4>
                            <p className="text-gray-400 text-sm">Graph coming soon...</p>
                            {/* another placeholder for a different chart or data point */}
                        </div>
                    </aside>
                </div>

                <footer className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
                    <p>© {new Date().getFullYear()} Ascend</p>
                </footer>
            </div>
        </div>
    );
}

export default Dashboard;