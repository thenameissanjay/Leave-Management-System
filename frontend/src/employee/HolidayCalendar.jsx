import React, { useState } from "react";
import HolidaysList from "../utils/Holidays";
import dayjs from "dayjs";

const HolidaysCalendarModal = ({ isOpen, onClose }) => {
  const sortedHolidays = [...HolidaysList].sort((a, b) => new Date(a.date) - new Date(b.date));
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(sortedHolidays.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedHolidays = sortedHolidays.slice(startIdx, startIdx + itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl relative p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">2025 Holidays</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {paginatedHolidays.map((holiday, idx) => {
            const date = dayjs(holiday.date);
            return (
              <div
                key={idx}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-100 hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-3xl font-bold text-blue-700 leading-none">
                    {date.format("DD")}
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">
                    {date.format("MMM")}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{holiday.festivalName}</h3>
                {holiday.isFloater && (
                  <span className="inline-block mt-1 text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                    Floater Leave
                  </span>
                )}
                <p className="text-sm text-gray-600 mt-2">{date.format("dddd")}</p>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidaysCalendarModal;
