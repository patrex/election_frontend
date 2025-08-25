import { useEffect, useState } from "react";

export function useEventStatus(startDate, endDate) {
	const [now, setNow] = useState(() => new Date());

	useEffect(() => {
		const tick = () => setNow(new Date());
		console.log(startDate, endDate);

		// fire immediately, then every 100ms
		tick();
		const intervalId = setInterval(tick, 100);

		return () => clearInterval(intervalId); // cleanup
	}, []);

	const hasStarted = now >= startDate;
	const hasEnded = now > endDate;
	const isActive = hasStarted && !hasEnded;
	const isPending = now < startDate;

	return { isActive, hasEnded, hasStarted, isPending };
}
