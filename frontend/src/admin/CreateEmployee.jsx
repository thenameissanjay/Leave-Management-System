import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const CreateEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]); // new for designation list
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    reporting_to: '',
    level: '',
    casual: 0,
    sick: 0,
    others: 0,
    date_of_joining: '',
    password: ''
  });

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
      const response = await axios.post('http://localhost:8080/api/admin/createEmployee', values);
      alert('Employee created successfully!');
      console.log(response.data);
      setValues({
        name: '',
        email: '',
        phone: '',
        designation: '',
        reporting_to: '',
        level: '',
        casual: 0,
        sick: 0,
        others: 0,
        date_of_joining: '',
        password: ''
      });
    } catch (err) {
      {
        const message = err.response?.data?.message;
        console.log(err)
        if (err.response?.status === 403) {
          alert(message || "You are not authorized to access this resource.");
          navigate('/');
        } else if (err.response?.status === 401) {
          alert(message || "Session expired. Please log in again.");
          navigate('/');

        } else {
          alert("An unexpected error occurred.");
        }
      }
      console.error('Error creating employee:', err);
      alert('Failed to create employee. Please try again.');
    }
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/admin/getIdNameDesg');
        if (Array.isArray(res.data)) {
          setEmployees(res.data);
        } else {
          console.error('Expected array but got:', res.data);
          setEmployees([]);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
        setEmployees([]);
      }
    };

    const fetchDesignations = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/designation/getDesignation');
        if (Array.isArray(res.data)) {
          setDesignations(res.data);
          console.log(res.data)
        } else {
          console.error('Expected array but got:', res.data);
          setDesignations([]);
        }
      } catch (err) {
        console.error('Error fetching designation data:', err);
        setDesignations([]);
      }
    };

    fetchEmployees();
    fetchDesignations();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-100">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center text-red-300 mb-6">Create Employee</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              pattern="\d{10}"
              title="Phone number must be exactly 10 digits"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <select
              name="designation"
              value={values.designation}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Designation</option>
              {designations.map((desg, idx) => (
                <option key={idx} value={desg.id}>
                  {desg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reporting Manager</label>
            <select
              name="reporting_to"
              value={values.reporting_to}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Manager</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.designation}) - [{emp.employee_id}]
                </option>
              ))}
            </select>
          </div>

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

          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployee;
