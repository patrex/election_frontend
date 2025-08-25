import { useEventStatus } from "@/hooks/useEventStatus";

function StatusBadge(election) {
	const { isActive, hasEnded, isPending } = useEventStatus(new Date(election.startDate), new Date(election.endDate));
	console.log(election);
	
	let label = "Unknown";
	let classes =
		"inline-block px-3 py-1 rounded-full text-sm font-semibold shadow";

	if (isPending) {
		label = "Pending";
		classes += " bg-yellow-100 text-yellow-700 border border-yellow-300";
	} else if (isActive) {
		label = "Active";
		classes += " bg-green-100 text-green-700 border border-green-300";
	} else if (hasEnded) {
		label = "Ended";
		classes += " bg-red-100 text-red-700 border border-red-300";
	}

	return <span className={classes}>{label}</span>;
}

export default StatusBadge;