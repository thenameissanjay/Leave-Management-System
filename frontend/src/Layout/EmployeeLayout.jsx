import { NavLink } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import React, { useContext } from 'react';

const EmployeeSidebar = () => {
  const { user } = useContext(AuthContext);

  const linkClass = 'block px-4 py-3 hover:bg-blue-700 transition duration-200';
  const activeClass = 'bg-blue-900 font-semibold border-l-4 border-white pl-3';

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-blue-800 text-white shadow-lg">
      <div className="p-4 text-xl font-bold border-b border-blue-700">
        Welcome {user?.Name}
      </div>
      <nav className="mt-4">
        <NavLink
          to="/Employee"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          My Dashboard
        </NavLink>

        {user?.Designation != 38 && (
          <NavLink
            to="/IncomingRequest"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ''}`
            }
          >
            Incoming Requests
          </NavLink>
        )}

        <NavLink
          to="/RequestForm"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          Requests Form
        </NavLink>

        <NavLink
          to="/RequestStatus"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? activeClass : ''}`
          }
        >
          My Leave Status
        </NavLink>

        <NavLink
          to="/ViewLeavePolicy"
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
          `${linkClass} ${isActive ? activeClass : ''}`
        }
      >
        Log Out
      </NavLink>
    </div>
  );
};

export default EmployeeSidebar;
