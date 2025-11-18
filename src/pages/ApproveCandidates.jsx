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
        const [positions, candidates] = await Promise.all([
            fetcher.get(`election/${params.id}/positions`),
            fetcher.get(`election/${params.id}/candidates/addedself`)
        ])

        return { positions, candidates }
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
            {positions.length > 0 ? (
                positions.map(p => (
                    <div key={p._id}>
                        <h3>{p.position}</h3>
                        <hr />
                        {candidates.length > 0 ? candidates.filter((candidate) => (
                            <>
                                <div class="grid grid-cols-4 gap-4 py-2 px-4 mb-1 
                                            text-xs md:text-sm uppercase font-semibold 
                                            bg-gray-100 dark:bg-gray-700 
                                            text-gray-600 dark:text-gray-300 
                                            border-b border-gray-300 dark:border-gray-600">

                                    <div class="col-span-1"><input type="checkbox" name={p._id} id={p._id} /></div>

                                    <div class="col-span-2"></div>

                                    <div class="col-span-1 text-right">Approve</div>

                                </div>
                                <ul>
                                    <li 
                                        key = {candidate._id}>
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
                            </>
                        )) : (
                            <p>No candidates for this position</p>
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