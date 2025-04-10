import React from 'react';
import {
	Card,
	CardContent,
	Avatar,
	Typography,
	IconButton,
	Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const UserCard = ({ name, position, imageUrl, onEdit, onDelete, election }) => {
	return (
		<Card elevation={3} sx={{ borderRadius: 3, maxWidth: 350, padding: 2 }}>
			<Stack alignItems="center" spacing={2}>
				<Avatar
					alt={name}
					src={imageUrl}
					sx={{ width: 80, height: 80 }}
				/>

				<CardContent sx={{ padding: 0, textAlign: 'center' }}>
					<Typography variant="h6">{name}</Typography>
					<Typography variant="body2" color="text.secondary">
						{position}
					</Typography>
				</CardContent>

				{new Date(election?.endDate) > Date.now() && (
					<Stack direction="row" spacing={1}>
						<IconButton color="primary" onClick={onEdit}>
							<EditIcon />
						</IconButton>
						<IconButton color="error" onClick={onDelete}>
							<DeleteIcon />
						</IconButton>
					</Stack>
				)}
			</Stack>
		</Card>
	);
};

export default UserCard;
