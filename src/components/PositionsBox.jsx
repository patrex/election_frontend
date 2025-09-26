import { Link } from "react-router-dom";
function PositionsBox({ list_of_positions, isPending, editPosition, removePosition }) {
	return (<>
		<div className="positions-container w-full">
			<div className="flex justify-between font-semibold border-b pb-2 mb-2">
				<span>Positions</span>
			</div>

			{list_of_positions.length > 0 ? (
				list_of_positions.map((position) => (
					<div
						key={position._id}
						className="flex justify-between items-center border-b py-2 position-row"
					>
						<Link
							to={`./position/${position.position}`}
							className="text-blue-600 hover:underline"
						>
							{position.position}
						</Link>

						{isPending && (
							<div className="action-btn-container flex gap-2">
								<button
									className="Button violet action-item"
									onClick={() => editPosition(position)}
								>
									Edit
								</button>

								<button
									className="Button red action-item"
									onClick={() => removePosition(position)}
								>
									<i className="bi bi-trash3 m-1"></i>
								</button>
							</div>
						)}
					</div>
				))
			) : (
				<div className="text-gray-500 py-4">No positions added yet</div>
			)}
		</div>

	</>);
}

export default PositionsBox;