import { useLoaderData } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState } from "react";
import { fireman } from '../utils/fireloader';
import { toast } from "sonner";

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'


import backendUrl from '../utils/backendurl'

export async function updateloader({ params, request }) {
	const searchParams = new URL(request.url).searchParams;
	const candidateId = searchParams.get("id");
	
	let position = undefined;
	let positions = undefined;
	let candidate = undefined;

	try {
		const c = await fetch(`${backendUrl}/election/candidate/${candidateId}`)
		candidate = await c.json();

		const pos_res = await fetch(`${backendUrl}/election/${candidate.electionId}/positions`)
		positions = await pos_res.json()

		const pos_name_res = await fetch(`${backendUrl}/election/positions/${candidate.position}`)
		position = await pos_name_res.json()

	} catch (error) {
		
	}

	return [candidate, position, positions]
}

function UpdateCandidate() {
	const [candidate, position, positions] = useLoaderData();

	return ( 
		<>
			<p></p>
		</>
	);
}

export default UpdateCandidate;