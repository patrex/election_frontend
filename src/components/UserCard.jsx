import React from 'react';
import {
	Card,
	CardContent,
	Avatar,
	Typography,
	IconButton,
	Stack,
	Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

import { useEventStatus } from '@/hooks/useEventStatus';

const UserCard = ({ name, position, imageUrl, onEdit, onDelete, election }) => {
	const { isPending } = useEventStatus(
		new Date(election.startDate),
		new Date(election.endDate)
	);

	return (
		<Card
			elevation={3}
			sx={{
				width: 280,
				minHeight: 220,
				borderRadius: 3,
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				overflow: 'hidden',
				textAlign: 'center'
			}}
		>
			{/* Avatar */}
			<Avatar
				alt={name}
				src={imageUrl}
				sx={{ width: 64, height: 64, mb: 1.5 }}
			/>

			{/* Name & Position */}
			<CardContent sx={{ p: 0, width: '100%' }}>
				<Typography
					variant="h6"
					sx={{
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden'
					}}
				>
					{name}
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						display: '-webkit-box',
						WebkitLineClamp: 1,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden'
					}}
				>
					{position}
				</Typography>
			</CardContent>

			{/* Action Buttons */}
			<Box sx={{ minHeight: 48, mt: 2 }}>
				{isPending && (
					<Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
						<IconButton color="primary" onClick={onEdit}>
							<EditIcon />
						</IconButton>
						<AlertDialog.Root>
							<AlertDialog.Trigger asChild>
								<IconButton color="error">
									<DeleteIcon />
								</IconButton>
							</AlertDialog.Trigger>
							<AlertDialog.Portal>
								<AlertDialog.Overlay className="AlertDialogOverlay" />
								<AlertDialog.Content className="AlertDialogContent">
									<AlertDialog.Title className="AlertDialogTitle">Remove Candidate</AlertDialog.Title>
									<AlertDialog.Description className="AlertDialogDescription">
										{`Remove: ${name} ?`}
									</AlertDialog.Description>
									<div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
										<AlertDialog.Cancel asChild>
											<button className="Button mauve">Cancel</button>
										</AlertDialog.Cancel>
										<AlertDialog.Action asChild>
											<button className="Button red" onClick={onDelete}>Yes, remove</button>
										</AlertDialog.Action>
									</div>
								</AlertDialog.Content>
							</AlertDialog.Portal>
						</AlertDialog.Root>
					</Stack>
				)}
			</Box>
		</Card>
	);
};

export default UserCard;
