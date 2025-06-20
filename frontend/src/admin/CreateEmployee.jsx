import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../employee/ui/ToastContainer';
import BulkUpload from './BulkUpload';
const CreateEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    designation: null,
    reporting_to: null,
    date_of_joining: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(values);

      const response = await axios.post(
        'http://localhost:8080/api/admin/employee',
        values
      );
      showToast('Employee Added Successfully', 'success');
      setValues({
        name: '',
        email: '',
        phone: '',
        designation: null,
        reporting_to: null,
        date_of_joining: '',
      });
    } catch (err) {
      {
        console.log(err);
        const message = err.response?.data?.message;
        showToast(message, 'error');
      }
    }
  };

  useEffect(() => {
    const fetchReportingManager = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/admin/employee-id-name-desg'
        );
        if (Array.isArray(res.data)) {
          setEmployees(res.data);
          console.log(res.data);
        } else {
          console.error('Expected array but got:', res.data);
          setEmployees([]);
        }
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error');
        setEmployees([]);
      }
    };

    const fetchDesignations = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/designation/designation'
        );
        if (Array.isArray(res.data)) {
          setDesignations(res.data);
          console.log(res.data);
        } else {
          console.error('Expected array but got:', res.data);
          setDesignations([]);
        }
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error');
        setDesignations([]);
      }
    };

    fetchReportingManager();
    fetchDesignations();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center pl-12 bg-grey-100">
      <div className="flex gap-4 w-full">
        <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-6">
          <h2 className="text-2xl font-bold text-center text-red-300 mb-6">
            Create Employee
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
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
                pattern = '^.+@.+.com$'
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
                value={values.designation || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">None</option> {/* Nullable Option */}
                {designations.map((desg, idx) => (
                  <option key={idx} value={desg.id}>
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
                value={values.reporting_to || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">None</option> {/* Nullable option */}
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
                value={values.date_of_joining}
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
                Submit
              </button>
            </div>
          </form>
        </div>
        <BulkUpload />
      </div>
    </div>
  );
};

export default CreateEmployee;
