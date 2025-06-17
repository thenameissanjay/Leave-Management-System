import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import { useToast } from "../employee/ui/ToastContainer";

import axios from 'axios';
import CryptoJS from "crypto-js";



const EmployeeLoginPortal = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { showToast } = useToast();
  const [employeeId, setEmployeeId] = useState(''); // Only used in Set Password
  const [email, setEmail] = useState(''); // Used in both forms
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const secretKey = import.meta.env.VITE_SECRETKEY;

  const handleEmployeeLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();
    
      const response = await axios.post("http://localhost:8080/api/auth/employee-login", {
        email,
        encryptedPassword
      });
      // JWT token from backend
      const access_token = response.data.access_token;
      
      setUser({ 
        role: 'employee',   // for navbar, req.header.role = "employee"
        EmployeeID: response.data.employeeId,
      Name:response.data.name, 
      Email: response.data.email, 
      Phone:response.data.phone,
       DateOfJoining: response.data.date_of_joining,
        Designation: response.data.designation, 
        ReportingTo:response.data.reporting_to,
        access_token : access_token         
      });
      navigate('/Employee');
      showToast('Logged Successfully', 'success')
    } catch (error) {
      const message = error.response?.data?.message;
     showToast(message, 'error');
    }
  };

  const handleEmployeeSignUp = async (e) => {
    e.preventDefault();
    try {
      if (!employeeId || !email || !password) {
        setError('Please fill all fields');
        return;
      }

      const numericId = Number(employeeId);
      if (isNaN(numericId)) {
        setError('Employee ID must be a number');
        return;
      }
      const secretKey = import.meta.env.VITE_SECRETKEY;
      const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();
      const response = await axios.post("http://localhost:8080/api/auth/password", {
        id: numericId,
        email,
        encryptedPassword
      });
      setIsLogin(true);
      showToast("Password Created Succesfully", 'success')
    } catch (error) {
      showToast(error.response?.data?.message, 'error')
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Employee Login' : 'Set Password'}
      </h2>
      
      <form onSubmit={isLogin ? handleEmployeeLogin : handleEmployeeSignUp} className="space-y-4">
        {/* Employee ID field - only shown in Set Password form */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your employee ID"
              required
            />
          </div>
        )}

        {/* Email field - shown in both forms */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your company email"
            required
          />
        </div>

        {/* Password field - shown in both forms */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {isLogin ? 'Password' : 'Create Password'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={isLogin ? 'Enter your password' : 'Create a new password'}
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLogin ? 'Login' : 'Set Password'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            // Clear fields when switching modes
            setPassword('');
            if (!isLogin) {
              setEmployeeId('');
            }
          }}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {isLogin ? 'Need to set password?' : 'Already have password? Login'}
        </button>
      </div>
    </div>
  );
};

export default EmployeeLoginPortal;