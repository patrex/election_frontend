import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';


import PhoneInput from '@/components/CollectPhoneNumber';
import CollectEmailModal from '@/components/CollectEmailModal';

import checkReggedVoter from '@/utils/procVoter';

export async function regVoterLoader({ params }) {
	try {
		// load elections for this user from database
		const election = await axios_api.get(`election/${params.electionid}`)
		return election.data;
	} catch (error) {
		return null;
	}
}

function VoterReg () {
    const election = useLoaderData();

    const [showEmailModal, setShowEmailModal] = useState(false);
	const [showPhoneModal, setShowPhoneModal] = useState(false);

    return <>
        {showEmailModal && (
            <CollectEmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} onSubmit={checkReggedVoter}/>
        )}

        {showPhoneModal && (
            <PhoneInput isOpen={showPhoneModal} onClose={() => setShowPhoneModal(false)} onSubmit={checkReggedVoter}/>
        )}
    </>

    
}

export default VoterReg;