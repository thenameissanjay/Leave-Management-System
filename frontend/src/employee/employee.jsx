import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios from 'axios';
import { Await, useNavigate } from 'react-router-dom';
import Calendar from './Calendar';

const Employee = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reportingName, setReporting] = useState('');

  const [totalLeave, setTotalLeave] = useState({
    totalSick: 0,
    totalCasual: 0,
    totalOthers: 0,
  });

  const [leaveTaken, setleaveTaken] = useState({
    sick : 0,
    casual: 0,
    others:0
  })

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeave = async (id) => {
      try {

        const response = await axios.get(`http://localhost:8080/api/employee/getTotalLeave/${id}`);
        const data = response.data;
        console.log(data)

        setTotalLeave({
          totalSick: data.total_sick,
          totalCasual: data.total_casual,
          totalOthers: data.total_others,
        });

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
    const fetchLeaveTaken = async (id) => {
      try {
        const response = await axios.get(`http://localhost:8080/api/employee/getLeave/${id}`);
        const data = response.data; // because MySQL returns array of rows
  console.log(data)
        setleaveTaken({
          sick: data.sick,
          casual: data.casual,
          others: data.others,
        });

        user.Sick= data.sick;
        user.Casual = data.casual;
        user.Others = data.others;

      } 
      catch (err) {
        
          const message = err.response?.data?.message;
          console.log(err)
          if (err.response?.status === 403) {
            alert(message || "You are not authorized to access this resource.");
          } else if (err.response?.status === 401) {
            alert(message || "Session expired. Please log in again.");
          } else {
            alert("An unexpected error occurred.");
          }
        
        
      } finally { 
        setLoading(false);
      }
    };

    const fetchName = async (id) =>{
     const results = await axios.get(`http://localhost:8080/api/employee/getName/${id}`)
     setReporting(results.data.name)
    }

      fetchLeave(user.Level); // use Level to get total leave based on policy
      fetchLeaveTaken(user?.EmployeeID)
      fetchName(user?.ReportingTo)
    
  }, [user?.Level]);

  if (error) return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  if (!user) return <div className="text-center py-4">No employee data found</div>;

  return (
    <div className = "flex flex-col">

<div className="max-w-4xl sm:min-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Employee Details</h1>

      {/* 🔝 Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Current Leave Taken</h2>
          <p><span className="font-medium">Casual Leave:</span> {user?.Casual}</p>
          <p><span className="font-medium">Sick Leave:</span> {user?.Sick}</p>
          <p><span className="font-medium">Other Leave:</span> {user?.Others}</p>
        </div>

        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Leave Allowed</h2>
          <p><span className="font-medium">Casual Leave:</span> {totalLeave?.totalCasual}</p>
          <p><span className="font-medium">Sick Leave:</span> {totalLeave?.totalSick}</p>
          <p><span className="font-medium">Other Leave:</span> {totalLeave?.totalOthers}</p>
        </div>
      </div>

      {/* 🔽 Detailed Employee Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Personal Information</h2>
          <p><span className="font-medium">Name:</span> {user?.Name}</p>
          <p><span className="font-medium">Email:</span> {user?.Email}</p>
          <p><span className="font-medium">Phone:</span> {user?.Phone}</p>
          <p><span className="font-medium">Date of Joining:</span> {new Date(user?.DateOfJoining).toLocaleDateString()}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Employment Details</h2>
          <p><span className="font-medium">Designation:</span> {user?.Designation}</p>
          <p><span className="font-medium">Reporting To:</span> {reportingName}</p>
          <p><span className="font-medium">Level:</span> {user?.Level}</p>
        </div>
      </div>
    </div>
    <div><Calendar /></div>
    </div>
    
  );
};

export default Employee;
