import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Calendar, Clock, Shield, FileText, ScrollText, Users, ChevronRight, Vote, Phone, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import PhoneInputModal from "@/components/CollectPhoneNumber";
import CollectEmailModal from "@/components/CollectEmailModal";
import ShowAlert from "@/components/ShowAlert";
import axios_api from "@/utils/axios";

/**
 * Uses local date/time for comparison — new Date() is always local,
 * and the startDate/endDate strings are parsed into local Date objects.
 */
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

const formatDate = (dateStr) =>
	new Date(dateStr).toLocaleString(undefined, {
		weekday: "short",
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});

const StatusBadge = ({ isPending, isActive, hasEnded }) => {
	if (isActive) return (
		<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
			<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
			Live Now
		</span>
	);
	if (isPending) return (
		<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
			<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
			Upcoming
		</span>
	);
	return (
		<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
			<span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
			Ended
		</span>
	);
};

const InfoRow = ({ icon: Icon, label, value, valueStyles }) => (
	<div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
		<span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex-shrink-0">
			<Icon className="h-3.5 w-3.5 text-indigo-500" />
		</span>
		<div className="min-w-0">
			<p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
			<p className={`text-sm ${valueStyles ? valueStyles : 'text-gray-800'} dark:text-gray-200`}>{value}</p>
		</div>
	</div>
);

const ElectionInfo = () => {
	const { state } = useLocation();
	const navigate = useNavigate();

	const {
		title, startDate, endDate,
		type, desc, rules,
		userAuthType, addCandidatesBy,
		_id,
	} = state.election;

	const { voter, setVoter } = useAuth();

	const [showEmailModal, setShowEmailModal] = useState(false);
	const [showPhoneModal, setShowPhoneModal] = useState(false);
	const [voters, setVoters] = useState([]);
	const [query, setQuery] = useState('');

	const [statusModal, setStatusModal] = useState({ show: false, status: 'success', title: '', message: '' });

	const { isActive, isPending, hasEnded } = getEventStatus(startDate, endDate);
	const canSelfAddCandidates = isPending && addCandidatesBy === "Candidates Will Add Themselves";
	const lbl = isPending
		? userAuthType === "phone" ? "Phone number required" : "Email address required"
		: "Registration has ended";

	const handleRegisterClick = () => {
		userAuthType === "phone" ? setShowPhoneModal(true) : setShowEmailModal(true);
	};

	async function checkReggedVoter(voter) {
		const voterList = await axios_api.get(`election/${_id}/voterlist`);
		const listOfVoters = voterList.data;

		const existingVoters = userAuthType === "phone"
			? listOfVoters.map((v) => v.phoneNo)
			: listOfVoters.map((v) => v.email);

		if (existingVoters.includes(voter)) {
			navigate(`/election/${_id}/${voter}`);
			return;
		}

		if (type === "Closed") {
			throw new Error(
				`This is a closed election. Your ${userAuthType === "email" ? "email" : "phone number"} must be pre-registered by the election administrator.`
			);
		}
	}

	// find voters for a closed election
	async function cfetchVoters() {
		if (type == "Closed") {
			try {
				const _cv = await axios_api.get(`election/${_id}/voterlist`);
				setVoters(_cv.data ?? []);
			} catch (error) {
				throw new Error("Could not fetch voters for this closed election")
			}
		}
	}

	function checkVoterExists() {
		const _0 = voters.includes(query)
		if (_0) {
			setStatusModal({
				show: true,
				status: 'success',
				title: 'Verified',
				message: `Your ${type == 'email' ? 'email' : 'phone number'} is registered`,
			})
		} else {
			setStatusModal({
				show: true,
				status: 'error',
				title: 'Verification failed',
				message: `Your ${type == 'email' ? 'email' : 'phone number'} is not registered`,
			})
		}
	}

	useEffect(() => { cfetchVoters() }, [_id])

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
			<div className="max-w-2xl mx-auto space-y-5">

				{/* Header card */}
				<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
					<div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 pt-6 pb-10">
						<p className="text-indigo-200 text-xs font-semibold uppercase tracking-widest mb-2">
							We found your election
						</p>
						<h1 className="text-2xl font-bold text-white leading-snug">{title}</h1>
						<div className="mt-3 flex items-center gap-2 flex-wrap">
							<StatusBadge isPending={isPending} isActive={isActive} hasEnded={hasEnded} />
							<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
								<Shield className="h-3 w-3" />
								{type}
							</span>
						</div>
					</div>

					{/* Dates strip */}
					<div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800 -mt-4 mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800">
						<div className="px-4 py-3">
							<p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
								<Calendar className="h-3 w-3" /> Starts
							</p>
							<p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(startDate)}</p>
						</div>
						<div className="px-4 py-3">
							<p className="text-xs text-gray-400 flex items-center gap-1 mb-1">
								<Clock className="h-3 w-3" /> Ends
							</p>
							<p className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatDate(endDate)}</p>
						</div>
					</div>

					<div className="px-6 py-5 mt-1">
						<InfoRow icon={FileText} label="Description" value={desc} />
						<InfoRow icon={ScrollText} label="Rules" value={rules} />
						<InfoRow
							icon={Users}
							label="How do I register"
							value={lbl}
							valueStyles={!isPending && 'text-red-100'}
						/>
					</div>
				</div>

				{/* Action card */}
				{(isPending || canSelfAddCandidates) && (
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 w-full">
						<h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
							Actions
						</h2>
						<div className="flex flex-col gap-3 w-full">
							{isPending && type == 'Open' && (
								<button
									onClick={handleRegisterClick}
									className="w-1/2 flex items-center justify-between px-5 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold transition"
								>
									<div className="flex items-center gap-3">
										<Vote className="h-5 w-5 flex-shrink-0" />
										<span>Register to Vote</span>
									</div>
									<ChevronRight className="h-4 w-4 opacity-70 flex-shrink-0" />
								</button>
							)}

							{isPending && type == 'Closed' && (
								<div className="w-full flex flex-col sm:flex-row items-center gap-2">
									<div className="relative w-full flex-1">
										<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
											{type === "email" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
										</div>
										<input
											type={type === "email" ? "email" : "tel"}
											value={query}
											onChange={(e) => setQuery(e.target.value)}
											onKeyDown={(e) => e.key === "Enter" && handleRegisterClick()}
											placeholder={type === "email" ? "Enter your email" : "Enter your phone number"}
											className="w-full pl-10 pr-4 py-4 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
										/>
									</div>

									<button
										onClick={() => checkVoterExists()}
										className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-sm transition flex-shrink-0"
									>
										<Vote className="h-4 w-4" />
										<span>Check my {userAuthType === 'email' ? 'email' : 'phone'}</span>
									</button>
								</div>
							)}

							{canSelfAddCandidates && (
								<Link to={`/election/${_id}/addcandidate`}
									className="w-full no-underline flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 transition"
								>
									<div className="flex items-center gap-3">
										<Users className="h-5 w-5 text-indigo-500 flex-shrink-0" />
										<span>Become a Candidate</span>
									</div>
									<ChevronRight className="h-4 w-4 opacity-40 flex-shrink-0" />
								</Link>
							)}
						</div>
					</div>
				)}

				{hasEnded && (
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-0 w-full">
						<Link
							to={`/election/${_id}/results`}
							className="w-full no-underline text-red-600 bg-red-100 flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 transition"
						>
							<div className="flex items-center gap-3">
								<span>Election has Ended. View Results</span>
							</div>
							<ChevronRight className="h-4 w-4 opacity-40 flex-shrink-0" />
						</Link>
					</div>
				)}

				{isActive && (
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-0 w-full">
						<Link
							to={`/election/${_id}/results`}
							className="w-full no-underline text-green-600 bg-green-100 flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 transition"
						>
							<div className="flex items-center gap-3">
								<Users className="h-5 w-5 text-indigo-500 flex-shrink-0" />
								<span className="text-red dark:text-red-400">Go to Ballot</span>
							</div>
							<ChevronRight className="h-4 w-4 opacity-40 flex-shrink-0" />
						</Link>
					</div>
				)}
			</div>

			<ShowAlert
				{...statusModal}
				onClose={() => setStatusModal(s => ({ ...s, show: false }))}
			/>

			<PhoneInputModal
				isOpen={showPhoneModal}
				onClose={() => setShowPhoneModal(false)}
				onSubmit={checkReggedVoter}
			/>

			<CollectEmailModal
				isOpen={showEmailModal}
				onClose={() => setShowEmailModal(false)}
				onSubmit={checkReggedVoter}
			/>
		</div>
	);
};

export default ElectionInfo;