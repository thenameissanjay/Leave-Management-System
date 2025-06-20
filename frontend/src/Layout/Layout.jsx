import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';
import AdminSidebar from './AdminLayout';
import EmployeeSidebar from './EmployeeLayout';

const Layout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen">
      {/* Conditional Sidebar Rendering */}
      
      {user.role === 'admin' ? <AdminSidebar /> : <EmployeeSidebar />}
      
      <div className="flex-1 ml-50 pl-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;