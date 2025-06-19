import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewLeavePolicy = () => {
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/leave-policy/Leave-policy'
        );
        setLeavePolicies(res.data);
      } catch (err) {
        console.error('Failed to fetch leave policies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading leave policies...</div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white rounded-lg shadow-md space-y-12">
      <button
        onClick={() => navigate('/RequestForm')}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Leave Request
      </button>

      {/* Leave Policy Table */}
      <div className="overflow-x-auto border rounded-md shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 text-gray-600 uppercase h-10 tracking-wide">
            <tr>
              <th className="px-6 text-left">Designation</th>
              {leavePolicies[0]?.leaves.map((leave) => (
                <th
                  key={leave.leave_type_id}
                  colSpan={2}
                  className="text-center border-l border-gray-300"
                >
                  {leave.type}
                </th>
              ))}
            </tr>
            <tr>
              <th></th>
              {leavePolicies[0]?.leaves.map((leave) => (
                <React.Fragment key={leave.leave_type_id}>
                  <th className="text-sm font-normal text-gray-600 border-l border-gray-300">
                    MONTH
                  </th>
                  <th className="text-sm font-normal text-gray-600">YEAR</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {leavePolicies.map((row) => (
              <tr key={row.designation_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.designation}
                </td>
                {row.leaves.map((leave) => (
                  <React.Fragment key={leave.leave_type_id}>
                    <td className="px-4 py-2 text-center text-sm text-gray-700 border-l border-gray-300">
                      {leave.value}
                    </td>
                    <td className="px-4 py-2 text-center text-sm text-gray-700">
                      {leave.max}
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PDF Viewer Section */}
      <div>
        <h2 className="text-xl text-center font-semibold mb-4">
          Leave Policy Document
        </h2>
        <div className="border rounded shadow-md h-[80vh]">
          <embed
            src="\Lumel_Leave_Policy.pdf"
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewLeavePolicy;
