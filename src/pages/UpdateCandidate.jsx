import { useLoaderData } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useState, useEffect, useCallback, useMemo, useContext } from "react";
import { fireman } from "../utils/fireloader";
import Toast from "@/utils/ToastMsg";
import { fetcher, FetchError } from "@/utils/fetcher";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

import { AppContext } from "@/App";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PulseLoader } from "react-spinners";

export async function updateloader({ params }) {
	try {
		const candidate = await fetcher.get(`election/candidate/${params.candidateId}`);
		const [positions, position, election] = await Promise.all([
			fetcher.get(`election/${candidate.electionId}/positions`),
			fetcher.get(`election/positions/${candidate.position}`),
			fetcher.get(`election/${candidate.electionId}`)
		]);
		return [ candidate, positions, position, election ]
	} catch (error) { 
		console.error("Could not finish loading resources");
	}
}

function UpdateCandidate() {
	const [ candidate, positions, position, election ] = useLoaderData();
	const [loading, setLoading] = useState(false);

	const [state, setState] = useState({
		image: candidate.imgUrl || null,
		newPicture: null,
		newFile: "",
		positions: positions || []
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


	// useEffect(() => {
	// 	setState((prev) => ({
	// 		...prev,
	// 		image: candidate.imgUrl || null,
	// 	}));
	// }, [candidate]);

	const handleFileUpload = useCallback((e) => {
		const file = e.target.files[0];
		if (!file) return;
		
		if (!file.type.startsWith('image/')) {
			Toast.warning("Please upload an image file");
			return;
		}

		if (file.size > (3 * 1024 * 1024)) {
			Toast.warning("Image size must be less than 3MB");
			return;
		}

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
		
	}, []);

	async function patchCandidate (formdata, photoUrl) {
		try {
			await fetcher.auth.patch(
				`election/updatecandidate`,
				{
					electionId: election._id,
					candidate_id: candidate._id,
					...formdata,
					photoUrl,
				},
				user
			);
			Toast.success("Candidate updated successfully!");
		} catch (error) {
			Toast.error("Failed to update candidate");
		} finally {
			setLoading(false);
		}
	};

	async function onSubmit (formdata)  {
		setLoading(true);

		if (!isDirty && !state.newPicture) {
			Toast.info("You did not make any changes");
			setLoading(false);
			return;
		}

		try {
			let photoUrl = state.image; // Default to existing image

			const startIndex = photoUrl.indexOf('/o/') + 3;
			const endIndex = photoUrl.indexOf('?');
			const path = photoUrl.substring(startIndex, endIndex)
			const imgPath = decodeURIComponent(path)

			const delRef = ref(fireman, imgPath)

			await deleteObject(delRef)	// delete previous photo

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
			console.error("Error: ", err.code, err.message);
			Toast.error("An error occurred while uploading candidate picture.");
		}
	};

	return (
		<div className="container">
			<div className="candidate-update-form-container">
				{/* top */}
				<div className="update-candidate-top">
						<div className="image-wrapper">
							{state.image ? (
								<img 	
									src={ state.image }
									loading="lazy"
									alt="Candidate" 
									className="candidate-image"
								/>

								) : (
									<div className="avatar-placeholder">
										{`${candidate.firstname.charAt(0).toUpperCase()}${candidate.lastname.charAt(0).toUpperCase()}`}
									</div>
								)
							}

							<div className="image-actions">
								{/* Change image (upload) */}
								<label className="icon-btn" title="Change picture">
									<span><AddPhotoAlternateIcon /></span>
									<input type="file" accept="image/*" id="imageUpload" 
									onChange={handleFileUpload} style={{display: 'none'}} />
								</label>
							</div>
						</div>
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
								{state.positions.length > 0 && (
									state.positions
										.filter((pos) => pos._id !== candidate.position)
										.map((pos) => (
											<option key={pos._id} value={pos.position}>
												{pos.position}
											</option>
										)))
								}
										
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
