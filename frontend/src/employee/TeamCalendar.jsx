import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { AuthContext } from '../Context/AuthContext';
import { useToast } from './ui/ToastContainer';

const TeamCalendar = () => {
  const [teamData, setTeamData] = useState([]);
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/employee/team-calendar/${user.EmployeeID}`
        );
        setTeamData(res.data);
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.EmployeeID, currentMonth]);

  // Month selection state
  const [selectedMonth, setSelectedMonth] = useState(5); // June
  const selectedYear = 2025;

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);

  const isOnLeave = (employee, dateStr) => {
    return employee.leaves.some((leave) => {
      const from = new Date(leave.from_date);
      const to = new Date(leave.to_date);
      const curr = new Date(dateStr);
      return curr >= from && curr <= to;
    });
  };

  const getLeaveType = (employee, dateStr) => {
    const currentDate = new Date(dateStr);
    const leaves = employee.leaves.filter((leave) => {
      const from = new Date(leave.from_date);
      const to = new Date(leave.to_date);
      return currentDate >= from && currentDate <= to;
    });
    if (leaves.length === 0) return null;

    const multi = leaves.filter((leave) => leave.from_date !== leave.to_date);
    if (multi.length === 0) return 'single';

    for (const leave of multi) {
      const from = new Date(leave.from_date);
      const to = new Date(leave.to_date);
      if (currentDate.getTime() === from.getTime()) return 'start';
      if (currentDate.getTime() === to.getTime()) return 'end';
      if (currentDate > from && currentDate < to) return 'middle';
    }

    return 'single';
  };

  const getLeaveTypeColor = (employee, dateStr) => {
    const currentDate = new Date(dateStr);
    const leave = employee.leaves.find((leave) => {
      const from = new Date(leave.from_date);
      const to = new Date(leave.to_date);
      return currentDate >= from && currentDate <= to;
    });

    if (!leave) return null;

    // 42 is sick, 43 is casual, 44 is personal, 45 is LOP
    switch (leave.leaveType) {
      case 42: // sick
        return 'bg-purple-100 border-purple-300';
      case 43: // casual
        return 'bg-green-100 border-green-300';
      case 44: // personal
        return 'bg-yellow-100 border-yellow-300';
      case 45: // LOP
        return 'bg-red-100 border-red-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="overflow-x-scroll">
      <h1 className="text-2xl font-bold text-blue-600 text-center">
        Team Calendar
      </h1>
      {teamData.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">
          No team data available.
        </p>
      ) : (
        <div className="p-4 font-sans text-gray-800">
          {/* Month Selector */}
          <div className="mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>
                  {month} {selectedYear}
                </option>
              ))}
            </select>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded-full mr-1"></div>
              <span>Sick Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded-full mr-1"></div>
              <span>Casual Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-full mr-1"></div>
              <span>Personal Leave</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded-full mr-1"></div>
              <span>LOP</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-full mr-1"></div>
              <span>Weekend</span>
            </div>
          </div>

          <div className="overflow-x-auto max-w-full border rounded shadow-inner min-w-[1200px]">
            <div className="">
              {/* Calendar Header */}
              <div className=" flex font-semibold border-b rounded border-gray-200 sticky top-0 bg-white z-20">
                <div className="w-48 sticky left-0 bg-white z-30"></div>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(selectedYear, selectedMonth, day);
                  const dayOfWeek = weekdays[date.getDay()];
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={day}
                      className={`w-10 py-2 text-center text-xs font-medium uppercase border-r border-gray-100 relative ${
                        isWeekend ? 'text-blue-500' : 'text-gray-600'
                      }`}
                    >
                      {/* Weekend circle indicator */}
                      {isWeekend && (
                        <div className="absolute top-1/2 left-1/2 w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-blue-100 rounded-full z-0"></div>
                      )}
                      <span className="relative z-10">{dayOfWeek}</span>
                    </div>
                  );
                })}
              </div>{' '}
            </div>

            {/* Employee Rows */}
            {teamData.map((employee) => (
              <div
                key={employee.employee_id}
                className="flex border-b border-gray-100 hover:bg-gray-50"
              >
                {/* Employee Info */}
                <div className="w-48 sticky left-0 bg-white z-10 p-2">
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-xs text-gray-500">
                    {employee.designation}
                  </div>
                </div>

                {/* Calendar Cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(selectedYear, selectedMonth, day);
                  const dateStr = date.toISOString().split('T')[0];
                  const dayOfWeek = date.getDay();
                  const isLeaveDay = isOnLeave(employee, dateStr);
                  const leaveType = getLeaveType(employee, dateStr);
                  const leaveColor = getLeaveTypeColor(employee, dateStr);

                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <div
                      key={day}
                      className={`w-10 h-10 flex items-center justify-center relative`}
                    >
                      {isWeekend && (
                        <div className="absolute w-7 h-7 bg-blue-100 border border-blue-300 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"></div>
                      )}
                      <div className="z-10 text-sm rounded-full">{day}</div>

                      {/* Leave Indicators */}
                      {isLeaveDay && !isWeekend && (
                        <>
                          {leaveType === 'single' && (
                            <div
                              className={`absolute w-7 h-7 rounded-full z-0 ${leaveColor}`}
                            ></div>
                          )}
                          {leaveType === 'start' && (
                            <div
                              className={`absolute w-7 h-7 rounded-full z-0 ${leaveColor}`}
                            ></div>
                          )}
                          {leaveType === 'middle' && (
                            <div
                              className={`absolute w-7 h-7 rounded-full z-0 ${leaveColor}`}
                            ></div>
                          )}
                          {leaveType === 'end' && (
                            <div
                              className={`absolute w-7 h-7 rounded-full z-0 ${leaveColor}`}
                            ></div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamCalendar;
