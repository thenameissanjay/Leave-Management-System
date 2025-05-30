import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';

const RequestForm = () => {
  const { user } = useContext(AuthContext);

  const [level_no, setLevelNo] = useState(); // Default level
  const [roles, setRoles] = useState([]); // Default roles
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    employeeId: user?.EmployeeID || '',
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
    leaveCount: 0,
    reportingManagers: [], // initialize empty managers
  });

  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Function to calculate number of days
  const calculateLeaveDays = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const timeDiff = end - start;
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff + 1;
  };

  // Fetch managers for each role
  const fetchManagers = async (rolesList) => {
    try {
      setLoading(true);
      console.log('IIII' + rolesList)
      const promises = rolesList.map(async (role) => {
        const response = await axios.get(`http://localhost:8080/api/employee/getWhereDesg/?role=${role}`);
        return response.data || [];
      });

      const results = await Promise.all(promises);

      setDropdownOptions(results);
    } catch (error) {
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
      console.error("Error fetching managers:", error);
    } finally {
      setLoading(false);
    }
  };

  const LeaveLevel = async (fromDate, toDate, leaveCount) => {
    try {
      setLoading(true);

      const response = await axios.post(`http://localhost:8080/api/employee/getLeaveLevelOrder`, {
        fromDate,
        toDate,
        leaveCount
      });

      const data = response.data[0];
      console.log(data)
      const newLevelNo = data.level_no || 2; // fallback default
      const newRoles = [];

      if (newLevelNo >= 1) newRoles.push(data.level_1);
      if (newLevelNo >= 2) newRoles.push(data.level_2);
      if (newLevelNo >= 3) newRoles.push(data.level_3);

      setLevelNo(newLevelNo);

      setRoles(newRoles);
      
      setFormData((prev) => ({
        ...prev,
        reportingManagers: Array(newLevelNo).fill(''),
      }));
     console.log(formData.reportingManagers.length)

    } catch (error) {
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
      console.error("Error fetching leave level:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (roles.length > 0) {
      fetchManagers(roles);
    }
  }, [roles]);

  useEffect(() => {
    console.log('Before updating reportingManagers:', formData.reportingManagers);
    setFormData((prev) => ({
      ...prev,
      reportingManagers: Array(level_no).fill(''),
    }));
    console.log('After setting reportingManagers:', formData.reportingManagers);
  }, [level_no]);
  
  useEffect(() => {
    const fetchEmployees = async (id) => {
      try {
        const res = await axios.get(`http://localhost:8080/api/employee/getIdNameDesg/${id}`);
        if (Array.isArray(res.data)) {
          setEmployees(res.data[0]);
          console.log(employees)
        } else {
          console.error('Expected array but got:', res.data);
          setEmployees([]);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setEmployees([]);
      }
    }; 
    console.log(user?.ReportingTo)
    fetchEmployees(user?.ReportingTo);
  }, []);
  

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // If dates change, recalculate leave count
      if (updatedData.fromDate && updatedData.toDate) {
        const leaveCount = calculateLeaveDays(updatedData.fromDate, updatedData.toDate);
        updatedData.leaveCount = leaveCount;
      }

      return updatedData;
    });

    if (name === 'fromDate' || name === 'toDate') {
      const updatedFromDate = name === 'fromDate' ? value : formData.fromDate;
      const updatedToDate = name === 'toDate' ? value : formData.toDate;

      if (updatedFromDate && updatedToDate) {
        const leaveCount = calculateLeaveDays(updatedFromDate, updatedToDate);
        if (leaveCount > 0) {
          await LeaveLevel(updatedFromDate, updatedToDate, leaveCount);
        }
      }
    }

    setError('');
  };

  const handleManagerChange = (index, value) => {
    const updatedManagers = [...formData.reportingManagers];
    updatedManagers[index] = value;
    setFormData({ ...formData, reportingManagers: updatedManagers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { leaveType, fromDate, toDate, reason, reportingManagers } = formData;

    if (!leaveType || !fromDate || !toDate || !reason || reportingManagers.some((m) => !m)) {
      setError('All fields are required.');
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/leave/requestLeave', formData);
      setMessage('Leave request submitted successfully!');
      setError('');
      setFormData({
        employeeId: user?.EmployeeID || '',
        leaveType: '',
        fromDate: '',
        toDate: '',
        reason: '',
        leaveCount: 0,
        reportingManagers: Array(level_no).fill(''),
      });
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
      console.error(err);
      setError('Failed to submit leave request.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Request Leave</h2>

      {error && <p className="text-red-500 mb-3 text-center">{error}</p>}
      {message && <p className="text-green-600 mb-3 text-center">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Leave Type</label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value=""> Select Leave Type </option>
            <option value="Casual">Casual</option>
            <option value="Sick">Sick</option>
            <option value="Others">Others</option>
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">From Date</label>
          <input
            type="date"
            name="fromDate"
            value={formData.fromDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">To Date</label>
          <input
            type="date"
            name="toDate"
            value={formData.toDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Reason</label>
          <textarea
            name="reason"
            rows="4"
            value={formData.reason}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Enter reason for leave"
          ></textarea>
        </div>

        <div>
          <label className="block font-medium mb-2">Reporting Managers</label>
          {console.log(level_no)}
          {Array.from({ length: level_no }).map((_, index) => (
  <div key={index} className="flex items-center space-x-2 mb-2">
    <select
      value={formData.reportingManagers[index] || ''}
      onChange={(e) => handleManagerChange(index, e.target.value)}
      className="flex-1 border border-gray-300 rounded px-3 py-2"
      disabled={loading || !roles[index]}
      required
    >
      <option value="">Select {roles[index] || 'Manager'}</option>
      {roles[index] === 'Reporting Manager' ? (
        <option 
          value={user?.ReportingTo || ''}
          key={user?.ReportingTo || 'reporting_to'}
        >
          {employees.employee_id} ({employees.name}) - [{employees.designation}]
        </option>
      ) : (
        dropdownOptions[index]?.map((emp) => (
          <option key={emp.employee_id} value={emp.employee_id}>
            {emp.name} ({emp.designation}) - [{emp.employee_id}]
          </option>
        ))
      )}
    </select>
  </div>
))}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Submit Leave Request
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
