import React, {
  captureOwnerStack,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import TeamCalendar from './TeamCalendar';
import ViewLeavePolicy from './LeavePolicy';
import HolidaysCalendarModal from './HolidayCalendar'; //
import LeaveCards from './ui/leaveCards';
import { useToast } from './ui/ToastContainer';
// import TeamCalendar from './ui/teamcalendar';
const Employee = () => {
  const { showToast } = useToast();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reportingName, setReporting] = useState('');
  const [designation, setDesignation] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportingName = async (ReportingManagerID) => {
      const results = await axios.get(
        `http://localhost:8080/api/employee/ReportingManagerName/${ReportingManagerID}`
      );
      setReporting(results.data.name);
    };

    const fetchDesignationName = async (DesignationID) => {
      const result = await axios.get(
        `http://localhost:8080/api/employee/DesignationName/${DesignationID}`
      );
      setDesignation(result.data[0].name);
    };
    fetchReportingName(user?.ReportingTo);
    fetchDesignationName(user?.Designation);
  }, [user]);

  if (error)
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  if (!user)
    return <div className="text-center py-4">No employee data found</div>;

  return (
    <>
      <div className="">
        <div className="max-w-4xl sm:max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <div className="relative mb-6">
            <h1 className="text-2xl font-bold text-center text-blue-600">
              Employee Dashboard
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              View Holidays
            </button>
          </div>

          <HolidaysCalendarModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
          {/* 🔽 Detailed Employee Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 mx-8 gap-6">
            <div className="space-y-4">
              <p>
                <span className="font-medium">Employee ID:</span>{' '}
                {user?.EmployeeID}
              </p>
              <p>
                <span className="font-medium">Name:</span> {user?.Name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {user?.Email}
              </p>
            </div>

            <div className="space-y-4">
              <p>
                <span className="font-medium">Designation:</span> {designation}
              </p>
              <p>
                <span className="font-medium">Reporting To:</span>{' '}
                {reportingName}
              </p>
              <p>
                <span className="font-medium">Date of Joining:</span>{' '}
                {new Date(user?.DateOfJoining).toLocaleDateString()}
              </p>
            </div>
          </div>
          <LeaveCards />
          <div className="overflow-x-auto w-full px-4">
            <TeamCalendar />
          </div>
        </div>
      </div>
    </>
  );
};

export default Employee;
