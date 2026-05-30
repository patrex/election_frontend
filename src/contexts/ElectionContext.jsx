import { createContext, useContext, useState, useCallback } from 'react';

// =================================================================
// Context
// =================================================================

const ElectionContext = createContext();

// =================================================================
// Hook
// =================================================================

/**
 * Access the active event from anywhere in the app.
 *
 * @returns {{
 *   event: object | null,
 *   setEvent: (event: object) => void,
 *   clearEvent: () => void
 * }}
 *
 * @example
 * const { event, setEvent, clearEvent } = useEvent();
 */
export const useElection = () => {
	const context = useContext(ElectionContext);
	if (!context) throw new Error('useEvent must be used within an EventProvider');
	return context;
};

// =================================================================
// Provider
// =================================================================

/**
 * Wrap your app (or a subtree) with EventProvider to make the active
 * event available to all child components via useEvent().
 *
 * @example
 * // Set an event
 * const { setEvent } = useEvent();
 * setEvent({ id: '001', name: 'Presidential Election', year: 2027 });
 *
 * // Read it elsewhere
 * const { event } = useEvent();
 * console.log(event?.name);
 *
 * // Clear it (e.g. on logout or navigation away)
 * const { clearEvent } = useEvent();
 * clearEvent();
 */
export const ElectionProvider = ({ children }) => {
	const [election, setElectionData] = useState(null);

	const setElection = useCallback((electionData) => {
		setEventState(electionData);
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