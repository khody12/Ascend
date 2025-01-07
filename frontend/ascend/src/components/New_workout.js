import "./New_workout.css";

import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

function New_workout() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext);
    const [workoutSets, setWorkoutSets] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState("");
    const [currentSet, setCurrentSet] = useState({reps: "", weight: "", exercise: ""});
    const [exercises, setUserExercises] = useState([]);
    const [workoutTitle, setWorkoutTitle] = useState("");

    const [message, setMessage] = useState("");

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
    }, [authData]);

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

        
        console.log("adding set")
        setWorkoutSets([...workoutSets, currentSet]);
        setCurrentSet({reps: "", weight: "", exercise: selectedExercise});
        console.log(workoutSets);
    }




    // this is what we will send as a post at the very end, this creates our workout, and exits us out of the
    //workout interface
    const saveWorkout = async (e) => {
        e.preventDefault(); // prevents browser from reloading a page when we submit an exercise.
        const payload = {
            name: workoutTitle,
            date: new Date().toISOString().split("T")[0],
            workout_sets: workoutSets,
        }; 
        try {
            const response = await axios.post("http://127.0.0.1:8000/user/create-workout/", payload);
            console.log("workout saved:", response.data)
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
            <div id="workout-container">
                <div id="new-workout-container">
                    <h2>Current sets</h2>
                    <ul>
                        {workoutSets.map((set, index) => (
                            <li key={index}>
                                {set.exercise.name} - {set.reps} reps at {set.weight} lbs
                            </li>
                        ))}
                    </ul>
                </div>
                <div id="add-new-workout">
                    <form>
                        
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
                        <button onClick={handleAddSet}>Add set</button>
                    </form>
                </div>
            </div>
        </div>
        
    );
    
};
export default New_workout;