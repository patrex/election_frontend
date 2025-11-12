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
	const [candidate, positions, position, election] = useLoaderData();
	const { user } = useContext(AppContext);

	// Separated state variables
	const [loading, setLoading] = useState(false);
	const [image, setImage] = useState(candidate.imgUrl || null);
	const [newPicture, setNewPicture] = useState(null);
	const [newFileName, setNewFileName] = useState("");
	const [availablePositions] = useState(positions || []);

	const schema = z.object({
		firstname: z.string().min(2, { message: "Firstname cannot be less than two characters" }),
		lastname: z.string().min(2, { message: "Lastname cannot be less than two characters" }),
		selectedPosition: z.string(),
		manifesto: z.string().min(0),
	});

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
			setImage(event.target.result);
			setNewPicture(file);
			setNewFileName(file.name);
		};
		reader.readAsDataURL(file);
	}, []);

	// Helper function to extract path from Firebase URL
	const getPathFromUrl = useCallback((url) => {
		const startIndex = url.indexOf('/o/') + 3;
		const endIndex = url.indexOf('?');
		const path = url.substring(startIndex, endIndex);
		return decodeURIComponent(path);
	}, []);

	// Helper function to delete old image
	const deleteOldImage = async (imageUrl) => {
		try {
			const imgPath = getPathFromUrl(imageUrl);
			const delRef = ref(fireman, imgPath);
			await deleteObject(delRef);
			return { success: true };
		} catch (error) {
			switch (error.code) {
				case 'storage/unauthorized':
					Toast.error("Permission denied. Check your user permissions.");
					break;
				case 'storage/unauthenticated':
					Toast.error("You must be logged in to change the photo.");
					break;
				case 'storage/object-not-found':
					// Soft error - file already doesn't exist
					console.warn("Attempted to delete a non-existent file.");
					return { success: true, message: 'File already deleted' };
				case 'storage/canceled':
					Toast.error("The photo deletion was canceled.");
					break;
				default:
					Toast.error("An error occurred while deleting the old photo.");
					break;
			}
			return { success: false, error };
		}
	};

	// Helper function to upload new image
	const uploadNewImage = async (formdata) => {
		const imgRef = ref(
			fireman,
			`votify/${election.title}/${formdata.selectedPosition}/${formdata.firstname.concat(formdata.lastname)}`
		);

		const snapshot = await uploadBytes(imgRef, newPicture);
		const photoUrl = await getDownloadURL(snapshot.ref);
		
		return { photoUrl, snapshot };
	};

	// Helper function to update candidate in database
	const patchCandidate = async (formdata, photoUrl) => {
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
			return { success: true };
		} catch (error) {
			Toast.error("Failed to update candidate");
			return { success: false, error };
		}
	};

	// Rollback function to delete newly uploaded image on failure
	const rollbackUpload = async (snapshotRef) => {
		try {
			const cleanUpRef = ref(fireman, snapshotRef.fullPath);
			await deleteObject(cleanUpRef);
			console.log("Successfully rolled back changes");
		} catch (error) {
			console.error("Critical failure during rollback", error);
		}
	};

	const onSubmit = async (formdata) => {
		setLoading(true);

		// Check if any changes were made
		if (!isDirty && !newPicture) {
			Toast.info("You did not make any changes");
			setLoading(false);
			return;
		}

		let uploadedSnapshot = null;

		try {
			// Step 1: Delete old image if it exists
			if (candidate.imgUrl) {
				const deleteResult = await deleteOldImage(candidate.imgUrl);
				if (!deleteResult.success && deleteResult.error?.code !== 'storage/object-not-found') {
					// Only throw if it's not a "file not found" error
					throw deleteResult.error;
				}
			}

			// Step 2: Upload new image if provided
			let photoUrl = candidate.imgUrl; // Keep old URL if no new picture
			if (newPicture) {
				const uploadResult = await uploadNewImage(formdata);
				photoUrl = uploadResult.photoUrl;
				uploadedSnapshot = uploadResult.snapshot;
			}

			// Step 3: Update candidate in database
			const patchResult = await patchCandidate(formdata, photoUrl);
			
			if (!patchResult.success) {
				throw new Error("Failed to update candidate in database");
			}

		} catch (err) {
			console.error("Critical failure during candidate update", err);
			Toast.error("Failed to update candidate. Changes rolled back.");
			
			// Rollback: Delete newly uploaded image if it exists
			if (uploadedSnapshot) {
				await rollbackUpload(uploadedSnapshot.ref);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container">
			<div className="candidate-update-form-container">
				{/* Profile Image Section */}
				<div className="update-candidate-top">
					<div className="image-wrapper">
						{/* Image or Avatar Display */}
						{image ? (
							<img
								src={image}
								loading="lazy"
								alt={`${candidate.firstname} ${candidate.lastname}`}
								className="candidate-image"
							/>
						) : (
							<div
								className="avatar-placeholder"
								aria-label={`${candidate.firstname} ${candidate.lastname} avatar`}
							>
								{candidate.firstname.charAt(0).toUpperCase()}
								{candidate.lastname.charAt(0).toUpperCase()}
							</div>
						)}

						{/* Image Upload Button */}
						<div className="image-actions">
							<label
								htmlFor="imageUpload"
								className="icon-btn"
								title="Change picture"
								aria-label="Change profile picture"
							>
								<AddPhotoAlternateIcon />
								<input
									type="file"
									accept="image/*"
									id="imageUpload"
									onChange={handleFileUpload}
									className="visually-hidden"
									aria-label="Upload new profile picture"
								/>
							</label>
						</div>
					</div>
				</div>

				{/* Candidate Update Form */}
				<form
					id="candidate-update-form"
					onSubmit={handleSubmit(onSubmit)}
					aria-label="Update candidate information"
				>
					{/* Firstname Field */}
					<div className="form-group">
						<label htmlFor="firstname" className="form-label">
							Firstname:
						</label>
						<input
							type="text"
							id="firstname"
							className="form-input"
							aria-describedby={errors.firstname ? "firstname-error" : undefined}
							aria-invalid={errors.firstname ? "true" : "false"}
							autoFocus
							{...register("firstname")}
						/>
						{errors.firstname && (
							<span id="firstname-error" className="error-message" role="alert">
								{errors.firstname.message}
							</span>
						)}
					</div>

					{/* Lastname Field */}
					<div className="form-group">
						<label htmlFor="lastname" className="form-label">
							Lastname:
						</label>
						<input
							type="text"
							id="lastname"
							className="form-input"
							aria-describedby={errors.lastname ? "lastname-error" : undefined}
							aria-invalid={errors.lastname ? "true" : "false"}
							{...register("lastname")}
						/>
						{errors.lastname && (
							<span id="lastname-error" className="error-message" role="alert">
								{errors.lastname.message}
							</span>
						)}
					</div>

					{/* Position Select Field */}
					<div className="form-group">
						<label htmlFor="selectedPosition" className="form-label">
							Select Position
						</label>
						<select
							id="selectedPosition"
							className="form-select form-select-lg"
							aria-describedby={errors.selectedPosition ? "position-error" : undefined}
							aria-invalid={errors.selectedPosition ? "true" : "false"}
							{...register("selectedPosition")}
						>
							<option value={position.position}>
								{position.position}
							</option>
							{availablePositions
								.filter((pos) => pos._id !== candidate.position)
								.map((pos) => (
									<option key={pos._id} value={pos.position}>
										{pos.position}
									</option>
								))
							}
						</select>
						{errors.selectedPosition && (
							<span id="position-error" className="error-message" role="alert">
								{errors.selectedPosition.message}
							</span>
						)}
					</div>

					{/* Manifesto Textarea */}
					<div className="form-group">
						<label htmlFor="manifesto" className="form-label">
							Manifesto
						</label>
						<textarea
							id="manifesto"
							name="manifesto"
							rows="6"
							placeholder="Enter candidate manifesto..."
							aria-describedby={errors.manifesto ? "manifesto-error" : undefined}
							aria-invalid={errors.manifesto ? "true" : "false"}
							{...register("manifesto")}
						/>
						{errors.manifesto && (
							<span id="manifesto-error" className="error-message" role="alert">
								{errors.manifesto.message}
							</span>
						)}
					</div>
				</form>

				{/* Form Actions */}
				<div className="candidate-update-bottom">
					<button
						type="submit"
						form="candidate-update-form"
						className="Button violet"
						disabled={loading || (!isDirty && !newPicture)}
						aria-busy={loading}
					>
						{loading ? (
							<>
								<span className="visually-hidden">Updating candidate...</span>
								<PulseLoader color="#fff" size={5} loading={loading} />
							</>
						) : (
							"Update Candidate"
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default UpdateCandidate;
