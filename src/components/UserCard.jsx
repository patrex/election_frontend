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

const UserCard = ({ name, position, imageUrl, onEdit, onDelete, election }) => {
	const hasEnded = new Date(election?.endDate) > Date.now();
	const isActive = new Date(election?.startDate) > Date.now()

	return (
		<Card
			elevation={3}
			sx={{
				width: 300,
				height: 320,
				borderRadius: 3,
				p: 2,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-between',
				overflow: 'hidden',
				textAlign: 'center'
			}}
		>
			{/* Avatar */}
			<Avatar
				alt={name}
				src={imageUrl}
				sx={{ width: 80, height: 80, mb: 2 }}
			/>

			{/* Name & Position */}
			<CardContent sx={{ p: 0, flexGrow: 1 }}>
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
				{!(hasEnded && isActive) && (
					<Stack direction="row" spacing={1}>
						<IconButton color="primary" onClick={onEdit}>
							<EditIcon />
						</IconButton>
						<IconButton color="error" onClick={onDelete}>
							<DeleteIcon />
						</IconButton>
					</Stack>
				)}
			</Box>
		</Card>
	);
};

export default UserCard;
