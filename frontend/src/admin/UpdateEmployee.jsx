import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../employee/ui/ToastContainer';

const UpdateEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    designation: null,
    reporting_to: null,
    date_of_joining: '',
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/admin/employee/${id}`
        );
        const emp = res.data;
        console.log(emp);
        setValues({
          name: emp.name || '',
          email: emp.email || '',
          phone: emp.phone || '',
          designation: emp.designation,
          reporting_to: emp.reporting_to,
          date_of_joining: emp.date_of_joining || '',
        });
        
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message || 'Failed to fetch employee data', 'error');
        navigate('/');
      }
    };

    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/admin/employee-id-name-desg'
        );
        setEmployees(Array.isArray(res.data) ? res.data : []);
        console.log(res.data);
      } catch (err) {
        showToast(
          err.response?.data?.message || 'Failed to load managers',
          'error'
        );
        setEmployees([]);
      }
    };

    const fetchDesignations = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/designation/designation'
        );
        setDesignations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        showToast(
          err.response?.data?.message || 'Failed to load designations',
          'error'
        );
        setDesignations([]);
      }
    };

    fetchEmployee();
    fetchEmployees();
    fetchDesignations();
  }, [id]);

  useEffect(() => {
    console.log(values);
  }, [values]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      await axios.put(
        `http://localhost:8080/api/admin/employee/${id}`,
        values
      );
      showToast('Employee updated successfully', 'success');
      navigate('/ViewEmployee');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Update failed', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-100">
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold text-center text-red-300 mb-6">
          Update Employee
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              required
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
              pattern="^.+@.+\.com$"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <input
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              pattern="\d{10}"
              title="Phone number must be exactly 10 digits"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Designation <span className="text-gray-400">(optional)</span>
            </label>
            <select
              name="designation"
              value={values.designation} // This should be the ID, like "manager"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">None</option>
              {designations.map((desg) => (
                <option key={desg.id} value={desg.id}>
                  {desg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reporting Manager{' '}
              <span className="text-gray-400">(optional)</span>
            </label>
            <select
              name="reporting_to"
              value={values.reporting_to} // Now directly using the employee ID
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">None</option>
              {employees.map((emp) => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.designation}) - [{emp.employee_id}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Joining
            </label>
            <input
              name="date_of_joining"
              type="date"
              value={values.date_of_joining || ''}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="text-center">
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
