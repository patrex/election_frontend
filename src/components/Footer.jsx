import { Box, Typography } from '@mui/material';

function Footer() {
	return (
		<Box
			component="footer"
			sx={{
				py: 2,
				textAlign: 'center',
				mt: 'auto',
			}}
		>
			<Typography variant="body2" color="text.secondary">
				&copy; {new Date().getFullYear()} made with ❤️ by Lolia Data Systems
			</Typography>
		</Box>
	);
}

export default Footer;