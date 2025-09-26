import { useEventStatus } from "@/hooks/useEventStatus";

function StatusBadge({ election }) {
	const { isActive, hasEnded, isPending } = useEventStatus(new Date(election.startDate), new Date(election.endDate));
	
	let label, classes;
	if (isPending) {
		label = "Pending";
		classes =
			"inline-block px-3 py-1 text-sm font-semibold shadow bg-yellow-100 text-yellow-700 border border-yellow-300";
	} else if (isActive) {
		label = "Active";
		classes =
			"inline-block px-3 py-1 text-sm font-semibold shadow bg-green-100 text-green-700 border border-green-300";
	} else if (hasEnded) {
		label = "Ended";
		classes =
			"inline-block px-3 py-1 text-sm font-semibold shadow bg-red-100 text-red-700 border border-red-300";
	} else {
		// fallback only if logic fails completely
		label = "Loading…";
		classes =
			"inline-block px-3 py-1 text-sm font-semibold shadow bg-gray-100 text-gray-600 border border-gray-300";
	}

	return <span className={classes}>{label}</span>;
}

export default StatusBadge;