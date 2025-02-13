import { Route, createBrowserRouter,RouterProvider, createRoutesFromElements } from 'react-router-dom';
import { createContext, useState, useEffect } from 'react';
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
import NotFound from './pages/NotFound';
import UpdateCandidate, {updateloader} from './pages/UpdateCandidate';
import UpdateElection, {updateElectionLoader} from './pages/UpdateElection';

import Verifier from './pages/Verifier'
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const vDashboard = Verifier(Dashboard);
const vCreateElection = Verifier(CreateElection);
const vAddCandidate = Verifier(AddCandidate);
const vElectionDetail = Verifier(ElectionDetail);
const vPositionDetails = Verifier(PositionDetails);
const vUpdateCandidate = Verifier(UpdateCandidate);
const vUpdateElection = Verifier(UpdateElection);

import ErrorBoundary from './pages/ErrorBoundary';

import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

export const AppContext = createContext();

function App() {
	// const [ user, setUser ] = useState(null);
	const [voter, setVoter] = useState();
	const auth = getAuth();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setUser(user);
			if (!user) {
				navigate('/login');
			}
		});

		return () => unsubscribe();
	}, [auth, navigate]);
	
	return (
		<AppContext.Provider value={ {voter, setVoter} }>
			<RouterProvider router = {
				createBrowserRouter(createRoutesFromElements(
					<Route element={<Layout/>}>
						<Route path='/' element={<Home />} loader={ homeLoader }/>
						<Route path='login' element={<Login />} />
						<Route path='signup' element={<SignUp />} />

						<Route path='/election/:id/results' element={<ElectionResults />} loader={ resultsLoader } />
						<Route path='/election/:id/:voterId' element={<Election />} loader={ electionLoader }/>
						{user && (
							<Route path='user/:userId' element={<UserLayout />}>
								<Route index element={<vDashboard />} loader={ dashboardLoader }/>
								<Route path='create-election' element={<vCreateElection />} />
								<Route path='election/:id' element={<vElectionDetail />} loader={ electionDetailLoader } />
								<Route path='election/:electionId/update' element={<vUpdateElection />} loader={ updateElectionLoader } />
								<Route path='election/:id/addcandidate' element={<vAddCandidate />} />
								<Route path='election/:id/position/:position' element={<vPositionDetails />} loader={ loader } />
								<Route path='election/candidate/:candidateId/update' element={<vUpdateCandidate />} loader={ updateloader } />
							</Route>
							)
						}
					</Route>
				)) 
			}/>
			<ToastContainer />
		</AppContext.Provider>
	);
}

export default App;
