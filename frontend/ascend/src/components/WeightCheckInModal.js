import React, { useState } from 'react'; // Removed useContext
import axios from 'axios';

/**
 * A modal for users to submit a new weight entry.
 * * @param {function} onClose - Function to call to close the modal.
 * @param {object} authData - The user's authentication data (token, etc.).
**/

function WeightCheckInModal({ onClose, authData}) { // these params onclose authdata are passed
    const [weight, setWeight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    //Handles the form submission to save a new weight entry.
     
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        if (!weight || isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
            setError('Please enter a valid weight.');
            return;
        }
        if (!authData?.token) {
            setError("Authentication error. Please log in again.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await axios.post(
                'http://127.0.0.1:8000/api/user/submitWeightData/',
                { weight: parseFloat(weight)},
                {
                    headers: {
                        'Authorization': `Token ${authData.token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            
            // If there's a function to call after saving (like to refresh data), call it
            
            onClose(); // Close the modal on success, defined within dashboard.js

        } catch (err) {
            setError('Failed to save weight. Please try again.');
            console.error('Error saving weight entry:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Main modal container: fixed position, dark overlay with blur
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose} // Close modal if overlay is clicked
        >
            {/* Modal content: card styling, prevents clicks from closing the modal */}
            <div 
                className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 w-full max-w-sm flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()} // Stop click propagation
            >
                <h3 className="text-xl font-semibold text-center text-white">Weekly Weigh-In</h3>
                <p className="text-neutral-400 text-sm text-center">
                    Logging your weight helps track your progress accurately.
                </p>

                {/* Form for submitting the weight */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="Current Weight (lbs)"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-neutral-700 border border-neutral-600 rounded-md p-3 text-white text-center text-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        required
                        autoFocus // Automatically focus the input when the modal opens
                    />

                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                    
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-500 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Weight'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WeightCheckInModal;