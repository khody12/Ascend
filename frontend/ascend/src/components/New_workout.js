

import React, { useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

function New_workout() {
    const navigate = useNavigate();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const { authData } = useContext(AuthContext);
    const [workoutExercises, setWorkoutExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState("");
    const [currentSet, setCurrentSet] = useState({reps: "", weight: "", exercise: ""});
    const [exercises, setUserExercises] = useState([]);
    const [workoutTitle, setWorkoutTitle] = useState("");
    const [workoutComment, setWorkoutComment] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [exerciseData, setExerciseData] = useState("");


    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    const alterTimer = () => setIsRunning(!isRunning);

    const resetTimer = () => {
        setIsRunning(false);
        setTime(0);
    };
    const secondsToTimeString = (time) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return [hours, minutes, seconds]
            .map((unit) => String(unit).padStart(2, "0"))
            .join(":")
    }

    // use memo takes in a function tthat performs some calculation typically and also a dependency array that the calculations depend on
    // it will only recalculate when the values change, which is important for performance. 
    const workoutSummary = useMemo(() => {
        let totalSets = workoutExercises.length;
        let totalReps = 0;
        let totalVolume = 0;

        workoutExercises.forEach(set => {
            totalReps += parseInt(set.reps) || 0;
            totalVolume += (parseInt(set.reps) || 0) * (parseInt(set.weight) || 0);
        })
        return { totalSets, totalReps, totalVolume }; // these are the variables that workoutSummary will hold. 
    }, [workoutExercises]);

    useEffect(() => { // get exercise data from API.
        const fetchExercises = async () => {
            if (authData) {
                try {
                    console.log("fetching exercises");
                    const response = await fetch("http://127.0.0.1:8000/api/exercises/", {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authData.token}`,
                        },
                        
                    });
                    if (response.ok) {
                        console.log("Fetched exercises");
                        const exercises = await response.json(); // api will send back exercises
                        setUserExercises(exercises)
                    }
                } catch (error) {
                    console.error("Error fetching exercises:", error)
                }
            }
        }
        fetchExercises();
    }, [authData]);
    //this array he is called dependency array and basically react will rerun useEffect fucniton only if one
    // of these dependencies change.

    useEffect(() => {
        const fetchExerciseData = async () => {
            if (authData && selectedExercise?.id) {
                console.log(selectedExercise.id)
                try{
                    const response = await fetch(`http://127.0.0.1:8000/api/exerciseStats/${selectedExercise.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authData.token}`,
                        },
                    });
                    if (response.ok) {
                        console.log("fetched exercise data");
                        const exerciseData = await response.json();
                        setExerciseData(exerciseData)
                        console.log("data:", exerciseData)
                    }
                    
                } catch (error) {
                    console.error("Error fetching stats:", error)
                } 

            }
        }
        fetchExerciseData();
        

    }, [selectedExercise]) // everytime the selected exercise changes, we need to show the stats for it.

    useEffect(() => {
        let timer;

        if (isRunning) {
            timer = setInterval(() => {
                setTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => {clearInterval(timer)};


    }, [isRunning])

    const handleInputChange = (e) => {
        // getting name and value from changed input.
        const { name, value } = e.target; // const name = e.target.name, const value = e.target.value;
        // if exercise was changed, we have a different process.
        if (name === "exercise") {
            // find() in js is used to search for the first elem in an array that satisfies the conditon. 
            //it applies a callback funciton to each element and if the callback returns a truthy value for an elem, that elem is returned.
            const selectedExercise = exercises.find((ex) => ex.id === parseInt(value));
            setSelectedExercise(selectedExercise);
            setCurrentSet({ ...currentSet, exercise: selectedExercise });
        } else {
            setCurrentSet({ ...currentSet, [name]: value}); // this ... operator creates a new react state, copies everything from the previous state
            // which is currentSet, but it changes what we specify, so we might change exercise with SelectedExercise, and we change the value for the key name with value. 
        }
    }

    const handleAddSet = (e) => {
        e.preventDefault();
        
        if (!selectedExercise || !currentSet.reps || !currentSet.weight) {
            console.log("fill it all out!")
            setMessage("Please fill out all fields before adding a set.");
            return;
        } else if (currentSet.reps < 0 || currentSet.weight < 0) {
            console.log("The weight or reps is less than zero, try again.")
            setMessage("Invalid number for weight or reps.")
            return;
        }

        
        console.log("adding set");
        setMessage(null); // setMessage to null as basic error checking has been done so we shouldn't have an error at this point. 
        setWorkoutExercises([...workoutExercises, currentSet]);
        setCurrentSet({reps: "", weight: "", exercise: selectedExercise});
        console.log(workoutExercises);


    }
    // this code groups our workout sets by their exercise
    const groupedSets = workoutExercises.reduce((acc, set) => {
        const { exercise } = set;
        acc[exercise.name] = acc[exercise.name] || [];
        acc[exercise.name].push(set);
        return acc;
    }, {});




    // this is what we will send as a post at the very end, this creates our workout, and exits us out of the
    //workout interface
    const openModal = (e) => {
        e.preventDefault() // prevent reload.
        setIsModalOpen(true);
    }
    
    const saveWorkout = async (e) => {
        e.preventDefault();
        const payload = {
            name: workoutTitle,
            date: new Date().toISOString().split("T")[0],
            workout_sets: workoutExercises,
            elapsed_time: secondsToTimeString(time),
            comment: workoutComment,
        };

        try {
            await axios.post("http://127.0.0.1:8000/user/create-workout/", payload, {
                headers: {
                    "Authorization": `Token ${authData.token}`,
                    "Content-Type": "application/json"
                },
            });

            const promptForWeightResponse = await axios.get("http://127.0.0.1:8000/api/user/weightData/?latest=true", {
                headers: { 'Authorization': `Token ${authData.token}` }
            });

            let shouldPromptForWeight = true;
            if (promptForWeightResponse.data && promptForWeightResponse.data.length > 0) {
                const lastEntryDate = new Date(promptForWeightResponse.data[0].date_recorded);
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                if (lastEntryDate > oneWeekAgo) {
                    shouldPromptForWeight = false;
                }
            }
            
            navigate("/dashboard", { state: { showWeightPrompt: shouldPromptForWeight } });

        } catch (error) {
            console.error("An error occurred during the save workout process:", error.response || error);
            
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                if (error.response.status === 401) {
                    setMessage("Authentication failed. Please log in again.");
                } else if (error.response.status === 400) {
                    const errorMessage = error.response.data?.detail || "Please check the data you entered.";
                    setMessage(errorMessage);
                } else {
                    setMessage("A server error occurred. Please try again later.");
                }
            } else if (error.request) {
                // The request was made but no response was received
                setMessage("Network error. Could not connect to the server.");
            } else {
                // Something happened in setting up the request that triggered an Error
                setMessage("An unexpected error occurred.");
            }
        }
    };


 
    return (
        <div className="bg-black text-gray-100 font-sans h-screen flex flex-col">
            {isModalOpen && (
                // Mmodal container
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    {/* modal content */}
                    <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-md flex flex-col gap-4">
                        <h3 className="text-xl font-semibold text-center">Save Workout</h3>
                        <input
                            type="text"
                            placeholder="Workout Title (e.g. Push Day)"
                            value={workoutTitle}
                            onChange={(e) => setWorkoutTitle(e.target.value)}
                            className="bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <input
                            type="text"
                            placeholder="Comments (optional)"
                            value={workoutComment}
                            onChange={(e) => setWorkoutComment(e.target.value)}
                            className="bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        {/* buttons */}
                        <div className="flex items-center justify-end gap-3 mt-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-neutral-600 rounded-md hover:bg-neutral-500 transition-colors">
                                <i className="fa-solid fa-xmark"></i> Cancel
                            </button>
                            <button onClick={saveWorkout} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                                <i className="fa-solid fa-check"></i> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* timer and controls */}
            <div className="flex justify-between items-center p-4 bg-neutral-900 border-b border-neutral-800 flex-shrink-0">
                <h5 className="text-3xl font-semibold font-mono tracking-wider">{formatTime(time)}</h5>
                <div className="flex items-center gap-3">
                    <button onClick={alterTimer} className="w-12 h-12 flex items-center justify-center text-xl bg-neutral-700 rounded-full hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors">
                         {/* toggle between play and pause icons */}
                        {isRunning ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                    </button>
                    <button onClick={openModal} className="w-12 h-12 flex items-center justify-center text-xl bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors">
                        <i className="fa-solid fa-check"></i>
                    </button>
                </div>
            </div>
            
            {/* main workout area */}
            <div className="flex-grow flex flex-row overflow-hidden">
                
                {/* Scrollable container for the sets */}
                <div className="flex-grow flex flex-col overflow-hidden w-3/4">
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        
                        {Object.entries(groupedSets).map(([exerciseName, sets], index) => (
                            //Exercise group card
                            <div key={index} className="bg-neutral-800 rounded-lg p-5">
                                <h4 className="text-xl font-semibold text-blue-500 border-b border-neutral-700 pb-3 mb-3">
                                    {exerciseName}
                                </h4>
                                {/* container for the list of sets with dividers between them */}
                                <div className="divide-y divide-neutral-700">
                                    {sets.map((set, idx) => (
                                        // Individual set row
                                        <div className="flex items-center justify-between py-3" key={idx}>
                                            <div className="text-neutral-400 font-bold w-8">{idx + 1}.</div>
                                            <div className="flex-1">Reps: <span className="font-semibold text-white">{set.reps}</span></div>
                                            <div className="flex-1 text-right"><span className="font-semibold text-white">{set.weight}</span> lbs</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {/* message for when no sets have been added yet */}
                        {workoutExercises.length === 0 && (
                            <div className="text-center text-neutral-500 pt-16">
                                <p className="text-lg">Your workout is empty.</p>
                                <p>Add your first set below!</p>
                            </div>
                        )}
                    </div>

                    {/* bottom bar for adding a new set */}
                    <div className="flex-shrink-0 p-3 bg-neutral-900 border-t border-neutral-800 p-8">
                        {/* Error message display*/}
                        {message && <p className="text-red-500 text-sm text-center pb-2">{message}</p>}
                        <div className="flex items-center gap-3">
                            <select name="exercise"
                                value={selectedExercise?.id || ""} 
                                onChange={handleInputChange}
                                className="bg-neutral-700 border border-neutral-600 rounded-md p-3 w-full text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none flex-grow"
                            >
                                <option value="0">Select an exercise</option>
                                {exercises.map((exercise) =>(
                                    <option key={exercise.id} value={exercise.id}>
                                        {exercise.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number" name="reps" placeholder="Reps" value={currentSet.reps} onChange={handleInputChange}
                                className="bg-neutral-700 border border-neutral-600 rounded-md p-3 w-24 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <input
                                type="number" name="weight" placeholder="Weight" value={currentSet.weight} onChange={handleInputChange}
                                className="bg-neutral-700 border border-neutral-600 rounded-md p-3 w-24 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button onClick={handleAddSet} className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl font-light hover:bg-blue-700 transition-colors flex-shrink-0">
                                +
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block md:col-span-1 h-full bg-neutral-900 p-4 flex flex-col gap-6 overflow-y-auto w-1/4">
                    
                    {/* Widget 1: Live Summary */}
                    <div className="bg-neutral-800 p-5 rounded-lg flex-shrink-0 p-4 m-4">
                        <h4 className="text-lg font-semibold text-blue-500 mb-4 p-4">Your Workout</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Total Volume</span>
                                <span className="font-semibold">{workoutSummary.totalVolume.toLocaleString()} lbs</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Total Sets</span>
                                <span className="font-semibold">{workoutSummary.totalSets}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-400">Total Reps</span>
                                <span className="font-semibold">{workoutSummary.totalReps}</span>
                            </div>
                        </div>
                    </div>

                    {/* Widget 2: Exercise context */}
                    <div className="bg-neutral-800 p-5 rounded-lg p-4 m-4">
                        <h4 className="text-lg font-semibold text-blue-500 mb-4">
                            {selectedExercise ? selectedExercise.name : "Exercise Info"}
                        </h4>
                        {selectedExercise ? (
                            <div className="space-y-3 text-sm">
                                <p className="text-neutral-300">History</p>
                                <div className="border-t border-neutral-700 pt-3">
                                    <p className="font-bold">Last time:</p>
                                    <p className="text-neutral-400">{exerciseData.date_of_pr || "No record."}</p>
                                </div>
                                <div className="border-t border-neutral-700 pt-3">
                                    <p className="font-bold">Personal Record:</p>
                                    <p className="text-neutral-400">{exerciseData.personal_record || 0}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-neutral-500">History and Stats: </p>
                        )}
                    </div>

                    {/* Widget 3: in house ML recommendation */ }
                    {/* Widget 4: ai insights from 4o mini */ }
                </div>
            </div>
        </div>
        
    );
    
};
export default New_workout;


