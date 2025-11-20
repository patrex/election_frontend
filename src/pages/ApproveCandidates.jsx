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

    return (
        <div
            className="
            max-w-4xl mx-auto space-y-8 p-4 
            // Overriding old styles: Removed 'flex', 'justify-center', 'align-items', etc.
            // to enforce a standard block (stacked) layout.
            "
        >
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">
                Candidates for Approval
            </h2>

            {positions.length > 0 ? (
                positions.map(p => (
                    <div
                        key={p._id}
                        className="PositionCard p-6 border border-gray-200 rounded-xl shadow-lg bg-white" // Position Card Styling
                    >
                        {/* Position Title Styling */}
                        <h3 className="text-xl font-semibold text-indigo-700 mb-2 border-b pb-1">
                            {p.position}
                        </h3>

                        {candidates.length > 0 ? (
                            <ul className="mt-6 space-y-4"> {/* Candidates List Container Styling */}
                                {candidates
                                    .filter(candidate => candidate.positionId === p._id) // Assuming you filter candidates by positionId
                                    .map((candidate) => (
                                        <li
                                            key={candidate._id}
                                            // Professional List Item Styling
                                            className="flex items-center justify-between 
                                                        p-4 bg-gray-50 rounded-md border border-gray-200 
                                                        hover:bg-gray-100 transition-colors"
                                        >
                                            {/* Left side: Avatar and Name */}
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                                                    <img
                                                        src={candidate.imgUrl}
                                                        alt="Candidate Image"
                                                        className="w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                                <span className="CandidateName text-lg font-medium text-gray-800">
                                                    {`${candidate.firstname} ${candidate.lastname}`}
                                                </span>
                                            </div>

                                            {/* Right side: Action Buttons/Status */}
                                            <div className="ActionsOrStatus flex space-x-3 ml-4">
                                                {candidate.isApproved ? (
                                                    <button disabled="disabled" className="Button violet opacity-70 px-3 py-1 text-sm rounded">Approved</button>
                                                ) : (
                                                    <button className="Button mauve bg-indigo-600 text-white hover:bg-indigo-700 px-3 py-1 text-sm rounded">Approve</button>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                }
                            </ul>
                        ) : (
                            <p className="mt-4 text-gray-500 italic">No candidates have applied for this position yet.</p>
                        )}
                    </div>
                ))
            ) : (
                <NoData image={noDataGraphic} message='No positions yet for this election' />
            )}
        </div>
    );
}

export default ApproveCandidates;