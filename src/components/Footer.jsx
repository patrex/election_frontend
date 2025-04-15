import { Box, Typography } from '@mui/material';

function Footer() {
	return (
		<Box
			component="footer"
			sx={{
				backgroundColor: '#f5f5f5',
				py: 2,
				textAlign: 'center',
				mt: 'auto',
			}}
		>
			<Typography variant="body2" color="text.secondary">
				&copy; {new Date().getFullYear()} made with ❤️ by silabs
			</Typography>
		</Box>
	);
}

export default Footer;