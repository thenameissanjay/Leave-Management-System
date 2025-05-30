import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/getEmployee');
        
        const data = response.data;
        console.log(response.data)
        setEmployees(data);
      } catch (err) {
        {
          const message = err.response?.data?.message;
          console.log(err)
          if (err.response?.status === 403) {
            alert(message || "You are not authorized to access this resource.");
            navigate('/');
          } else if (err.response?.status === 401) {
            alert(message || "Session expired. Please log in again.");
            navigate('/');
          } else {
            alert("An unexpected error occurred.");
          }
        }    
        } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/deleteEmployee/${employeeId}`);
        setEmployees(employees.filter(emp => emp.employee_id !== employeeId));
        alert('Employee deleted successfully!');
      } catch (err) {
        alert('Failed to delete employee');
        console.error('Delete error:', err);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error}</span>
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Employee List</h1>
        <button
          onClick={() => navigate('/CreateEmployee')}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-200"
        >
          Create New Employee
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.employee_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{employee.name}</h2>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-medium">ID:</span> {employee.employee_id}</p>
                <p><span className="font-medium">Email:</span> {employee.email}</p>
                <p><span className="font-medium">Phone:</span> {employee.phone}</p>
                <p><span className="font-medium">Designation:</span> {employee.designation}</p>
                <p><span className="font-medium">Level:</span> {employee.level}</p>
                <p><span className="font-medium">Joined:</span> {employee.date_of_joining}</p>
              </div>

              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => navigate(`/UpdateEmployee/${employee.employee_id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200"
                >
                  Update
                </button>
                
                <button
                  onClick={() => handleDelete(employee.employee_id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewEmployee;