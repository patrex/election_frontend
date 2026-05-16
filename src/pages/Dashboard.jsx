import { useEffect, useState } from 'react';
import { Link, useLoaderData, useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import Toast from '@/utils/ToastMsg';
import { useAuth } from '@/contexts/AuthContext';
import NoData from '@/components/NoData';
import noDataGraphic from '@/assets/undraw_no-data_ig65.svg';
import axios_api from '@/utils/axios';
import { IconEye, IconCopy, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { useEventStatus } from '@/hooks/useEventStatus';

// Usage — size and stroke are props, no CSS needed:

import DeleteDialog from '@/components/DeleteDialog';


export async function dashboardLoader({ params }) {
	try {
		const elections = await axios_api.get(`elections/${params.userId}`);
		return elections.data;
	} catch (error) {
		return null;
	}
}

const getEventStatus = (startDate, endDate) => {
	const now = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);
	return {
		isPending: now < start,
		hasEnded: now > end,
		isActive: now >= start && now <= end,
	};
};

function Dashboard() {
	const params = useParams();
	const data = useLoaderData();
	const [elections, setElections] = useState(data || []);
	const navigate = useNavigate();
	const { user } = useAuth();

	const [modalConfig, setModalConfig] = useState({ open: false, action: null });

	useEffect(() => {
		if (modalConfig.open) return;
	}, [modalConfig.open])

	async function removeElection(election) {
		try {
			await axios_api.delete(`election/${election._id}/delete`);
			setElections((old) =>
				old ? old.filter((e) => e._id !== election._id) : []
			);
			Toast.success('The election was deleted successfully');
		} catch (error) {
			Toast.error('An error occurred while deleting');
			console.error('Delete error for election:', election._id, error);
		}
	}

	const triggerDeleteElection = (election) => {
		setModalConfig({
			open: true,
			action: () => removeElection(election) // Pass the pre-wrapped async function
		});
	}

	function doCopy(text) {
		navigator.clipboard.writeText(text).then(() => Toast.success('Copied'));
	}

	const active = elections.filter(
		(e) => new Date() >= new Date(e.startDate) && new Date() <= new Date(e.endDate)
	).length;

	const upcoming = elections.filter(
		(e) => new Date() < new Date(e.startDate)
	).length;

	/* ── Shared action buttons ───────────────────────────── */
	function ActionButtons({ election }) {
		const {isActive, isPending, hasEnded} = getEventStatus(election.startDate, election.endDate)
		return (
			<>
				<button
					className="icon-btn"
					title="View election"
					onClick={() => doCopy(election._id)}
				>
					<IconEye size={15} stroke={1.75} />
				</button>
				<button
					className="icon-btn"
					title="Copy voting link"
					onClick={() => doCopy(election.shareLink)}
				>
					<IconCopy size={15} stroke={1.75} />
				</button>
				{isPending && (
					<button
						className="icon-btn"
						title="Edit election"
						onClick={() =>
							navigate(`/user/${params.userId}/election/${election._id}/update`)
						}
					>
					<IconEdit size={15} stroke={1.75} />
				</button>
				)}
				<button
					className="icon-btn danger"
					title="Delete election"
					onClick={() => triggerDeleteElection(election)}
				>
					<IconTrash size={15} stroke={1.75} />
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
					<IconPlus size={15} stroke={1.75} />
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

			<DeleteDialog
				isOpen={modalConfig.open}
				onClose={() => setModalConfig({ ...modalConfig, open: false })}
				onConfirm={modalConfig.action}
				title="Delete Election"
				description={`This will permanently delete all data for this election`}
				confirmText="Yes, delete"
			/>	
		</main>
	);
}

export default Dashboard;