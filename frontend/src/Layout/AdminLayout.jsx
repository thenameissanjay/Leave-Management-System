import { Link } from 'react-router-dom';

const AdminSidebar = () => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white shadow-lg">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="mt-4">
      <Link to="/admin" className="block px-4 py-3 hover:bg-gray-700">Home</Link>
        <Link to="/CreateEmployee" className="block px-4 py-3 hover:bg-gray-700">CreateEmployee</Link>
        <Link to="/ViewEmployee" className="block px-4 py-3 hover:bg-gray-700">ViewEmployee</Link>
        <Link to="/LeavePolicy" className="block px-4 py-3 hover:bg-gray-700">Leave Policy</Link>
      </nav>
      <Link to="/" className="block px-4 py-3 hover:bg-blue-700">Log Out</Link>

    </div>
  );
};

export default AdminSidebar;