import { useState, useCallback, useContext, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useLoaderData } from 'react-router-dom';
import { AppContext } from '@/App';
import { fireman } from '../utils/fireloader';
import Toast from '@/utils/ToastMsg';
import { fetcher } from '@/utils/fetcher';
import { PulseLoader } from 'react-spinners';
import NoData from '@/components/NoData';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg'


export async function approveCandidatesLoader({ params }) {
    try {
        const [p, c] = await Promise.all([
            fetcher.get(`election/${params.id}/positions`),
            fetcher.get(`election/${params.id}/candidates/addedself`)
        ])

        return { p, c }
    } catch (error) {
        console.error("There was a problem fetching positions");
    }
}

const ApproveCandidates = () => {
    const {p, c} = useLoaderData();

    const [positions] = useState(p || []);
    const [candidates] = useState(c || []);

    useEffect (() => {console.log(positions, candidates);
    }, [positions])

    return (
        <div className="container">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                Positions and Candidates for Approval
            </h2>
            {positions.length > 0 ? (
                positions.map(p => (
                    <div key={p._id}>
                        <h3 text-xl font-semibold text-indigo-700 mb-2 border-b pb-1>{p.position}</h3>
                        {candidates.length > 0 ? candidates.filter((candidate) => (
                                <ul mt-6 space-y-4>
                                    <li 
                                        key = {candidate._id}
                                        className="flex items-center justify-between 
                                        p-4 bg-gray-50 rounded-md border border-gray-200 
                                        hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                                            <img 
                                                src={candidate.imgUrl} 
                                                alt="Candidate Image"
                                                className="w-full h-full object-cover object-center" 
                                            />
                                        </div>
                                        {`${candidate.firstname} ${candidate.lastname}`} 
                                        {candidate.isApproved ? (
                                            <button disabled="disabled" className="Button violet">Approved</button>
                                        ) : (
                                            <button className="Button mauve">Approve</button>
                                        )}
                                    </li>
                                </ul>
                        )) : (
                            <p>No candidates for this position yet</p>
                        )}
                    </div>
                ))
            ) : (
                <NoData image={noDataGraphic} message='No positions yet for this election'/>
            )}
        </div>
    );
}

export default ApproveCandidates;