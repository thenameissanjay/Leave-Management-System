import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DesignationManagement  from './designation';
import LeaveLevelManager  from './LeaveLevel';
import { useNavigate } from 'react-router-dom';

const LeavePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    level: '',
    sick: '',
    casual: '',
    others: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeave = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/leavepolicy/getLeave');
        const data = await response.data;
        setPolicies(data);
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
        console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeave();
  }, []);

  const handleEditChange = (index, name, value) => {
    const updated = [...policies];
    updated[index][name] = value;
    setPolicies(updated);
  };

  const handleSave = async (index) => {
    const policy = policies[index];
    try {
      await axios.put(`http://localhost:8080/api/leavepolicy/updateLeave/${policy.id}`, policy);
      setEditIndex(null);
      alert('Policy updated successfully!');
    } catch (err) {
      
      console.error('Error saving policy:', err);
      alert('Failed to update policy');
    }
  };

  const handleDelete = async (level) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the leave policy for ${level}?`);
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`http://localhost:8080/api/leavepolicy/deleteLeave/${level}`);
      setPolicies(policies.filter(policy => policy.level !== level));
      alert('Policy deleted successfully!');
    } catch (err) {
  
      console.error('Error deleting policy:', err);
      alert('Failed to delete policy');
    }
  };
  
  const handleCreate = async () => {
    if (!newPolicy.level || !newPolicy.sick || !newPolicy.casual || !newPolicy.others) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/leavepolicy/createLeave', newPolicy);
      setPolicies([...policies, res.data]);
      setNewPolicy({ level: '', sick: '', casual: '', others: '' });
      alert('Policy created successfully!');
    } catch (err) {
   
      console.error('Error creating policy:', err);
      alert('Failed to create policy');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Leave Policies Management</h1>

      {/* Policies Table */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border-b-2 border-gray-200">Level</th>
              <th className="p-3 border-b-2 border-gray-200">Sick Leave</th>
              <th className="p-3 border-b-2 border-gray-200">Casual Leave</th>
              <th className="p-3 border-b-2 border-gray-200">Other Leave</th>
              <th className="p-3 border-b-2 border-gray-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length > 0 ? (
              policies.map((policy, index) => (
                <tr key={policy.level} className="hover:bg-gray-50">
                  {['level', 'total_sick', 'total_casual', 'total_others'].map((field) => (
                    <td key={field} className="p-3 border-b border-gray-200">
                      <input
                        type={field === 'level' ? 'text' : 'number'}
                        value={policy[field]}
                        readOnly={editIndex !== index}
                        onChange={(e) => handleEditChange(index, field, e.target.value)}
                        className={`w-full p-2 rounded ${editIndex === index ? 'border border-gray-300' : 'border-none bg-transparent'}`}
                      />
                    </td>
                  ))}
                  <td className="p-3 border-b border-gray-200 text-center">
                    <div className="flex justify-center space-x-2">
                      {editIndex === index ? (
                        <button
                          onClick={() => handleSave(index)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditIndex(index)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(policy.level)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No leave policies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create New Policy */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Create New Leave Policy</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <input
              type="text"
              placeholder="e.g. Manager"
              value={newPolicy.level}
              onChange={(e) => setNewPolicy({ ...newPolicy, level: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sick Days</label>
            <input
              type="number"
              placeholder="Days"
              value={newPolicy.sick}
              onChange={(e) => setNewPolicy({ ...newPolicy, sick: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Casual Days</label>
            <input
              type="number"
              placeholder="Days"
              value={newPolicy.casual}
              onChange={(e) => setNewPolicy({ ...newPolicy, casual: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Days</label>
            <input
              type="number"
              placeholder="Days"
              value={newPolicy.others}
              onChange={(e) => setNewPolicy({ ...newPolicy, others: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition duration-200"
            >
              Add Policy
            </button>
          </div>
        </div>
      </div>
     < DesignationManagement/>
     <LeaveLevelManager/>
    </div>
  );
};

export default LeavePolicy;