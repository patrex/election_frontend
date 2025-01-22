function VoteBox({candidate}, options) {
	const handleClick = (e) => {
		
	}
	
	return ( 
		<div className="vote-card">
			<img src={candidate.imgUrl} alt="Card Image" />
			<div className="card-details">
				<h2>{`${candidate.firstname} ${candidate.lastname}`}</h2>
				<h5>{`${candidate.position}`}</h5>
			</div>
			<div className="card-buttons">
				<button onClick={handleClick}>Vote</button>
			</div>
		</div>
	);
}

export default VoteBox;