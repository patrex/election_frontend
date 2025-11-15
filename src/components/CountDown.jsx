import { useState, useEffect } from 'react';
import moment from 'moment';

function Countdown({ startDate }) {
	const [countdown, setCountdown] = useState('');

	useEffect(() => {
		const updateCountdown = () => {
			const now = moment();
			const start = moment(startDate);
			const duration = moment.duration(start.diff(now));

			if (duration.asMilliseconds() <= 0) {
				setCountdown('Started');
				return;
			}

			const days = Math.floor(duration.asDays());
			const hours = duration.hours();
			const minutes = duration.minutes();
			const seconds = duration.seconds();

			if (days > 0) {
				setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
			} else if (hours > 0) {
				setCountdown(`${hours}h ${minutes}m ${seconds}s`);
			} else if (minutes > 0) {
				setCountdown(`${minutes}m ${seconds}s`);
			} else {
				setCountdown(`${seconds}s`);
			}
		};

		updateCountdown(); // Initial update
		const interval = setInterval(updateCountdown, 1000); // Update every second

		return () => clearInterval(interval); // Cleanup
	}, [startDate]);

	return <span>{countdown}</span>;
}

// Usage
<Countdown startDate={startDate} />