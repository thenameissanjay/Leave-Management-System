import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../employee/ui/ToastContainer';
import api from '../utils/BaseUrl';

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    reporting_to: '',
    date_of_joining: ''
  });


  // Fetch employee data on component mount
  useEffect(() => {
    console.log('hello')
    const fetchEmployee = async () => {
      try {
        const response = await api.get(`/api/admin/employee/${id}`);
        setValues(response.data);

      } catch (err) {
        {
          
          const message = err.response?.data?.message;
          console.log(err)
          if (err.response?.status === 403) {
            showToast(message || "You are not authorized to access this resource.", 'error');
            navigate('/')
          } else if (err.response?.status === 401) {
            showToast(message || "Session expired. Please log in again.", 'error');
            navigate('/')

          } else {
            showToast("An unexpected error occurred.", 'error');
          }
        } 
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/admin/employee/${id}`, values);
      showToast('Employee updated successfully!', 'success');
      navigate('/ViewEmployee'); 
    } catch (error) {
      console.error('Error updating employee:', error);
      showToast('Failed to update employee. Please try again.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-100">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center text-red-300 mb-6">Update Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ['name', 'Full Name', 'text'],
            ['email', 'Email', 'email'],
            ['phone', 'Phone Number', 'tel'],
            ['designation', 'Designation', 'text'],
            ['reporting_to', 'Reporting Manager ID(s)', 'text']
          ].map(([name, label, type]) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                name={name}
                type={type}
                value={values[name]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              name="level"
              value={values.level}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Level</option>
              <option value="L1">L1 (Intern)</option>
              <option value="L2">L2 (Lead)</option>
              <option value="L3">L3 (Manager)</option>
              <option value="L4">L4 (HR/Admin)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Joining</label>
            <input
              name="date_of_joining"
              type="date"
              value={values.date_of_joining}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEmployee;