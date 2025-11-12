/**
 * NoData Component - Displays when no data is available
 * @param {Object} props
 * @param {string} props.image - URL or path to the image
 * @param {string} props.message - Message to display under the image
 */
function NoData({ image, message }) {
	return (
		<div className="no-data-container">
			<div className="no-data-content">
				{image && (
					<img
						src={ image }
						alt="No data"
						className="no-data-image"
					/>
				)}
				{message && (
					<p className="no-data-message">{message}</p>
				)}
			</div>
		</div>
	);
}

export default NoData;