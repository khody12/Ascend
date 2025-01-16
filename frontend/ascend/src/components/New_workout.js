import "./New_workout.css";

import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

function New_workout() {
    const navigate = useNavigate();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const { authData } = useContext(AuthContext);
    const [workoutSets, setWorkoutSets] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState("");
    const [currentSet, setCurrentSet] = useState({reps: "", weight: "", exercise: ""});
    const [exercises, setUserExercises] = useState([]);
    const [workoutTitle, setWorkoutTitle] = useState("");
    const [workoutComment, setWorkoutComment] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [message, setMessage] = useState("");


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

    useEffect(() => { // get exercise data from API.
        const fetchExercises = async () => {
            if (authData){
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
                        console.log("response good");
                        const exercises = await response.json(); // api will send back exercises
                        setUserExercises(exercises)
                    }
                } catch (error) {
                    console.error("Error fetching exercises:", error)
                }
            }
        }
        fetchExercises();
    }, [authData]); // this array he is called dependency array and basically react will rerun useEffect fucniton only if one
    // of these dependencies change.

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
        const { name, value } = e.target;
        if (name === "exercise") {
            const selectedExercise = exercises.find((ex) => ex.id === parseInt(value));
            setSelectedExercise(selectedExercise);
            setCurrentSet({ ...currentSet, exercise: selectedExercise });
        } else {
            setCurrentSet({ ...currentSet, [name]: value});
        }
    }

    const handleAddSet = (e) => {
        e.preventDefault();

        if (!selectedExercise || !currentSet.reps || !currentSet.weight) {
            console.log("fill it all out!")
            setMessage("Please fill out all fields before adding a set.");
            return;
        }

        
        console.log("adding set");
        
        setWorkoutSets([...workoutSets, currentSet]);
        setCurrentSet({reps: "", weight: "", exercise: selectedExercise});
        console.log(workoutSets);


    }
    // this code groups our workout sets by their exercise
    const groupedSets = workoutSets.reduce((acc, set) => {
        const { exercise } = set;
        acc[exercise.name] = acc[exercise.name] || [];
        acc[exercise.name].push(set);
        return acc;
    }, {});




    // this is what we will send as a post at the very end, this creates our workout, and exits us out of the
    //workout interface
    const openModal = (e) => {
        e.preventDefault()
        setIsModalOpen(true);
    }
    const saveWorkout = async (e) => {
        e.preventDefault(); // prevents browser from reloading a page when we submit an exercise.
        const payload = {
            name: workoutTitle,
            date: new Date().toISOString().split("T")[0],
            workout_sets: workoutSets,
            elapsed_time: secondsToTimeString(time),
            comment: workoutComment,
        }; 
        console.log(payload);
        try {
            const response = await axios.post("http://127.0.0.1:8000/user/create-workout/", payload,
                {
                    headers: {
                        "Authorization": `Token ${authData.token}`,
                        "Content-Type": "application/json"
                    },
                }
            );
            console.log("workout saved:", response.data)
            navigate("/dashboard")
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setMessage("Invalid username/password");
            } else if (error.response && error.response.status === 400) {
                setMessage("Please fill in both fields.");
            } else {
                setMessage(error.response?.date.error || "An error occurred.");
            }
        }

    }


 
    return (
        <div id="workout-page-container">
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Save Workout</h3>
                        <input
                            type="text"
                            placeholder="Workout Title"
                            value={workoutTitle}
                            onChange={(e) => setWorkoutTitle(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Comments"
                            value={workoutComment}
                            onChange={(e) => setWorkoutComment(e.target.value)}
                        />
                        <div className="modal-buttons">
                            <button onClick={() => setIsModalOpen(false)}><i class="fa-solid fa-xmark"></i></button>
                            <button onClick={saveWorkout}><i class="fa-solid fa-check"></i></button>
                        </div>
                    </div>
                </div>
            )}

            <div className="workout-info-header">
                <div id="end-workout">
                    <button className="end-button"
                    onClick={openModal}>
                        <i class="fa-solid fa-check"></i>
                    </button>
                </div>
                <div id="pause-workout">
                    <button className="pause-button">
                        <i className="fas fa-pause"></i>
                    </button></div>
                <h5>{formatTime(time)}</h5>
            </div>
            
            <div id="workout-container">
                
                <div id="sets-container">
                    
                    {Object.entries(groupedSets).map(([exerciseName, sets], index) => ( //object.entries essentially creates us key value pairs in the form of 
                    // [exercisename, sets], where exerciseName gets the name of the exercise, and sets are the sets corresponding to that exercise.
                        <div key={index} className="exercise-group">
                            <h4>{exerciseName}</h4>
                            
                            {sets.map((set, idx) => (
                                <div className="workout-component" key={idx}>
                                    <div>{idx + 1}.</div> <div>Reps: {set.reps}</div>  <div>{set.weight} lbs</div> 
                                </div>
                            ))}
                            
                        </div>
                    ))}
                </div>
                <div id="add-new-workout">
                    <select name="exercise"
                    id="exercise-dropdown" 
                    value={selectedExercise?.id || ""} 
                    onChange={handleInputChange}>
                        <option value=""> Select an exercise</option>
                        {exercises.map((exercise) =>(
                            <option key={exercise.id} value={exercise.id}>
                                {exercise.name}
                            </option>
                        ))}
                    </select>
                    <input
                    type="number"
                    name="reps"
                    placeholder="reps"
                    value={currentSet.reps}
                    onChange={handleInputChange}/>
                    <input
                    type="number"
                    name="weight"
                    placeholder="Weight"
                    value={currentSet.weight}
                    onChange={handleInputChange}/>
                    <button onClick={handleAddSet}>+</button>
                </div>

            </div>
        </div>
        
    );
    
};
export default New_workout;


{/*             <div id="sets-container">
                    <h2>Current sets</h2>
                    <div id="set-list">
                        {workoutSets.map((set, index) => (
                            <div id="set" key={index}>
                                {set.exercise.name} - {set.reps} reps at {set.weight} lbs
                            </div>
                        ))}
                    </div>
                </div> */}