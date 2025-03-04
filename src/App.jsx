import { Route, createBrowserRouter, RouterProvider, createRoutesFromElements, Navigate, Outlet } from 'react-router-dom';
import { createContext, useEffect, useState, useContext } from 'react';
import './App.css';

import Home, { homeLoader } from './pages/Home';
import Login from './pages/Login';
import Dashboard, { dashboardLoader } from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import SignUp from './pages/SignUp';
import AddCandidate from './pages/AddCandidate';
import Election, { electionLoader } from './pages/Election';
import Layout from './components/Layout';
import UserLayout from './components/UserLayout';
import ElectionDetail, { electionDetailLoader } from './pages/ElectionDetail';
import PositionDetails, { loader } from './pages/PositionDetails';
import ElectionResults, { resultsLoader } from './pages/ElectionResults';
import NotFound from './pages/NotFound';
import UpdateCandidate, { updateloader } from './pages/UpdateCandidate';
import UpdateElection, { updateElectionLoader } from './pages/UpdateElection';
import { onAuthStateChanged } from 'firebase/auth';
import ErrorBoundary from './pages/ErrorBoundary';

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
			
			<Route path="/election/:id/results" element={<ElectionResults />} loader={resultsLoader} />
			<Route path="/election/:id/:voterId" element={<Election />} loader={electionLoader} />

			{/* Protected User Routes */}
			<Route element={<ProtectedRoute />}>
				<Route path="user/:userId" element={<UserLayout />}>
					<Route index element={<Dashboard />} loader={dashboardLoader} />
					<Route path="create-election" element={<CreateElection />} />
					<Route path="election/:id" element={<ElectionDetail />} loader={electionDetailLoader} />
					<Route path="election/:electionId/update" element={<UpdateElection />} loader={updateElectionLoader} />
					<Route path="election/:id/addcandidate" element={<AddCandidate />} />
					<Route path="election/:id/position/:position" element={<PositionDetails />} loader={loader} />
					<Route path="election/candidate/:candidateId/update" element={<UpdateCandidate />} loader={updateloader} />
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
