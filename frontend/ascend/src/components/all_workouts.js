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
            <h1> copy that</h1>
        </div>
    )
}
export default Workouts;