import { Route, createBrowserRouter, RouterProvider, createRoutesFromElements, Navigate, Outlet } from 'react-router-dom';
import { createContext, useEffect, useState, useContext } from 'react';
import './App.css';
import './dashboard_styles.css'
import './no_data.css'

import Home, { homeLoader } from './pages/Home';
import Login from './pages/Login';
import Dashboard, { dashboardLoader } from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import SignUp from './pages/SignUp';
import AddCandidate, { addCandidateLoader } from './pages/AddCandidate';
import Election, { electionLoader } from './pages/Election';
import Layout from './components/Layout';
import UserLayout from './components/UserLayout';
import ElectionDetail, { electionDetailLoader } from './pages/ElectionDetail';
import PositionDetails, { loader } from './pages/PositionDetails';
import ElectionResults, { resultsLoader } from './pages/ElectionResults';
import NotFound from './pages/NotFound';
import UpdateCandidate, { updateloader } from './pages/UpdateCandidate';
import UpdateElection, { updateElectionLoader } from './pages/UpdateElection';
import Error from './pages/Error';
import { onAuthStateChanged } from 'firebase/auth';

import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { authman } from './utils/fireloader';

export const AppContext = createContext();

function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [voter, setVoter] = useState(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(authman, (authUser) => {
			setUser(authUser);
		});
		return () => unsubscribe();
	}, []);

	return (
		<AppContext.Provider value={{ user, setUser, voter, setVoter }}>
			{children}
		</AppContext.Provider>
	);
}

function ProtectedRoute() {
	const { user } = useContext(AppContext);
	return user ? <Outlet /> : <Navigate to="/login" replace />;
}

const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<Layout />}>
			<Route path="/" element={<Home />} loader={homeLoader} />
			<Route path="login" element={<Login />} />
			<Route path="signup" element={<SignUp />} />
			
			<Route path="/election/:id/results" 
				element={<ElectionResults />} 
				loader={resultsLoader}
				errorElement={<Error />}
			/>

			<Route path="/election/:id/:voterId" 
				element={<Election />} 
				loader={electionLoader}
				errorElement={<Error />}
			/>

			{/* Protected User Routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="user/:userId" element={<UserLayout />}>
					<Route index 
						element={<Dashboard />} 
						loader={dashboardLoader}
						errorElement={<Error />}
					/>

					<Route path="create-election" 
						element={<CreateElection />} 
					/>
					<Route path="election/:id" 
						element={<ElectionDetail />} 
						loader={electionDetailLoader}
						errorElement={<Error />}
					/>
					<Route path="election/:electionId/update" 
						element={<UpdateElection />} 
						loader={updateElectionLoader} 
						errorElement={<Error />}
					/>
					<Route path="election/:id/addcandidate"
						loader={addCandidateLoader}
						element={<AddCandidate />} 
						errorElement={<Error />}
					/>
					<Route path="election/:id/position/:position" 
						element={<PositionDetails />} 
						loader={loader} 
						errorElement={<Error />}
					/>
					<Route path="election/candidate/:candidateId/update" 
						element={<UpdateCandidate />} 
						loader={updateloader} 
						errorElement={<Error />}
					/>
				</Route>
			</Route>

			<Route path="*" element={<NotFound />} />
		</Route>
	)
);

function App() {
	return (
		<AuthProvider>
			<RouterProvider router={router} />
			<ToastContainer />
		</AuthProvider>
	);
}

export default App;
