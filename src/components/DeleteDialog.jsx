import React, { useState, useEffect } from 'react';

const DeleteDialog = ({
	isOpen,
	onClose,
	onConfirm,
	title,
	description,
	confirmText,
	variant = "danger" // danger or warning
}) => {
	const [isLoading, setIsLoading] = useState(false);

	// Close on Escape key
	useEffect(() => {
		const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
		window.addEventListener('keydown', handleEsc);
		return () => window.removeEventListener('keydown', handleEsc);
	}, [onClose]);

	if (!isOpen) return null;

	const handleConfirm = async () => {
		setIsLoading(true);
		try {
			// We await the passed function, regardless of if it's sync or async
			await onConfirm();
			onClose();
		} catch (error) {
			console.error("Deletion failed:", error);
			// Optional: Handle error state here (e.g., toast notification)
		} finally {
			setIsLoading(false);
		}
	};

	const buttonColor = variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600';

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
			<div
				className="w-full max-w-md overflow-hidden transition-all transform bg-white rounded-xl shadow-2xl"
				role="dialog"
				aria-modal="true"
			>
				<div className="p-6">
					<h3 className="text-xl font-semibold text-gray-900">{title}</h3>
					<p className="mt-3 text-sm text-gray-500 leading-relaxed">
						{description}
					</p>
				</div>

				<div className="flex justify-end gap-3 px-6 py-4 bg-gray-50">
					<button
						type="button"
						disabled={isLoading}
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={isLoading}
						onClick={handleConfirm}
						className={`flex items-center justify-center min-w-[80px] px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-70 ${buttonColor}`}
					>
						{isLoading ? (
							<svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
								<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
								<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
							</svg>
						) : null}
						{isLoading ? "Processing..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteDialog;