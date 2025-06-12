import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useToast } from "./ui/ToastContainer";

const RequestStatus = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const employeeID = user.EmployeeID;
        const res = await axios.get(
          `http://localhost:8080/api/leave/leave-status/${employeeID}`
        );
        setRequests(res.data);
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error')
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);



  const getStatusClass = (statusCode) => {
    switch (statusCode) {
      case 500:
        return 'bg-red-100 text-red-800';
      case 100:
        return 'bg-yellow-100 text-yellow-800';
      case 400:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await axios.put(`http://localhost:8080/api/leave/cancel/${requestId}`);
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
      showToast('Updated Successfully', 'success')
    } catch (err) {
      const message = err.response?.data?.message;
      showToast(message, 'error');
      alert('Failed to cancel the request. Please try again.');
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

  const openModal = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const renderApprovalTimeline = (approvalFlow) => {
    return (
      <div className="mt-4">
        <h3 className="font-medium text-gray-700 mb-2 text-center">Approval Timeline</h3>
        <div className="space-y-3">
          {approvalFlow.map((flow) => (
            <div key={flow.id} className="flex items-center gap-x-4 justify-center">
              {/* Status dot */}
              <div
                className={`h-3 w-3 rounded-full ${
                  flow.approval_status === 500
                    ? 'bg-red-500'
                    : flow.approval_at
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              ></div>
  
              {/* Approver info */}
              <div className="flex flex-col items-center text-center">
                <p className="text-sm font-medium text-gray-900">
                  {flow.approver.name} (
                  {flow.approver.designation?.name || flow.approver.designation})
                </p>
                <p
                  className={`text-sm ${getStatusClass(flow.approval_status)} px-2 py-1 rounded mt-1`}
                >
                  {flow.approval_status_label}
                </p>
                {flow.approval_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(flow.approval_at)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold">Leave Requests</h1>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">No leave requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
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
                    Applied On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => {
                  const today = new Date();
                  const startDate = new Date(request.from_date);
                  const canCancel = startDate > today && request.status === 100;

                  return (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.request_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.leave_type.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.from_date)} -{' '}
                        {formatDate(request.to_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.abs(
                          (new Date(request.to_date) -
                            new Date(request.from_date)) /
                            (1000 * 60 * 60 * 24)
                        ) + 1}{' '}
                        day(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                            request.status
                          )}`}
                        >
                          {request.request_status_label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(request.requestedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(request.request_id)}
                            className="text-red-600 hover:text-red-900 mr-3"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => openModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
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
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Request ID
                  </p>
                  <p className="text-sm">#{selectedRequest.request_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Leave Type
                  </p>
                  <p className="text-sm">{selectedRequest.leave_type.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">From Date</p>
                  <p className="text-sm">
                    {formatDate(selectedRequest.from_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">To Date</p>
                  <p className="text-sm">
                    {formatDate(selectedRequest.to_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm">
                    {Math.abs(
                      (new Date(selectedRequest.to_date) -
                        new Date(selectedRequest.from_date)) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}{' '}
                    day(s)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p
                    className={`text-sm ${getStatusClass(
                      selectedRequest.status
                    )} px-2 py-1 rounded inline-block`}
                  >
                    {selectedRequest.request_status_label}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Applied On
                  </p>
                  <p className="text-sm">
                    {formatDateTime(selectedRequest.requestedAt)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Reason</p>
                <p className="text-sm bg-gray-50 p-3 rounded">
                  {selectedRequest.reason || 'No reason provided'}
                </p>
              </div>

              {renderApprovalTimeline(selectedRequest.approval_flow)}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestStatus;
