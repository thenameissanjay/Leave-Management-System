import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const IncomingRequest = () => {
  const { user } = useContext(AuthContext);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [managerNames, setManagerNames] = useState({});
  const [employeeNames, setEmployeeNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'other'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try { 
        const reportingID = user?.EmployeeID;
        // if (!reportingID) {
        //   console.log("helo")

        //   setError('No reporting ID found');
        //   return;
        // }

        const res = await axios.get(`http://localhost:8080/api/leave/reportingLeaveStatus/${reportingID}`);
        const requests = res.data;
        requests.sort((a, b) => b.request_id - a.request_id);
        setLeaveRequests(requests);

        const uniqueManagerIds = new Set();
        const uniqueEmployeeIds = new Set();

        requests.forEach(req => {
          uniqueEmployeeIds.add(req.employee_id);
          req.approvals.forEach(a => uniqueManagerIds.add(a.reporting_to));
        });

        const names = {};
        await Promise.all(
          Array.from(uniqueManagerIds).map(async id => {
            try {
              const nameRes = await axios.get(`http://localhost:8080/api/employee/getName/${id}`);
              names[id] = nameRes.data.name || 'Unknown';
            } catch {
              console.log("eov")

              names[id] = 'Unknown';
            }
          })
        );
        setManagerNames(names);

        const empNames = {};
        await Promise.all(
          Array.from(uniqueEmployeeIds).map(async id => {
            try {
              const empRes = await axios.get(`http://localhost:8080/api/employee/getName/${id}`);
              empNames[id] = empRes.data.name || 'Unknown';
            } catch {
              empNames[id] = 'Unknown';
            }
          })
        );
        setEmployeeNames(empNames);

        setLoading(false);
      } catch (err) {
        {

          const message = err.response?.data?.message;
          console.log(err)
          if (err.response?.status === 403) {
            alert(message || "You are not authorized to access this resource.");
            navigate('/')
          } else if (err.response?.status === 401) {
            alert(message || "Session expired. Please log in again.");
            navigate('/');
          } else {
            alert("An unexpected error occurred.");
          }
        }
      }
    };

    fetchLeaveRequests();
  }, [user]);


  const handleApproval = async (requestId, managerId, status) => {
    try {
      console.log(status);
      const res = await axios.put('http://localhost:8080/api/leave/updateLeaveStatus', {
        request_id: requestId,
        manager_id: managerId,
        status: status,
      });

      if (res.status === 200) {
        setLeaveRequests(prevRequests =>
          prevRequests.map(req =>
            req.request_id === requestId
              ? {
                  ...req,
                  approvals: req.approvals.map(a =>
                    a.reporting_to === managerId ? { ...a, status: status } : a
                  ),
                }
              : req
          )
        );
        window.location.reload();
      }
    } catch (err) {
      {
          
        const message = err.response?.data?.message;
        console.log(err)
        if (err.response?.status === 403) {
          alert(message || "You are not authorized to access this resource.");
        } else if (err.response?.status === 401) {
          alert(message || "Session expired. Please log in again.");
        } else {
          alert("An unexpected error occurred.");
        }
      }
      console.error('Error updating leave status:', err);
      setError('Failed to update leave status');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (leaveRequests.length === 0) return <p>No leave requests found.</p>;

  const withPendingApproval = leaveRequests.filter(req =>
    req.approvals.some(
      approval => approval.status === 'pending' && approval.reporting_to == user?.EmployeeID
    )
  );

  const withoutPendingApproval = leaveRequests.filter(
    req =>
      !req.approvals.some(
        approval => approval.status === 'pending' && approval.reporting_to == user?.EmployeeID
      )
  );

  const renderRequestCard = (req) => {
    const hasPendingApproval = req.approvals.some(
      approval =>
        approval.status === 'pending' && approval.reporting_to == user?.EmployeeID
    );

    return (
      <div key={req.request_id} className="border rounded-lg shadow p-4 mb-6 bg-white">
        <h2 className="text-xl font-bold mb-3">Request ID: {req.request_id}</h2>

        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
          <p><span className="font-semibold">Leave Type:</span> {req.leave_type}</p>
          <p>
            <span className="font-semibold">Employee:</span>{' '}
            {employeeNames[req.employee_id] || 'Unknown'} ({req.employee_id})
          </p>
          <p><span className="font-semibold">From:</span> {new Date(req.from_date).toLocaleDateString('en-GB')}</p>
          <p><span className="font-semibold">To:</span> {new Date(req.to_date).toLocaleDateString('en-GB')}</p>
          <p><span className="font-semibold">Reason:</span> {req.reason}</p>
          <p><span className="font-semibold">Remaining Sick:</span> {req.remaining_sick}</p>
          <p><span className="font-semibold">Remaining Casual:</span> {req.remaining_casual}</p>
          <p><span className="font-semibold">Remaining Others:</span> {req.remaining_others}</p>
        </div>

        <div className="text-sm space-y-2 mb-4">
          <h3 className="font-semibold text-lg mb-2">Manager Approvals:</h3>
          {req.approvals.map((approval, index) => (
            <div key={index} className="flex justify-center mb-2">
              <p className="text-center">
                <span className="font-semibold">Manager ID:</span> {approval.reporting_to} |{' '}
                <span className="font-semibold">Manager Name:</span> {managerNames[approval.reporting_to]} |{' '}
                <span className="font-semibold">Status:</span>{' '}
                <span
                  className={`ml-1 px-2 py-1 rounded text-sm font-medium capitalize ${
                    approval.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : approval.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {approval.status}
                </span>
              </p>
            </div>
          ))}
        </div>

        {hasPendingApproval && (
          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={() => handleApproval(req.request_id, user?.EmployeeID, 'approved')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={() => handleApproval(req.request_id, user?.EmployeeID, 'rejected')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Incoming Leave Requests</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded ${
            activeTab === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          🔔 Pending My Approval
        </button>
        <button
          onClick={() => setActiveTab('other')}
          className={`px-4 py-2 rounded ${
            activeTab === 'other' ? 'bg-blue-600 text-white' : 'bg-gray-200'
          }`}
        >
          📋 History My Approvals
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'pending' && (
        <div>
          {withPendingApproval.length > 0 ? (
            withPendingApproval.map(renderRequestCard)
          ) : (
            <p>No requests pending your approval.</p>
          )}
        </div>
      )}

      {activeTab === 'other' && (
        <div>
          {withoutPendingApproval.length > 0 ? (
            withoutPendingApproval.map(renderRequestCard)
          ) : (
            <p>No other requests to show.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomingRequest;
