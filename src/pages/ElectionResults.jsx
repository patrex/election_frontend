import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import moment from 'moment';
import { fetcher, FetchError } from '@/utils/fetcher';
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
			{positions.length > 0 ? (
				<select name="positions" id="trusteefox">
					{positions.map((p) => {
						<option key={p._id} value={p.position}>{p.position}</option>
					})}
				</select>
			) : (
				<div>No positions found</div>
			)}
		</div>
	)
}
