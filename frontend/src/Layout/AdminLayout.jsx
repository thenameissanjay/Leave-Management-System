import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
  const linkClass = 'block px-4 py-3 hover:bg-gray-700 transition duration-200';
  const activeClass = 'bg-gray-900 font-semibold border-l-4 border-white pl-3';

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-gray-800 text-white shadow-lg">
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        Admin Panel
      </div>
      <nav className="mt-4">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/CreateEmployee"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          Create Employee
        </NavLink>
        <NavLink
          to="/ViewEmployee"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          View Employee
        </NavLink>
        <NavLink
          to="/LeavePolicy"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          Leave Policy
        </NavLink>
      </nav>
      <NavLink
        to="/"
        className={({ isActive }) =>
          `block px-4 py-3 hover:bg-blue-700 transition duration-200 ${
            isActive ? 'bg-blue-900 font-semibold' : ''
          }`
        }
      >
        Log Out
      </NavLink>
    </div>
  );
};

export default AdminSidebar;
