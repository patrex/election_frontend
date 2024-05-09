import { Route, createBrowserRouter,RouterProvider, createRoutesFromElements } from 'react-router-dom';
import './App.css'

import Home, { homeLoader } from './pages/Home'
import Login from './pages/Login';
import Dashboard, { dashboardLoader } from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import SignUp from './pages/SignUp'
import AddCandidate from './pages/AddCandidate';
import Election, { electionLoader } from './pages/Election';
import Layout from './components/Layout';
import UserLayout from './components/UserLayout'
import ElectionDetail, {electionDetailLoader} from './pages/ElectionDetail';
import PositionDetails, { loader } from './pages/PositionDetails';
import ElectionResults, { resultsLoader } from './pages/ElectionResults';

const router = createBrowserRouter(createRoutesFromElements(
	<Route element={<Layout/>}>
		<Route path='/' element={<Home />} loader={ homeLoader }/>
		<Route path='/login' element={<Login />} />
		<Route path='/signup' element={<SignUp />} />

		<Route path='/election/:id/results' element={<ElectionResults />} loader={ resultsLoader } />
		<Route path='/election/:id/:voterId' element={<Election/>} loader={ electionLoader }/>

		<Route path='user/:userId' element={<UserLayout />}>
			<Route index element={<Dashboard />} loader={ dashboardLoader }/>
			<Route path='create-election' element={<CreateElection />} />
			<Route path='election/:id' element={<ElectionDetail />} loader={ electionDetailLoader } />
			<Route path='election/:id/addcandidate' element={<AddCandidate />} />
			<Route path='election/:id/position/:position' element={<PositionDetails />} loader={ loader } />
		</Route>
	</Route>
))


function App() {
	return (
		<RouterProvider router={router} />
	);
}

export default App;
