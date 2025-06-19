import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../employee/ui/ToastContainer';

const ViewEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [reportingTo, setReportingTo] = useState([]);
  const [selectedManager, setSelectedManager] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/employee');
        const data = response.data;
        setEmployees(data);
      } catch (err) {
        const message = err.response?.data?.message;
        if (err.response?.status === 403) {
          showToast(message || "You are not authorized to access this resource.", 'error');
          navigate('/');
        } else if (err.response?.status === 401) {
          showToast(message || "Session expired. Please log in again.", 'error');
          navigate('/');
        } else {
          showToast("An unexpected error occurred.", 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    const fetchReportingManager = async () => {
      try {
        const res = await axios.get(
          'http://localhost:8080/api/admin/employee-id-name-desg'
        );
        if (Array.isArray(res.data)) {
          setReportingTo(res.data);
          console.log(res.data);
        } else {
          console.error('Expected array but got:', res.data);
          setReportingTo([]);
        }
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error');
        setReportingTo([]);
      }
    };
    fetchReportingManager();
    fetchEmployees();
  }, []);

  const handleDeleteClick = (employeeId) => {
    setEmployeeToDelete(employeeId);
    setIsModalOpen(true);
  };


  const changeReportingTo =  (e) =>{
     //api.update(employee_id, reproting_to)
     const reporting_to = parseInt(e.target.value);
     setSelectedManager(reporting_to);
  }
  const confirmDelete = async () => {
    try {
      const result = await axios.put(`http://localhost:8080/api/admin/replace-reporting-manager?EmployeeID=${employeeToDelete}&ReportingTo=${selectedManager}`)
      showToast(result.data.message, 'success');
      await axios.delete(`http://localhost:8080/api/admin/employee/${employeeToDelete}`);
      setEmployees(employees.filter(emp => emp.employee_id !== employeeToDelete));
      showToast('Employee deleted successfully!', 'success');
    } catch (err) {
      showToast(err.response.data.message, 'error');
      console.error('Delete error:', err);
    } finally {
      setIsModalOpen(false);
      setEmployeeToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
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
                  onClick={() => handleDeleteClick(employee.employee_id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for delete confirmation */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this employee?</p>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reporting Manager
              </label>
              <select
                name="reporting_to"
                value={selectedManager}
                onChange={changeReportingTo}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">None</option> {/* Nullable option */}
                {reportingTo.map((emp) => (
                  <option key={emp.employee_id} value={emp.employee_id}>
                    {emp.name} ({emp.designation}) - [{emp.employee_id}]
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end mt-4 space-x-4">
            
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEmployee;
