function ResultRow({ candidate }, position) {
	const { imgUrl, candidateName, votes } = candidate
	return (
		<div className="flex items-center py-2 px-3 border-b border-gray-200">
		  {/* Picture */}
		  <img
			src={ imgUrl }
			className="w-10 h-10 rounded-full object-cover mr-3"
		  />
		  {/* Name */}
		  <div className="flex-1 font-bold">{ candidateName }</div>
		  {/* Position */}
		  <div className="flex-1 text-gray-600">{position}</div>
		  {/* Count */}
		  <div className="ml-3 font-bold text-gray-800">{ votes}</div>
		</div>
	      );
}

export default ResultRow;