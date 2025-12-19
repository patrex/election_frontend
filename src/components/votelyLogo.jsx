const VotelyLogo = ({ color = "#2563eb", size = "200px" }) => (
	<svg width={size} viewBox="0 0 200 60" style={{ color }}>
		<g fill="currentColor">
			<path d="M10 20 L22 45 L50 10 L45 7 L22 35 L15 20 Z" />
			<circle cx="65" cy="32" r="10" fill="none" stroke="currentColor" stroke-width="5" />
			<path d="M85 15 V45 M78 22 H92" stroke="currentColor" stroke-width="5" fill="none" />
			<path d="M105 32 H120 A8 8 0 1 0 105 35" stroke="currentColor" stroke-width="4.5" fill="none" />
			<rect x="130" y="10" width="5" height="35" rx="2" />
			<path d="M145 22 L155 45 M165 22 L150 55" stroke="currentColor" stroke-width="5" fill="none" />
		</g>
	</svg>
);

export default VotelyLogo;