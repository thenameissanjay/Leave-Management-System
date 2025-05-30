import { Link } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import React, { useContext } from 'react';

const EmployeeSidebar = () => {
  const { user } = useContext(AuthContext);
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-blue-800 text-white shadow-lg">
      <div className="p-4 text-xl font-bold border-b border-blue-700">
        Welcome {user?.Name}
      </div>
      <nav className="mt-4">
        <Link to="/Employee" className="block px-4 py-3 hover:bg-blue-700">My Dashboard</Link>
        <Link to="/IncomingRequest" className="block px-4 py-3 hover:bg-blue-700">Incoming Requests</Link>
        <Link to="/RequestForm" className="block px-4 py-3 hover:bg-blue-700"> Requests Form</Link>
        <Link to="/RequestStatus" className="block px-4 py-3 hover:bg-blue-700">My Leave  Status</Link>
      </nav>
      <Link to="/" className="block px-4 py-3 hover:bg-blue-700">Log Out</Link>

    </div>
  );
};

export default EmployeeSidebar;