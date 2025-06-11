import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Context/AuthContext';

const LeaveCards = () => {
    const [leaveData , setLeaveData] = useState([]);
    const { user } = useContext(AuthContext);


    useEffect(() => {
        const fetchLeave = async (id) => {

          try {
            const response = await axios.get(`http://localhost:8080/api/employee/total-leave/${user.EmployeeID}`);
            console.log( response);
            const data = response.data;
            setLeaveData(data);
          } catch (err) {
            {
                console.log(err)
              const message = err.response?.data?.message;
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
          }
        };
        fetchLeave();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          {leaveData.map((leave, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-100"
            >
              <h2 className="text-xl font-semibold mb-2 text-blue-600">
                {leave.leave_type_name} Leave
              </h2>
              <p className="text-gray-600">
                <span className="font-medium">Total:</span> {leave.total_leave}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Taken:</span> {leave.leave_taken}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Balance:</span> {leave.balance_leave}
              </p>
            </div>
          ))}
        </div>
      );
}

export default LeaveCards