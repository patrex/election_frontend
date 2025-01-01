import { useLoaderData } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useState, useEffect } from "react";
import { fireman } from '../utils/fireloader';
import { toast } from "sonner";

import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'


import backendUrl from '../utils/backendurl'

export async function updateloader({ params }) {
	let position = undefined;
	let positions = undefined;
	let candidate = undefined;
	let election = undefined;

	try {
		const c = await fetch(`${backendUrl}/election/candidate/${params.candidateId}`)
		candidate = await c.json();

		const pos_res = await fetch(`${backendUrl}/election/${candidate.electionId}/positions`)
		positions = await pos_res.json()

		const e = await fetch(`${backendUrl}/election/${candidate.electionId}`)
		election = await e.json();

		const pos_name_res = await fetch(`${backendUrl}/election/positions/${candidate.position}`)
		position = await pos_name_res.json()

	} catch (error) {
		
	}

	return [candidate, position, positions, election]
}

function UpdateCandidate() {
	const [candidate, position, positions, election] = useLoaderData();

	const [image, setImage] = useState("");

	const schema = yup.object().shape({
		firstname: yup.string().min(2).required(),
		lastname: yup.string().min(2).required(),
		selectedPosition: yup.string(),
		manifesto: yup.string(),
		imgUrl: yup.mixed().test('required', 'Choose a picture for the candidate', value => {
			return value && value.length;
		}),
	})

	const { register, handleSubmit, formState } = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			firstname: candidate.firstname,
			lastname: candidate.lastname,
			manifesto: candidate.manifesto,
			selectedPosition: position.position,
			imgUrl: candidate.imgUrl
		}
	});

	const { dirtyFields, isDirty, errors } = formState;

	useEffect(() => {
		setImage(candidate.imgUrl);

	}, [])

	const convert64 = imgUrl => {
		const reader = new FileReader()
		reader.onloadend = () => {
			setImage(reader.result.toString())
		}

		reader.readAsDataURL(imgUrl)
	}

	const onSubmit = async (formdata) => {
		if (formdata.imgUrl.length > 0) {
			convert64(formdata.imgUrl[0]);
		}

		if (isDirty) {
			let photoUrl = ''
			const imgRef =
			 ref(fireman, `vote4me/${election.title}/${formdata.selectedPosition}/${formdata.firstname.concat(formdata.lastname) }`);
	
			uploadBytes(imgRef, image)
				.then(snapshot => getDownloadURL(snapshot.ref))
				.then(imgUrl => {
					photoUrl = imgUrl;
				})
				.then( async (data) => {
					try {
						const response = await fetch(`${backendUrl}/election/updatecandidate`, {
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json',
							      },
							      mode: 'cors',
							      body: JSON.stringify({
								      electionId: election._id,
								      candidate_id: candidate._id,
								      ...formdata,
								      photoUrl
							      }),
						})
			
						if (response.ok) {
							toast.success("Candidate data was updated");
						}
					} catch (error) {
						toast.error("Update failed")
					}
				})
				.catch(err => toast(err))
		} else {
			toast.success("You did not make any changes");
			return 
		}
	}

	return ( 
		<>
			<div className="candidate-update-form">
				Hey
			</div>
		</>
	);
}

export default UpdateCandidate;