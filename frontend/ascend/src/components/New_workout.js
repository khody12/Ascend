import "./New_workout.css";

import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import { AuthContext } from "../AuthContext";
import { useNavigate } from 'react-router-dom';

function New_workout() {
    const navigate = useNavigate();
    const { authData } = useContext(AuthContext);
    const [workoutSets, setWorkoutSets] = useState([]);
    const [currentSet, setCurrentSet] = useState({reps: "", weight: "", exercise: ""});
    const [exercises, setUserExercises] = useState(null);
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

    const handleSetChange = (e) => {
        const { name, value } = e.target;
        if (name === "exercise") {
            const selectedExercise = exercises.find((ex) => ex.id === parseInt(value));
        } else {
            setCurrentSet({ ...currentSet, [name]: value});
        }
    }

    const handleAddSet = () => {
        setWorkoutSets([...setCurrentSet, currentSet]);
        setCurrentSet({reps: "", weight: "", exercise: ""});
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
        <h1>Hello</h1>
    );
    
};
export default New_workout;