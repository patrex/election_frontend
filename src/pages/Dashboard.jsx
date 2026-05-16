import { useState } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Toast from '@/utils/ToastMsg';
import { useAuth } from '@/contexts/AuthContext';
import NoData from '@/components/NoData';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg';
import { fetcher } from '@/utils/fetcher';
import axios_api from '@/utils/axios';
import { IconEye, IconCopy, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

// Usage — size and stroke are props, no CSS needed:


export async function dashboardLoader({ params }) {
	try {
		const elections = await axios_api.get(`elections/${params.userId}`);
		return elections.data;
	} catch (error) {
		return null;
	}
}

function Dashboard() {
	const params = useParams();
	const data = useLoaderData();
	const [elections, setElections] = useState(data || []);
	const navigate = useNavigate();
	const { user } = useAuth();

	async function removeElection(election) {
		try {
			await fetcher.auth.delete(`election/${election._id}/delete`, user);
			setElections((old) =>
				old ? old.filter((e) => e._id !== election._id) : []
			);
			Toast.success('The election was deleted successfully');
		} catch (error) {
			Toast.error('An error occurred while deleting');
			console.error('Delete error for election:', election._id, error);
		}
	}

	function copyLink(election) {
		const link = `${window.location.origin}/vote/${election._id}`;
		navigator.clipboard.writeText(link).then(() => Toast.success('Link copied'));
	}

	const active = elections.filter(
		(e) => new Date() >= new Date(e.startDate) && new Date() <= new Date(e.endDate)
	).length;

	const upcoming = elections.filter(
		(e) => new Date() < new Date(e.startDate)
	).length;

	/* ── Shared action buttons ───────────────────────────── */
	function ActionButtons({ election }) {
		return (
			<>
				<button
					className="icon-btn"
					title="View election"
					onClick={() =>
						navigate(`/user/${params.userId}/election/${election._id}`)
					}
				>
					<i className="ti ti-eye" aria-hidden="true" />
				</button>
				<button
					className="icon-btn"
					title="Copy voting link"
					onClick={() => copyLink(election)}
				>
					<i className="ti ti-copy" aria-hidden="true" />
				</button>
				<button
					className="icon-btn"
					title="Edit election"
					onClick={() =>
						navigate(`/user/${params.userId}/election/${election._id}/edit`)
					}
				>
					<i className="ti ti-edit" aria-hidden="true" />
				</button>
				<button
					className="icon-btn danger"
					title="Delete election"
					onClick={() => removeElection(election)}
				>
					<i className="ti ti-trash" aria-hidden="true" />
				</button>
			</>
		);
	}

	if (!elections.length) {
		return (
			<main className="dashboard-container">
				<NoData
					image={noDataGraphic}
					message={
						<>
							You haven't created any elections.{' '}
							<Link
								to={`/user/${user.id}/create-election`}
								className="link-accent"
							>
								Create one
							</Link>{' '}
							to continue.
						</>
					}
				/>
			</main>
		);
	}

	return (
		<main className="dashboard-container">
			{/* ── Page header ─────────────────────────────────── */}
			<div className="page-header">
				<h1 className="page-title">Your elections</h1>
				<Link
					to={`/user/${user.id}/create-election`}
					className="btn-create"
				>
					<i className="ti ti-plus" aria-hidden="true" />
					New election
				</Link>
			</div>

			{/* ── Stat bar ────────────────────────────────────── */}
			<div className="stat-bar">
				<div className="stat">
					<span className="stat-val">{elections.length}</span>
					<span className="stat-lbl">Total</span>
				</div>
				<div className="stat">
					<span className="stat-val">{active}</span>
					<span className="stat-lbl">Active</span>
				</div>
				<div className="stat">
					<span className="stat-val">{upcoming}</span>
					<span className="stat-lbl">Upcoming</span>
				</div>
			</div>

			{/* ── Desktop table (≥ 641px) ──────────────────────── */}
			<div className="table-card desktop-only">
				<table>
					<thead>
						<tr>
							<th style={{ width: 40 }}>#</th>
							<th>Election</th>
							<th>Start date</th>
							<th>End date</th>
							<th>Type</th>
							<th style={{ textAlign: 'right' }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{elections.map((election, index) => (
							<tr key={election._id}>
								<td>
									<span className="row-idx">{String(index + 1).padStart(2, '0')}</span>
								</td>
								<td>
									<Link
										to={`/user/${params.userId}/election/${election._id}`}
										className="election-link"
									>
										{election.title}
									</Link>
								</td>
								<td>
									<span className="date-val">
										{moment(election.startDate).format('ddd, MMM D, YYYY h:mm A')}
									</span>
								</td>
								<td>
									<span className="date-val">
										{moment(election.endDate).format('ddd, MMM D, YYYY h:mm A')}
									</span>
								</td>
								<td>
									<span className={`badge ${election.type}`}>{election.type}</span>
								</td>
								<td>
									<div className="actions">
										<ActionButtons election={election} />
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* ── Mobile cards (≤ 640px) ───────────────────────── */}
			<div className="cards-list mobile-only">
				{elections.map((election) => (
					<div key={election._id} className="election-card">
						<div className="card-top">
							<Link
								to={`/user/${params.userId}/election/${election._id}`}
								className="election-link"
							>
								{election.title}
							</Link>
							<span className={`badge ${election.type}`}>{election.type}</span>
						</div>
						<div className="card-dates">
							<div className="date-block">
								<span className="date-lbl">Start</span>
								<span className="date-val">
									{moment(election.startDate).format('ddd, MMM D')}
									<br />
									{moment(election.startDate).format('h:mm A')}
								</span>
							</div>
							<div className="date-block">
								<span className="date-lbl">End</span>
								<span className="date-val">
									{moment(election.endDate).format('ddd, MMM D')}
									<br />
									{moment(election.endDate).format('h:mm A')}
								</span>
							</div>
						</div>
						<div className="card-footer">
							<ActionButtons election={election} />
						</div>
					</div>
				))}
			</div>
		</main>
	);
}

export default Dashboard;