import { useLoaderData } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { fireman } from "../utils/fireloader";
import Toast from "@/utils/ToastMsg";
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import avatar from '@/assets/avatar.svg'

import { AppContext } from "@/App";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PulseLoader } from "react-spinners";

import backendUrl from "../utils/backendurl";

export async function updateloader({ params }) {
	let position = undefined;
	let positionsList = undefined;
	let candidate = undefined;
	let election = undefined;

	try {
		const c = await fetch(`${backendUrl}/election/candidate/${params.candidateId}`);
		candidate = await c.json();

		const pos_res = await fetch(`${backendUrl}/election/${candidate.electionId}/positions`);
		positionsList = await pos_res.json();

		const e = await fetch(`${backendUrl}/election/${candidate.electionId}`);
		election = await e.json();

		const pos_name_res = await fetch(`${backendUrl}/election/positions/${candidate.position}`);
		position = await pos_name_res.json();
	} catch (error) { }

	return [candidate, position, positionsList, election];
}

function UpdateCandidate() {
	const [candidate, position, positionsList, election] = useLoaderData();
	const [loading, setLoading] = useState(false);

	const [state, setState] = useState({
		image: candidate.imgUrl || avatar,
		newPicture: null,
		newFile: "",
		positions: positionsList || [],
	});

	const schema = z.object({
		firstname: z.string().min(2, { message: "Firstname cannot be less than two characters" }),
		lastname: z.string().min(2, { message: "Lastname cannot be less than two characters" }),
		selectedPosition: z.string(),
		manifesto: z.string().min(0),
	});

	const { user } = useContext(AppContext);

	const {
		register,
		handleSubmit,
		formState: { errors, isDirty },
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: useMemo(
			() => ({
				firstname: candidate.firstname || "",
				lastname: candidate.lastname || "",
				manifesto: candidate.manifesto || "",
				selectedPosition: position.position || "",
			}),
			[candidate, position]
		),
	});

	useEffect(() => {
		setState((prev) => ({
			...prev,
			image: candidate.imgUrl || avatar,
		}));
	}, [candidate]);

	const handleFileUpload = useCallback((e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				setState((prev) => ({
					...prev,
					image: event.target.result,
					newPicture: file,
					newFile: file.name,
				}));
			};
			reader.readAsDataURL(file);
		}
	}, []);

	const patchCandidate = async function (formdata, photoUrl) {
		try {
			const response = await fetch(`${backendUrl}/election/updatecandidate`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${await user?.getIdToken()}`,
				},
				body: JSON.stringify({
					electionId: election._id,
					candidate_id: candidate._id,
					...formdata,
					photoUrl,
				}),
			});

			if (!response.ok) throw new Error("Failed to update candidate");

			Toast.success("Candidate updated successfully!");
		} catch (error) {
			Toast.error("Update failed");
		} finally {
			setLoading(false);
		}
	};

	const onSubmit = async (formdata) => {
		setLoading(true);

		if (!isDirty && !state.newPicture) {
			Toast.info("You did not make any changes");
			setLoading(false);
			return;
		}

		try {
			let photoUrl = state.image; // Default to existing image

			if (state.newPicture) {
				const imgRef = ref(
					fireman,
					`vote4me/${election.title}/${formdata.selectedPosition}/${formdata.firstname.concat(
						formdata.lastname
					)}`
				);
				const snapshot = await uploadBytes(imgRef, state.newPicture);
				photoUrl = await getDownloadURL(snapshot.ref);
			}

			await patchCandidate(formdata, photoUrl);
		} catch (err) {
			Toast.error("An error occurred while uploading candidate picture.");
		}
	};

	return (
		<div className="container">
			<div className="candidate-update-form-container">
				{/* top */}
				<div className="update-candidate-top">
					{candidate.imgUrl ? (
						<div className="image-wrapper">
							<img 	
								src={state.image} 
								alt="Candidate" 
								className="candidate-image" 
							/>

							<div className="image-actions">
								{/* Change image (upload) */}
								<label className="icon-btn" title="Change picture">
									<span><i class="bi bi-arrow-left-right"></i></span>
									<input type="file" accept="image/*" id="imageUpload" 
									onChange={handleFileUpload} style={{display: 'none'}} />
								</label>

								{/* Remove image */}
								<AlertDialog.Root>
									<AlertDialog.Trigger asChild>
										<button
											type="button"
											className="icon-btn"
											title="Remove picture"
										>
										<span><i class="bi bi-trash-fill" style={{color: 'red'}}></i></span>
										</button>
									</AlertDialog.Trigger>
									<AlertDialog.Portal>
									<AlertDialog.Overlay className="AlertDialogOverlay" />
									<AlertDialog.Content className="AlertDialogContent">
										<AlertDialog.Title className="AlertDialogTitle">Delete Picture</AlertDialog.Title>
										<AlertDialog.Description className="AlertDialogDescription">
											{`Remove this picture for ${candidate.firstname}?`}
										</AlertDialog.Description>
											<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
										<AlertDialog.Cancel asChild>
											<button  className="Button mauve">Cancel</button>
										</AlertDialog.Cancel>
										<AlertDialog.Action asChild>
											<button className="Button red" 
												onClick={() => setState((prev) => ({
													...prev,
													image: "",
													newPicture: avatar,
												}))}>Remove
											</button>
										</AlertDialog.Action>
										</div>
									</AlertDialog.Content>
									</AlertDialog.Portal>
								</AlertDialog.Root>
								
							</div>
						</div>

					) : (
						<div>
							<p>Add picture for {`${candidate.firstname} ${candidate.lastname}`}</p>
						</div>
					) }
				</div>

				{/* middle */}
				<form id="candidate-update-form" onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label htmlFor="firstname" className="form-label">
							Firstname:
						</label>
						<input
							type="text"
							id="firstname"
							aria-describedby="firstname"
							autoFocus
							{...register("firstname")}
						/>
					</div>
					<div>
						<label htmlFor="lastname" className="form-label">
							Lastname:
						</label>
						<input type="text" id="lastname" aria-describedby="lastname" {...register("lastname")} />
					</div>

					<div>
						<label>
							Select position
							<select {...register("selectedPosition")} className="form-select form-select-lg mb-3">
								<option value={position.position}>{position.position}</option>
								{state.positions.length > 0 &&
									state.positions
										.filter((pos) => pos._id !== candidate.position)
										.map((pos) => (
											<option key={pos.position} value={pos.position}>
												{pos.position}
											</option>
										))}
							</select>
						</label>
					</div>

					<div className="mb-3">
						<textarea name="manifesto" className="p-2.5 my-2" {...register("manifesto")} />
					</div>
				</form>

				{/* bottom */}
				<div className="candidate-update-bottom">
					<button
						type="submit"
						form="candidate-update-form"
						className="Button violet"
						disabled={!isDirty && !state.newPicture}
					>
						{loading ? (
							<PulseLoader color="#fff" size={5} loading={loading} />
						) : (
							"Update Candidate"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}

export default UpdateCandidate;
