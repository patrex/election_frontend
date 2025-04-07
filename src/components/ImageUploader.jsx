import { useState } from 'react';

const ImageUploader = () => {
	const [preview, setPreview] = useState(null);

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div>
			<div className="mb-3">
				<input
					className='fileupload form-control-file'
					type="file"
					id="uploadpic"
					accept='image/png, image/jpeg'
					onChange={handleFileChange}
					style={{ display: 'none' }}
				/>
				<label htmlFor="uploadpic" className='Button violet'>Choose a picture</label>
			</div>
			{preview && (
				<div className="image-preview">
					<img src={preview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }} />
				</div>
			)}
		</div>
	);
};

export default ImageUploader;
