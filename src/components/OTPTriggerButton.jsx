import React from 'react';

// Component to demonstrate reusability by triggering the flow with pre-set data
const TriggerButton = ({ label, destination, onClick, isDanger = false }) => {
    return (
        <button
            onClick={() => onClick(destination)}
            className={`w-full py-3 font-medium rounded-lg transition-all shadow-md 
                ${isDanger 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
            {label} ({destination})
        </button>
    );
};

export default TriggerButton;