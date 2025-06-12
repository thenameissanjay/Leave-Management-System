import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApprovalList from './IncomingHistory';
import { useToast } from "./ui/ToastContainer";


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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const EmployeeID = user?.EmployeeID;
        const role = user?.Designation;

        const res = await axios.get(`http://localhost:8080/api/leave/incoming-leave-request?EmployeeID=${EmployeeID}&role=${role}`);
        const approvals = res.data;

        approvals.sort((a, b) => b.leave_request.request_id - a.leave_request.request_id);
        setLeaveRequests(approvals);
        setLoading(false);
      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403) {
          showToast(message, "error")
        } else if (err.response?.status === 401) {
          showToast(message, "error")
        } else {
          showToast("An unexpected error occurred.", "error")
        }
      }
    };

    fetchLeaveRequests();
  }, [user, navigate]);

  const handleApproval = async (requestId, approver_id, status) => {
    const approvedAt = new Date();
    try {
      const res = await axios.put('http://localhost:8080/api/leave/update-leave-status', {
        request_id: requestId,
        approver_id,
        status,
        approvedAt,
        role: user.Designation,
        comments: comments[requestId] || '',
      });

      if (res.status === 200) {
        setLeaveRequests(prev =>
          prev.map(approval =>
            approval.leave_request.request_id === requestId && approval.approver_id === approver_id
              ? { ...approval, approval_status: status === 'approved' ? 200 : 400 }
              : approval
          )
        );
        showToast('Updated Succesfully', 'success')
      }
    } catch (err) {
      const message = err.response?.data?.message;
      console.error(err)
      if (err.response?.status === 403) {
        showToast(message, "error")
      } else if (err.response?.status === 401) {
        showToast(message, "error")
      } else {
      showToast('An unexpected error occurred.', 'error')
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 // confoirm pending only 
  const getStatusLabel = (statusCode) => {
    switch (statusCode) {
      case 100: return 'Pending';
      default: return 'Unknown';
    }
  };

  const getStatusClass = (statusCode) => {
    switch (statusCode) {
      case 400: return 'bg-red-100 text-red-800';
      case 100: return 'bg-yellow-100 text-yellow-800';
      case 200: 
      case 250:
      case 300: return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
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

  if (loading) return <div className="flex justify-center items-center h-64">Loading leave requests...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Approvals</h1>
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
          className={`px-4 py-2 rounded font-medium text-sm ${
            showHistory
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
          }`}
        >
          Approval History
        </button>
      </div>

      {showHistory ? (
        <ApprovalList />
      ) : leaveRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No pending leave requests for approval.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                          <p className="text-xs text-gray-500">{emp?.designation?.name || emp?.designation}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {req.leave_type?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(req.from_date)} - {formatDate(req.to_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.abs(
                      (new Date(req.to_date) -
                        new Date(req.from_date)) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{' '}
                    day(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(approval.approval_status)}`}>
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
                                onClick={() => handleApproval(req.request_id, approval.approver_id, 'approved')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproval(req.request_id, approval.approver_id, 'rejected')}
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
        </div>
      )}

      {/* Modal for viewing request details */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Leave Request Details</h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Request ID</p>
                  <p className="text-sm">#{selectedRequest.leave_request.request_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Employee</p>
                  <p className="text-sm">{selectedRequest.leave_request.employee?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Leave Type</p>
                  <p className="text-sm">{selectedRequest.leave_request.leave_type?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">From Date</p>
                  <p className="text-sm">{formatDate(selectedRequest.leave_request.from_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To Date</p>
                  <p className="text-sm">{formatDate(selectedRequest.leave_request.to_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Leave Balance</p>
                  <p className="text-sm">{(selectedRequest.leave_request.leave_balance)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm">
                    {Math.abs(
                      (new Date(selectedRequest.leave_request.to_date) -
                        new Date(selectedRequest.leave_request.from_date)) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{' '}
                    day(s)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className={`text-sm ${getStatusClass(selectedRequest.approval_status)} px-2 py-1 rounded inline-block`}>
                    {getStatusLabel(selectedRequest.approval_status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Applied On</p>
                  <p className="text-sm">{formatDateTime(selectedRequest.leave_request.requestedAt)}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Reason</p>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedRequest.leave_request.reason || 'No reason provided'}</p>
              </div>

              {selectedRequest.approval_status === 100 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
                  <textarea
                    rows="3"
                    className="w-full border rounded px-3 py-2 mb-3 text-sm"
                    placeholder="Add your comments here..."
                    value={comments[selectedRequest.leave_request.request_id] || ''}
                    onChange={(e) =>
                      setComments({ ...comments, [selectedRequest.leave_request.request_id]: e.target.value })
                    }
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        handleApproval(selectedRequest.leave_request.request_id, selectedRequest.approver_id, 'rejected');
                        closeModal();
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleApproval(selectedRequest.leave_request.request_id, selectedRequest.approver_id, 'approved');
                        closeModal();
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
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