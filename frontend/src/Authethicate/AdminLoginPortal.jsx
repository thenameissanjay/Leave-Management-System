import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';
import { useToast } from '../employee/ui/ToastContainer';
import CryptoJS from 'crypto-js';
const secretKey = import.meta.env.VITE_SECRETKEY;

const AdminLoginPortal = () => {
  const [email, setemail] = useState('');
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const encryptedPassword = CryptoJS.AES.encrypt(
        password,
        secretKey
      ).toString();

      const response = await axios.post(
        'http://localhost:8080/api/auth/admin-login',
        {
          email: email,
          encryptedPassword: encryptedPassword,
        }
      );
      const access_token = response.data.access_token;

      setUser({ role: 'admin', access_token: access_token });
      navigate('/Admin');
      showToast('Logged Successfully', 'success');
    } catch (err) {
      const message = err.response.data.message;
      showToast(message, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Portal</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter admin email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter admin password"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login as Admin
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm text-gray-600"></p>
    </div>
  );
};

export default AdminLoginPortal;
