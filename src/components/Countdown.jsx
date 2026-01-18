import { useState, useEffect, useRef } from "react";
import { moment,  duration } from 'moment'

function Countdown({ timeRef }) {

	function setCountdown() {
		const endDate = moment(timeRef);
		const clockDuration = duration(endDate.diff(moment()))

		const days = Math.floor(clockDuration.asDays());
		const hours = clockDuration.hours();
		const minutes = clockDuration.minutes();
		const secs = clockDuration.seconds();

		formatTime({ days, hours, minutes, secs })
	}

	useEffect(() => {
		const interval = setInterval(() => {
			setCountdown()
		}, 1000)

		return clearInterval(interval)
	}, [])

	function formatTime({ days, hours, minutes, secs }) {
		return `${days ? days: 0} days : ${hours} : ${minutes} : ${secs}`
	}

	return (
		<div className="stopwatch">
			<div className="display">
				{formatTime()}
			</div>
		</div>
	);
}

export default Countdown;