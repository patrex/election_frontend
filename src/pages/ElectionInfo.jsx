import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';

/**
 * Determines the current status of the election based on date ranges
 */
const getEventStatus = (startDate, endDate) => {
	const now = new Date();
	return {
		isPending: now < startDate,
		hasEnded: now > endDate,
		isActive: now >= startDate && now <= endDate
	};
};

const ElectionInfo = () => {
    const { state } = useLocation();

    const { title, 
        startDate,
        endDate,
        type,
        desc,
        rules,
        userAuthType,
        _id
    } = state.election;

    return <div>
        <h2>We found your election!</h2>

        <h3>{title}</h3>
        <h4>Starting at: <span>{startDate}</span></h4>
        <h4>Ending at: <span>{endDate}</span></h4>
        <h4>This is <span>{type === 'Open'? 'an' : 'a'} {type} election:</span></h4>
        <h4>Description: </h4>
        <p>{desc}</p>
        <h4>Rules:</h4>
        <p>{rules}</p>

    </div>
}

export default ElectionInfo;