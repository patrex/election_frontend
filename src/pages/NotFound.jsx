import { Link } from 'react-router-dom'
function NotFound() {
	return (  
		<div className="van-details-box">
			<h1>Sorry, the page/resource you wanted to see was not found on the site</h1>

			<Link to='/' className=''>Let's take you home</Link>

			<h4>Or you may use one of the links above...</h4>
		</div>
	);
}

export default NotFound;