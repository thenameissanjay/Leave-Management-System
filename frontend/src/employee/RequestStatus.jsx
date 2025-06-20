import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useToast } from './ui/ToastContainer';

const RequestStatus = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const employeeID = user.EmployeeID;
        const res = await axios.get(
          `http://localhost:8080/api/leave/leave-status/${employeeID}?offset=${offset}&limit=${limit}`
        );
        setRequests(res.data.result);
        setTotal(res.data.totalRow); // rows count
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, offset]);

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
      await axios.delete(
        `http://localhost:8080/api/leave/cancelLeave/${requestId}`
      );
      setRequests((prev) => prev.filter((r) => r.request_id !== requestId));
      showToast('Updated Successfully', 'success');
    } catch (err) {
      const message = err.response?.data?.message;
      showToast(message, 'error');
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

  const handleNext = () => {
    console.log(total);
    if (offset + limit < total) {
      console.log('button is pressed');

      setOffset(offset + limit);
    }
  };

  const handlePrevious = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit));
    }
  };
  const renderApprovalTimeline = (approvalFlow) => {
    return (
      <div className="mt-4">
        <h3 className="font-medium text-gray-700 mb-2 text-center">
          Approval Timeline
        </h3>
        <div className="space-y-3">
          {approvalFlow.map((flow) => (
            <div
              key={flow.id}
              className="flex items-center gap-x-4 justify-center"
            >
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
                  {flow.approver.designation.name || flow.approver.designation})
                </p>
                <p
                  className={`text-sm ${getStatusClass(
                    flow.approval_status
                  )} px-2 py-1 rounded mt-1`}
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
      <div className="flex justify-center items-center h-64 mt-8">
        Loading leave requests...
      </div>
    );
  if (error)
    return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className=" max-w-6xl mt-8 ml-4 ">
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
                  const canCancel =
                    startDate > today &&
                    request.status != 500 &&
                    request.status != 600;

                  return (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.request_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.leave_type.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.day_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.from_date)} -{' '}
                        {formatDate(request.to_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.leave_count} day(s)
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
                        <button
                          onClick={() => openModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(request.request_id)}
                            className="text-red-600 hover:text-red-900 ml-3"
                          >
                            Cancel
                          </button>
                        )}
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

{isModalOpen && selectedRequest && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
            <p className="font-medium">#{selectedRequest.request_id}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Leave Type</label>
            <p className="font-medium">{selectedRequest.leave_type.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">From Date</label>
            <p className="font-medium">{formatDate(selectedRequest.from_date)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">To Date</label>
            <p className="font-medium">{formatDate(selectedRequest.to_date)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Duration</label>
            <p className="font-medium">{selectedRequest.leave_count} day(s)</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <span className={`${getStatusClass(selectedRequest.status)} px-2 py-1 rounded text-sm`}>
              {selectedRequest.request_status_label}
            </span>
          </div>
          <div>
            <label className="text-sm text-gray-500">Applied On</label>
            <p className="font-medium">{formatDateTime(selectedRequest.requestedAt)}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <label className="text-sm text-gray-500">Reason</label>
          <p className="mt-1 p-3 bg-gray-50 rounded text-sm">
            {selectedRequest.reason || 'No reason provided'}
          </p>
        </div>

        {/* Approval Timeline */}
        <div className="mb-6">
          {renderApprovalTimeline(selectedRequest.approval_flow)}
        </div>

        {/* Close Button */}
        <div className="flex justify-end border-t pt-6">
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
