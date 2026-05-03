import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import CandidatesSelfAdd from "@/components/CandidatesSelfAdd";
import CollectEmailModal from "@/components/CollectEmailModal";
import PhoneInput from "@/components/CollectPhoneNumber";

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
    
    const { title, startDate, endDate,
        type, desc, rules,
        userAuthType, addCandidatesBy,
        _id,
    } = state.election;

    const [showSelfAdd, setShowSelfAdd] = useState(false)
    const [showEmailModal, setShowEmailModal] = useState(false)

    const { isActive, isPending, hasEnded } = getEventStatus(startDate, endDate)
    const _0 = isPending && addCandidatesBy === 'Candidates Will Add Themselves';

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

        {/* Actions for users */}
        <div>
            { isPending &&  
                <button className="Button violet hover:bg-indigo-700" 
                onClick={userAuthType == 'phone' ? <PhoneInput /> : <CollectEmailModal 
                    isOpen={showEmailModal} 
                    onClose={setShowEmailModal(false)}
                    onSubmit={} />}>Register to Vote
                </button> 
            }

            { _0 && 
                <button className="Button violet hover:bg-indigo-700" 
                onClick={<CandidatesSelfAdd election={state.election} onClose={setShowSelfAdd(false)}/>}>Become a Candidate</button> 
            }
        </div>								
        

    </div>
}

export default ElectionInfo;