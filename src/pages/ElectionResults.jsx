import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher } from '@/utils/fetcher';
import { Trophy, Medal, Users, ChevronRight, CheckCircle, Share2, Printer, Copy, Check, Info, BarChart3, Filter, ChevronDown } from 'lucide-react';

export async function resultsLoader({ params }) {
	try {
		const [election, results, positions] = await Promise.all([
			fetcher.get(`election/${params.id}`),
			fetcher.get(`results/${params.id}`),
			fetcher.get(`election/${params.id}/positions`)
		])

		//results potentially contains: results.data for the total results
		//and results.winners for the first three winners
		return [election, results, positions];
	} catch (error) {
		console.error(error);
		return null
	}
}

export default function ElectionResults() {
	const [election, resultsData, positions] = useLoaderData();

	const [selectedPosition, setSelectedPosition] = useState('');
	const allResults = resultsData.data || [];	// Extracting data from your API response structure
	const topThree = resultsData.winners || [];



	return (
		<div className='container'>
			{/* Filter Section */}
			<div className="select-ctrl">
				{positions.length > 0 ? (
					<select name="positions" id="trusteefox">
						{positions.map((p) => (
							<option key={p._id} value={p.position}>{p.position}</option>
						))}
					</select>
				) : (
					<div className="empty-state">No positions found</div>
				)}
			</div>

			<div className="sub-container">
				{/* Top Winners (Horizontal Podium Style) */}
				<div className="winners-votes">
					<div className="winners-row">
						{topThree.map((v, index) => (
							<div key={v._id || index} className={`winner-card rank-${index + 1}`}>
								<div className="winner-avatar-wrapper">
									<img src={v.imgrUrl} alt={v.candidateName} className="winner-avatar" />
									<span className="rank-badge">{index + 1}</span>
								</div>

								<div className="winner-info">
									<h3 className="winner-name">{v.candidateName}</h3>
									<div className="winner-meta">
										<p>{v.position}</p>
										<p><strong>{v.votes}</strong> votes</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* All Results (Vertical List Style) */}
				<div className="all-votes">
					{allResults.length > 0 ? (
						allResults.map((v) => (
							<div key={v._id} className="user-card">
								<div className="user-card-image">
									<img src={v.imgUrl} alt={`${v.candidateName}'s photo`} />
								</div>

								<div className="user-card-content">
									<h2 className="user-name">{v.candidateName}</h2>
									<div className="user-details">
										<span className="detail-item">{v.position}</span>
										<span className="detail-item">{v.votes} votes</span>
									</div>
								</div>
							</div>
						))
					) : (
						<div className="empty-state">No positions</div>
					)}
				</div>
			</div>
		</div>
	)
}
