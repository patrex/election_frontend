import React, { useState } from 'react';

const WeeklyCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Helper to generate the 7 days of the current week based on a reference date
  const getWeekDays = (refDate) => {
    const startOfWeek = new Date(refDate);
    const day = startOfWeek.getDay(); 
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const clone = new Date(startOfWeek);
      clone.setDate(startOfWeek.getDate() + i);
      days.push(clone);
    }
    return days;
  };

  const weekDays = getWeekDays(new Date());

  // Format helpers
  const formatDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Sun"
  };

  const formatDayNumber = (date) => {
    return date.getDate(); // e.g., "12"
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isSunday = (date) => {
    return date.getDay() === 0;
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Calendar Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
      </div>

      {/* 7-Day Line Wrapper */}
      <div className="flex justify-between items-center gap-1">
        {weekDays.map((day, index) => {
          const selected = isSelected(day);
          const today = isToday(day);
          const Sunday = isSunday(day);

          return (
            <div key={index} className="flex-1 flex flex-col items-center relative">
              <button
                onClick={() => setSelectedDate(day)}
                className={`w-full flex flex-col items-center justify-center py-3 px-1 rounded-xl transition-all duration-200 focus:outline-none
                  ${selected 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {/* Day Name (e.g., Sun, Mon) */}
                <span 
                  className={`text-xs font-medium uppercase tracking-wider 
                    ${selected 
                      ? 'text-blue-100' 
                      : Sunday 
                        ? 'text-red-500 font-bold' // Bright red for Sunday name
                        : 'text-gray-400'
                    }
                  `}
                >
                  {formatDayName(day)}
                </span>

                {/* Day Number (e.g., 12) */}
                <span 
                  className={`text-base font-bold mt-1 relative 
                    ${selected 
                      ? 'text-white' 
                      : Sunday 
                        ? 'text-red-600' // Distinct red for Sunday date
                        : 'text-gray-700'
                    }
                  `}
                >
                  {formatDayNumber(day)}
                  
                  {/* Today dot indicator (only visible when today is NOT selected) */}
                  {today && !selected && (
                    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </span>
              </button>

              {/* Caret pointing downwards beneath the selected day */}
              {selected && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 transition-all duration-200">
                  <svg 
                    width="12" 
                    height="8" 
                    viewBox="0 0 12 8" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-blue-600"
                  >
                    <path 
                      d="M6 8L0.803849 0.5L11.1962 0.5L6 8Z" 
                      fill="currentColor" 
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;