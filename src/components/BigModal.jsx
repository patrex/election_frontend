import React from "react";

export default function BigModal({
	isOpen,
	title,
	description,
	inputProps,
	children, // for action buttons
	onClose,
	bgColor = "bg-white", // default background
}) {
	if (!isOpen) return null;

	return (
		<div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<div
				className={`w-5/6 md:w-2/5 lg:w-2/5 xl:w-2/5 p-4 rounded-lg shadow-md relative ${bgColor}`}
			>
				{title && <h3 className="text-lg font-semibold">{title}</h3>}
				{description && <p className="mb-2">{description}</p>}

				{inputProps && (
					<input
						{...inputProps}
						className={`w-5/6 p-2 border border-goldenrod rounded-md text-base my-2 ${inputProps.className || ""}`}
					/>
				)}

				<div className="action-btn-container flex gap-2 mt-3">
					{children}
					<button
						className="Button red action-item"
						onClick={onClose}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
