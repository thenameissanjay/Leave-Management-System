// RequestForm.jsx
import React, { use, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../Context/AuthContext';
import axios, { formToJSON } from 'axios';
import { useToast } from './ui/ToastContainer';
import HolidaysList from '../utils/Holidays';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import HolidaysCalendar from './HolidayCalendar';
import { useNavigate } from 'react-router-dom';

const RequestForm = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employee_id: user?.EmployeeID || '',
    leaveType: 0,
    fromDate: '',
    toDate: '',
    reason: '',
    leaveCount: 0,
    day_type: 'fullDay',
    designation: user.Designation,
    requestAt: '',
  });

  // Updated function to exclude Saturdays and Sundays
  const calculateLeaveDays = (fromDate, toDate) => {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    let count = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.getDay(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) {
        count++;
      }
    }
    return count;
  };
  // Convert to a lookup map for efficiency
  const dateMap = Object.fromEntries(
    HolidaysList.map(({ date, isFloater }) => [date, isFloater])
  ); // {date: true}, {......}
  const getClassForDate = (date) => {
    const key = date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local timezone
    if (key in dateMap) {
      console.log(dateMap);
      return dateMap[key]
        ? 'bg-green-300 text-white rounded-full'
        : 'bg-yellow-300 text-black rounded-full';
    }
    return '';
  };
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/employee/leave-id/${user.EmployeeID}`
        );
        console.log(res.data);
        setLeaveTypes(res.data);
      } catch (err) {
        const message = err.response?.data?.message;
        showToast(message, 'error');
      }
    };
    fetchLeaveTypes();
  }, [user.EmployeeID]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (updated.fromDate && updated.toDate) {
        updated.leaveCount = calculateLeaveDays(
          updated.fromDate,
          updated.toDate
        );
        if(updated.day_type != "fullDay")
        {
          updated.leaveCount = updated.leaveCount * 0.5;
        }
      }
      return updated;
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { leaveType, fromDate, toDate, reason } = formData;
    if (!leaveType || !fromDate || !toDate || !reason) {
      showToast('All fields are required.', 'error');
      return;
    }

    // checking the leave balance is zero
    if (leaveTypes[formData.leaveType]?.balance === 0) {
      showToast('No Sufficent Leave Balance', 'error');
    }

    // checking correct floater leave
    if (formData.leaveType == 49) {
      const startDate = new Date(formData.fromDate);
      const endDate = new Date(formData.toDate);

      const selectedDates = [];
      const current = new Date(startDate);

      while (current <= endDate) {
        const dateString = current.toISOString().split('T')[0];
        selectedDates.push(dateString);
        current.setDate(current.getDate() + 1);
      }

      const dateMap = Object.fromEntries(
        HolidaysList.map(({ date, isFloater }) => [date, isFloater])
      );

      const allAreFloaters = selectedDates.every(
        (date) => dateMap[date] === true
      );
      if (allAreFloaters == false) {
        return showToast('Pick Correct floater Leave', 'error');
      }
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        leaveType: parseInt(formData.leaveType),
        requestAt: new Date().toISOString(), // e.g. "2025-06-04T09:23:15.123Z"
      };
      console.log(payload);
      await axios.post(
        'http://localhost:8080/api/leave/request-leave',
        payload
      );
      setMessage('Leave request submitted successfully!');
      setError('');
      setFormData({
        employee_id: user?.EmployeeID || '',
        leaveType: 0,
        fromDate: '',
        toDate: '',
        reason: '',
        leaveCount: 0,
        day_type: 'fullDay',
        designation: user.Designation,
      });
    } catch (err) {
      const message =
        err.status === 408
          ? err.response.data.message
          : err.response.data.message;
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md ">
      <div className="flex justify-between items-center mb-4 gap-x-4">
        <h2 className="text-2xl font-bold text-gray-800">Request Leave</h2>

        <button
          onClick={() => navigate('/ViewLeavePolicy')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          View Leave Policy
        </button>
      </div>

      {error && <p className="text-red-500 mb-3 text-center">{error}</p>}
      {message && <p className="text-green-600 mb-3 text-center">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Leave Request Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Calendar Legend */}
          <div className="bg-gray-50 p-4 rounded shadow">
            <div className="flex flex-row gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-300 border border-gray-400"></div>
                <span>Non-Floater Holiday</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-400 border border-gray-400"></div>
                <span>Floater Holiday</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-[3]">
              <label className="block font-medium mb-1">Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Leave Type</option>
                {Object.entries(leaveTypes).map(([id, { name, balance }]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-[1]">
              <div>
                <label className="block font-medium mb-1">
                  Available Balance
                </label>
                <input
                  type="text"
                  value={`${
                    leaveTypes[formData.leaveType]?.balance ?? '0'
                  } days`}
                  readOnly
                  className="border border-gray-300 rounded px-3 py-2 bg-gray-100 text-gray-700"
                />
              </div>
            </div>
          </div>
          {/* Leave Type */}

          <div className="flex flex-row gap-4">
            {/* From Date */}
            <div>
              <label className="block font-medium mb-1">From Date</label>
              <DatePicker
                selected={
                  formData.fromDate ? new Date(formData.fromDate) : null
                }
                onChange={(e) => {
                  const formatted = e.toLocaleDateString('en-CA'); // safer
                  const target = { name: 'fromDate', value: formatted };
                  handleChange({ target });
                }}
                dayClassName={getClassForDate}
                className="w-full border border-gray-300 rounded px-3 py-2"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select From Date"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block font-medium mb-1">To Date</label>
              <DatePicker
                selected={formData.toDate ? new Date(formData.toDate) : null}
                onChange={(e) => {
                  const formatted = e.toLocaleDateString('en-CA'); // safer
                  const target = { name: 'toDate', value: formatted };
                  handleChange({ target });
                }}
                dayClassName={getClassForDate}
                className="w-full border border-gray-300 rounded px-3 py-2"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select To Date"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block font-medium mb-1">Reason</label>
            <textarea
              name="reason"
              rows="4"
              maxLength={100}
              value={formData.reason}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter reason for leave (max 100 characters)"
            ></textarea>
          </div>

          <div className='flex gap-4'>
            <div>
              <label className="block font-medium mb-1">
                Day type
              </label>
              <select
                name="day_type"
                value={formData.day_type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Day Type</option>
                <option value="fullDay">Full Day</option>
                <option value="firstHalf">First Half</option>
                <option value="secondHalf">Second Half</option>

              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">
                Leave Count
              </label>
              <input
                type="number"
                value={formData.leaveCount}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
              />
            </div>
          </div>
          {/* Leave Count */}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Submitting…' : 'Submit Leave Request'}
          </button>
        </form>

        {/* Right: Holiday List */}
        <div className="bg-gray-50 p-4 rounded shadow h-fit">
          <h3 className="font-semibold mb-2 text-gray-700 text-lg">
            Holiday List
          </h3>
          <ul className="text-sm space-y-2 max-h-[28rem] overflow-y-auto pr-2">
            {HolidaysList.map((holiday) => {
              const day = new Date(holiday.date).toLocaleDateString('en-US', {
                weekday: 'long',
              });
              return (
                <li
                  key={holiday.date}
                  className="flex flex-col border-b pb-2 text-gray-800"
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {holiday.date}{' '}
                      <span className="text-gray-500">({day})</span>
                    </span>

                    <span
                      className={`flex items-center gap-2 px-2 py-0.5 rounded-full border text-xs font-medium ${
                        holiday.isFloater
                          ? 'border-green-400 text-green-700 bg-green-50'
                          : 'border-yellow-400 text-yellow-700 bg-yellow-50'
                      }`}
                    >
                      {holiday.isFloater ? 'Floater' : 'Holiday'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 italic">
                    {holiday.festivalName}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;
