import { Link, useRouteError } from 'react-router-dom';


function Error() {
	return (  
		<div class="flex items-center justify-center min-h-screen bg-gray-100">
			<div class="text-center max-w-lg mx-auto py-12">
				<h1 class="text-6xl font-bold text-gray-800 mb-4">Oops...</h1>
				<p class="text-xl text-gray-600 mb-8">Something broke...</p>

				<Link to='/' className='text-blue-500 hover:underline'>Let's take you home</Link>
			</div>
		</div>
	);
}

export default Error;