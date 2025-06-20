import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApprovalList from './IncomingHistory';
import { useToast } from './ui/ToastContainer';
import { History } from 'lucide-react';

const IncomingRequest = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const EmployeeID = user?.EmployeeID;
        const role = user?.Designation;

        const res = await axios.get(
          `http://localhost:8080/api/leave/incoming-leave-request?EmployeeID=${EmployeeID}&role=${role}&offset=${offset}&limit=${limit}`
        );
        console.log(res.data);
        const approvals = res.data.result[0];
        setTotal(res.data.result[1]);
        // console.log(res.data.result[1])

        // approvals.sort((a, b) => b.leave_request.request_id - a.leave_request.request_id);
        setLeaveRequests(approvals);
        setLoading(false);
      } catch (err) {
        console.log(err);
        const message = err.response?.data?.message;
        if (err.response?.status === 403) {
          showToast(message, 'error');
        } else if (err.response?.status === 401) {
          showToast(message, 'error');
        } else {
          showToast('An unexpected error occurred.', 'error');
        }
      }
    };

    fetchLeaveRequests();
  }, [user, navigate, offset]);

  const handleNext = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const handlePrevious = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };

  const handleApproval = async (requestId, approver_id, status) => {
    const approvedAt = new Date();
    try {
      const res = await axios.put(
        'http://localhost:8080/api/leave/update-leave-status',
        {
          request_id: requestId,
          approver_id,
          status,
          approvedAt,
          role: user.Designation,
          comments: comments[requestId] || '',
        }
      );

      if (res.status === 200) {
        setLeaveRequests((prev) =>
          prev.map((approval) =>
            approval.leave_request.request_id === requestId &&
            approval.approver_id === approver_id
              ? {
                  ...approval,
                  approval_status: status === 'approved' ? 200 : 400,
                }
              : approval
          )
        );
        showToast('Updated Succesfully', 'success');
      }
    } catch (err) {
      const message = err.response?.data?.message;
      console.error(err);
      if (err.response?.status === 403) {
        showToast(message, 'error');
      } else if (err.response?.status === 401) {
        showToast(message, 'error');
      } else {
        showToast('An unexpected error occurred.', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  // confoirm pending only
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case 100:
        return 'Pending';
      default:
        return 'Updated';
    }
  };

  const getStatusClass = (statusCode) => {
    switch (statusCode) {
      case 400:
        return 'bg-red-100 text-red-800';
      case 100:
        return 'bg-yellow-100 text-yellow-800';
      case 200:
      case 250:
      case 300:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        Loading leave requests...
      </div>
    );
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold ">Leave Approvals</h1>
      </div>

      {/* Toggle Buttons */}
      <div className="flex mb-6 space-x-2">
        <button
          onClick={() => setShowHistory(false)}
          className={`px-4 py-2 rounded font-medium text-sm ${
            !showHistory
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
        >
          Pending Approvals
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className={`px-4 py-2 rounded font-medium text-sm flex items-center gap-2 ${
            showHistory
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
        >
          <History className="w-4 h-4" />
          Approval History
        </button>
      </div>

      {showHistory ? (
        <ApprovalList />
      ) : leaveRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">
            No pending leave requests for approval.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="max-w-4xl divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Day Type
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveRequests.map((approval) => {
                  const req = approval.leave_request;
                  const emp = req.employee;
                  const isPending = approval.approval_status === 100;

                  return (
                    <tr key={req.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{req.request_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <p className="font-medium">{emp?.name}</p>
                          <p className="text-xs text-gray-500">
                            {emp?.designation?.name || emp?.designation}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.leave_type?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.day_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(req.from_date)} - {formatDate(req.to_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.leave_count} day(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                            approval.approval_status
                          )}`}
                        >
                          {getStatusLabel(approval.approval_status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openModal(approval)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={() =>
                                  handleApproval(
                                    req.request_id,
                                    approval.approver_id,
                                    'approved'
                                  )
                                }
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleApproval(
                                    req.request_id,
                                    approval.approver_id,
                                    'rejected'
                                  )
                                }
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-8 m-6">
            <button
              onClick={handlePrevious}
              className="px-4 py-2 rounded font-medium text-sm bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 flex items-center gap-2 transition"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.7071 18.7071C16.0976 18.3166 16.0976 17.6834 15.7071 17.2929L10.4142 12L15.7071 6.70711C16.0976 6.31658 16.0976 5.68342 15.7071 5.29289C15.3166 4.90237 14.6834 4.90237 14.2929 5.29289L8.29289 11.2929C7.90237 11.6834 7.90237 12.3166 8.29289 12.7071L14.2929 18.7071C14.6834 19.0976 15.3166 19.0976 15.7071 18.7071Z"
                  fill="currentColor"
                />
              </svg>
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-2 rounded font-medium text-sm bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 flex items-center gap-2 transition"
            >
              Next
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal for viewing request details */}
      {isModalOpen && selectedRequest && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[100vh] overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <h2 className="text-xl font-semibold">Leave Request Details</h2>
        <button
          onClick={closeModal}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
            <label className="text-sm text-gray-500">Request ID</label>
            <p className="font-medium">{selectedRequest.leave_request.request_id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Employee</label>
            <p className="font-medium">{selectedRequest.leave_request.employee?.name}  -  {selectedRequest.leave_request.employee.designation.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Leave Type</label>
            <p className="font-medium">{selectedRequest.leave_request.leave_type?.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <p className={`${getStatusClass(selectedRequest.approval_status)} px-2 py-1 rounded text-sm w-25`}>
              {getStatusLabel(selectedRequest.approval_status)}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">From Date</label>
            <p className="font-medium">{formatDate(selectedRequest.leave_request.from_date)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">To Date</label>
            <p className="font-medium">{formatDate(selectedRequest.leave_request.to_date)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Duration</label>
            <p className="font-medium">{selectedRequest.leave_request.leave_count} day(s)</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Leave Balance</label>
            <p className="font-medium">{selectedRequest.leave_request.leave_balance}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="text-sm text-gray-500">Reason</label>
          <p className="mt-1 p-3 bg-gray-50 rounded text-sm">
            {selectedRequest.leave_request.reason || 'No reason provided'}
          </p>
        </div>

        {/* Approval Actions */}
        {selectedRequest.approval_status === 100 && (
          <div className="border-t pt-6">
            <textarea
              rows="3"
              className="w-full border rounded p-3 mb-4 text-sm"
              placeholder="Add comments (optional)..."
              value={comments[selectedRequest.leave_request.request_id] || ''}
              onChange={(e) =>
                setComments({
                  ...comments,
                  [selectedRequest.leave_request.request_id]: e.target.value,
                })
              }
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  handleApproval(
                    selectedRequest.leave_request.request_id,
                    selectedRequest.approver_id,
                    'rejected'
                  );
                  closeModal();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  handleApproval(
                    selectedRequest.leave_request.request_id,
                    selectedRequest.approver_id,
                    'approved'
                  );
                  closeModal();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default IncomingRequest;
