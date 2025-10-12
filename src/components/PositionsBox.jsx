import { Link } from "react-router-dom";
import * as AlertDialog from '@radix-ui/react-alert-dialog';

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
								
								<AlertDialog.Root>
									<AlertDialog.Trigger asChild>
										<button
											className="Button red action-item"
										>
										<i className="bi bi-trash3 m-1"></i>
										</button>
									</AlertDialog.Trigger>
									<AlertDialog.Portal>
									<AlertDialog.Overlay className="AlertDialogOverlay" />
									<AlertDialog.Content className="AlertDialogContent">
										<AlertDialog.Title className="AlertDialogTitle">Delete Picture</AlertDialog.Title>
										<AlertDialog.Description className="AlertDialogDescription">
											{`Remove the position: ${position}?`}
											<p><span><i>This will also remove every candidate under this position</i></span></p>
										</AlertDialog.Description>
											<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
										<AlertDialog.Cancel asChild>
											<button  className="Button mauve">Cancel</button>
										</AlertDialog.Cancel>
										<AlertDialog.Action asChild>
											<button className="Button red" 
												onClick={() => removePosition(position)}>Remove
											</button>
										</AlertDialog.Action>
										</div>
									</AlertDialog.Content>
									</AlertDialog.Portal>
								</AlertDialog.Root>
								
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