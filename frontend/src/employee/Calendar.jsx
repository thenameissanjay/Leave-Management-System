import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../Context/AuthContext';
import dayjs from 'dayjs';

const Calendar = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [festivalDate, setFestivalDate] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  useEffect(() => {
    const getCalendar = async () => {
      try {
        const result = await axios.get(
          `http://localhost:8080/api/employee/getCalendar/${user.ReportingTo}`
        );
        setData(result.data);
      } catch (error) {
        console.log(error);
      }
    };

    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`https://calendarific.com/api/v2/holidays`, {
          params: {
            api_key: 'Qa2RGwHp8JRsCMq7YjhmwknNAdp16KhE',
            country: 'IN',
            year: 2025,
          },
        });

        const holidayEvents = res.data.response.holidays.map((holiday) => ({
          title: holiday.name,
          start: holiday.date.iso,
        }));

        setFestivalDate(holidayEvents);
      } catch (error) {
        console.error('Error fetching holidays:', error);
      }
    };
    getCalendar();
    fetchHolidays();
  }, []);

  const generateMonthGrid = (month) => {
    const startOfGrid = month.startOf('month').startOf('week');
    const endOfGrid = month.endOf('month').endOf('week');
    const days = [];
    let day = startOfGrid;

    while (day.isBefore(endOfGrid) || day.isSame(endOfGrid, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }

    return days;
  };

  const formatData = () => {
    const events = {};
    data.forEach(({ date, absent }) => {
      events[date] = { absent, festival: false };
    });
    festivalDate.forEach(({ start, title }) => {
      if (!events[start]) events[start] = { absent: [], festival: true, title };
      else events[start].festival = true;
    });
    return events;
  };

  const handlePrevious = () => {
    setCurrentMonth((prev) => prev.subtract(1, 'month'));
  };

  const handleNext = () => {
    setCurrentMonth((prev) => prev.add(1, 'month'));
  };

  const events = formatData();
  const days = generateMonthGrid(currentMonth);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Previous
        </button>
        <h2 className="text-2xl font-bold text-center">{currentMonth.format('MMMM YYYY')}</h2>
        <button
          onClick={handleNext}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = day.format('YYYY-MM-DD');
          const event = events[dateStr];
          return (
            <div
              key={dateStr}
              className="border p-2 rounded h-32 overflow-y-auto text-sm flex flex-col justify-between"
            >
              <div className="font-bold">{day.date()}</div>
              {event?.festival && (
                <div className="text-green-600 font-semibold">{event.title || 'Festival'}</div>
              )}
              {event?.absent?.length > 0 && (
                <div className="text-red-600 font-semibold">
                  <div>{event.absent.length} Absent</div>
                  <ul className="list-disc list-inside">
                    {event.absent.map((name, index) => (
                      <li key={index} className="text-red-600 font-normal">{name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
