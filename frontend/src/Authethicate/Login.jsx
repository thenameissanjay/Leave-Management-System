import { useState } from 'react';
import AdminLoginPortal from './AdminLoginPortal';
import EmployeeLoginPortal from './EmployeeLoginPortal';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex border-b">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'admin' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Login
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'employee' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('employee')}
        >
          Employee Portal
        </button>
      </div>
      
      <div className="mt-4">
        {activeTab === 'admin' ? <AdminLoginPortal /> : <EmployeeLoginPortal />}
      </div>
    </div>
  );
};

export default LoginPage;