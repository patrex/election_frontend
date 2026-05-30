import { createContext, useContext, useState, useCallback } from 'react';

// =================================================================
// Context
// =================================================================

const ElectionContext = createContext();

// =================================================================
// Hook
// =================================================================

export const useElection = () => {
	const context = useContext(ElectionContext);
	if (!context) throw new Error('useElection must be used within an ElectionProvider');
	return context;
};

// =================================================================
// Provider
// =================================================================

export const ElectionProvider = ({ children }) => {
	const [election, setElectionData] = useState(null);

	const setElection = useCallback((electionData) => {
		setElectionData(electionData);
	}, []);

	const clearElection = useCallback(() => {
		setElectionData(null);
	}, []);

	return (
		<ElectionContext.Provider value={{ election, setElection, clearElection }}>
			{children}
		</ElectionContext.Provider>
	);
};