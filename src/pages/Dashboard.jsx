import { useState, useContext, useMemo } from 'react';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import moment from 'moment';
import Swal from 'sweetalert2';
import backendUrl from '../utils/backendurl';
import Toast from '@/utils/ToastMsg';
import { AppContext } from '@/App';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';

export async function dashboardLoader({ params }) {
  const res = await fetch(`${backendUrl}/elections/${params.userId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const elections = await res.json();
  return elections;
}

function Dashboard() {
  const params = useParams();
  const elections = useLoaderData();
  const { user } = useContext(AppContext);
  const [electionsList, setElectionsList] = useState(elections);

  const removeElection = async (election) => {
    Swal.fire({
      title: `Delete ${election.title}?`,
      showDenyButton: true,
      confirmButtonText: 'Delete',
      denyButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${backendUrl}/election/${election._id}/delete`, {
            method: 'delete',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${await user?.getIdToken()}`,
            },
          });

          if (!res.ok) {
            Toast.warning('Could not complete the request');
            return;
          }

          setElectionsList(electionsList.filter((e) => e._id !== election._id));
          Toast.success('The event was removed successfully');
        } catch (error) {
          Toast.error('An error occurred');
          console.error(error);
        }
      }
    });
  };

  function copyLink(link) {
    navigator.clipboard.writeText(link);
    Toast.success('Copied');
  }

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Election',
        cell: (info) => (
          <Link
            className="text-blue-600 hover:underline"
            to={`/user/${params.userId}/election/${info.row.original._id}`}
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor('startDate', {
        header: 'Starting',
        cell: (info) => moment(info.getValue()).format('MMM[-]Do[-]YY'),
      }),
      columnHelper.accessor('endDate', {
        header: 'Ending',
        cell: (info) => moment(info.getValue()).format('MMM[-]Do[-]YY'),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <button
              className="Button violet action-item"
              onClick={() => copyLink(row.original._id)}
            >
              Copy ID
            </button>
            <button
              className="Button violet action-item"
              onClick={() => copyLink(row.original.shareLink)}
            >
              Copy Link
            </button>
            <Link
              to={`/user/${params.userId}/election/${row.original._id}/update`}
            >
              <button
                className="Button violet action-item"
                disabled={new Date(row.original.startDate) < Date.now()}
              >
                Edit
              </button>
            </Link>
            <button
              className="Button red action-item"
              onClick={() => removeElection(row.original)}
            >
              <i className="bi bi-trash3 m-1"></i>
            </button>
          </div>
        ),
      }),
    ],
    [params.userId, electionsList]
  );

  const table = useReactTable({
    data: electionsList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="dashboard-container w-full overflow-x-auto">
      {electionsList.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-left">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 text-sm whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No elections to show</p>
      )}
    </div>
  );
}

export default Dashboard;
