import { useRouteError,
	useNavigate,
	useLocation,
	Link
} from 'react-router-dom';



function Error() {
	const error = useRouteError();
	const navigate= useNavigate();
	const location = useLocation();

	return (  
		<div class="flex items-center justify-center min-h-screen bg-gray-100">
			<div class="text-center max-w-lg mx-auto py-12">
				<h1 class="text-6xl font-bold text-gray-800 mb-4">Oops! Something broke...</h1>
				<p class="text-xl text-red-600 mb-8">{error?.message || "An error occurred while loading data."}</p>

				<button className='refresh-button'
					onClick={() => navigate(location.pathname, {replace: true})}
				>Try Refreshing...</button>

				<div>Or <Link to={'/'}>Go home</Link></div>
			</div>
		</div>
	);
}

export default Error;