import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

const RequestStatus = () => {
  const { user } = useContext(AuthContext);
  const [groupedRequests, setGroupedRequests] = useState({});
  const [managerNames, setManagerNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'others'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const employeeID = user.EmployeeID;
        // if (!employeeID) return setError('No employee ID found');

        const res = await axios.get(`http://localhost:8080/api/leave/leaveStatus/${employeeID}`);
        const data = res.data;

        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.request_id]) {
            acc[curr.request_id] = [];
          }
          acc[curr.request_id].push(curr);
          return acc;
        }, {});
        setGroupedRequests(grouped);

        const uniqueManagerIds = [...new Set(data.map(d => d.reporting_to))];
        const names = {};
        await Promise.all(
          uniqueManagerIds.map(async (id) => {
            try {
              const res = await axios.get(`http://localhost:8080/api/employee/getName/${id}`);
              names[id] = res.data.name || 'Unknown';
            } catch {
              names[id] = 'Unknown';
            }
          })
        );

        setManagerNames(names);
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
            navigate('/')
          } else {
            alert("An unexpected error occurred.");
          }
        }
        console.error(err);
        setError('Failed to fetch leave requests');
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleCancel = async (requestId) => {
    try {
      await axios.delete(`http://localhost:8080/api/leave/cancelLeave/${requestId}`);
      setGroupedRequests(prev => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    } catch (err) {
      console.error('Failed to cancel leave request', err);
      alert('Failed to cancel leave request');
    }
  };

  const getFinalStatus = (requests) => {
    if (requests.some(r => r.status === 'pending')) return 'Pending';
    if (requests.some(r => r.status === 'rejected')) return 'Rejected';
    return 'Approved';
  };

  if (loading) return <div>Loading leave requests...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      {/* Tab Header */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 mr-4 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'others' ? 'border-b-2 border-blue-600 font-semibold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('others')}
        >
          Approved / Rejected
        </button>
      </div>

      {/* Request Cards */}
      <div className="grid gap-4">
        {Object.entries(groupedRequests)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .filter(([_, requests]) => {
            const finalStatus = getFinalStatus(requests);
            return activeTab === 'pending'
              ? finalStatus === 'Pending'
              : finalStatus !== 'Pending';
          })
          .map(([requestId, requests]) => {
            const { leave_type, from_date, to_date, reason } = requests[0];
            const finalStatus = getFinalStatus(requests);

            return (
              <div key={requestId} className="border rounded-lg shadow p-4 bg-white">
                <h2 className="text-xl font-bold mb-3">Request ID: {requestId}</h2>

                <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                  <p><span className="font-semibold">Leave Type:</span> {leave_type}</p>
                  <p><span className="font-semibold">From:</span> {new Date(from_date).toLocaleDateString('en-GB')}</p>
                  <p><span className="font-semibold">To:</span> {new Date(to_date).toLocaleDateString('en-GB')}</p>
                  <p><span className="font-semibold">Reason:</span> {reason}</p>
                </div>

                <div className="text-sm space-y-2 mb-4">
                  {requests.map((req, idx) => (
                    <div key={idx} className="flex justify-center">
                      <p>
                        <span className="font-semibold">Manager ID:</span> {req.reporting_to} |{' '}
                        <span className="font-semibold">Manager Name:</span> {managerNames[req.reporting_to]} |{' '}
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`ml-1 px-2 py-1 rounded text-sm font-medium capitalize ${
                          req.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : req.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="text-sm flex justify-center mt-4 items-center gap-4">
  <p>
    <span className="font-semibold">Final Status:</span>{' '}
    <span className={`ml-2 px-3 py-1 rounded text-sm font-medium capitalize ${
      finalStatus === 'Approved'
        ? 'bg-green-100 text-green-700'
        : finalStatus === 'Rejected'
        ? 'bg-red-100 text-red-700'
        : 'bg-yellow-100 text-yellow-700'
    }`}>
      {finalStatus}
    </span>
  </p>

  {new Date() < new Date(from_date) && (
    <button
      onClick={() => handleCancel(requestId)}
      className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
    >
      Cancel
    </button>
  )}
</div>

              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RequestStatus;
