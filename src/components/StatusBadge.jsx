import { useEventStatus } from "@/hooks/useEventStatus";
import { Badge } from "@/components/ui/badge";

function StatusBadge({ election }) {
	const { isActive, hasEnded, isPending } = useEventStatus(new Date(election.startDate), new Date(election.endDate));
	
	let label, variant;
	if (isPending) {
		label = "Pending";
		variant = "default";
	} else if (isActive) {
		label = "Active";
		variant = "active"
			
	} else if (hasEnded) {
		label = "Ended";
		variant = "destructive"
		// fallback only if logic fails completely
		label = "Loading…";
		variant = "outline"
	}

	return <Badge variant={variant}>{label}</Badge>
}

export default StatusBadge;