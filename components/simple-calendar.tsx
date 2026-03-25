"use client";

import { eachDayOfInterval, endOfMonth, format, isSameMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { useState } from "react";
import { CalendarFeed } from "@/lib/types";
import { getCalendarItems, getTodayKey, toDateKey, parseDateKey } from "@/lib/calendar";

interface SimpleCalendarProps {
  feed: CalendarFeed;
  todayKey: string;
}

export function SimpleCalendar({ feed, todayKey }: SimpleCalendarProps) {
  const today = parseDateKey(todayKey);
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showCalculator, setShowCalculator] = useState(false);
  const [workingDaysStartDate, setWorkingDaysStartDate] = useState<Date | null>(null);
  const [workingDaysEndDate, setWorkingDaysEndDate] = useState<Date | null>(null);
  
  const allItems = getCalendarItems(feed);
  
  // Helper function to categorize event color
  const getEventColor = (event: any) => {
    const titleLower = event.title.toLowerCase();
    
    if (titleLower.includes("mid term")) {
      return "bg-cyan-500";
    }
    
    if (titleLower.includes("term end") || titleLower.includes("end-semester")) {
      return "bg-lime-600";
    }
    
    if (titleLower.includes("summer") || titleLower.includes("internship")) {
      return "bg-fuchsia-700";
    }
    
    switch (event.type) {
      case "exam":
        return "bg-orange-600";
      case "holiday":
        return "bg-rose-600";
      case "deadline":
        return "bg-yellow-500";
      case "class":
        return "bg-indigo-600";
      case "registration":
        return "bg-emerald-500";
      case "break":
        return "bg-teal-500";
      default:
        return "bg-slate-600";
    }
  };

  const getEventBgColor = (event: any) => {
    const titleLower = event.title.toLowerCase();
    if (titleLower.includes("summer") || titleLower.includes("internship")) {
      return "bg-fuchsia-700 opacity-80";
    }
    return getEventColor(event);
  };

  // Calculate working days between two dates
  const calculateWorkingDays = (startDate: Date, endDate: Date) => {
    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    let workingDays = 0;
    let holidayCount = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const dayOfWeek = getDay(current);
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateKey = toDateKey(current);
      const isHoliday = feed.holidays.some(h => h.date === dateKey);

      if (!isWeekend && !isHoliday) {
        workingDays++;
      } else if (isHoliday) {
        holidayCount++;
      }

      current.setDate(current.getDate() + 1);
    }

    return { workingDays, holidayCount };
  };
  
  // Get all days to display
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - getDay(monthStart));
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Get events for selected date
  const selectedDateKey = toDateKey(selectedDate);
  const selectedDateEvents = allItems.filter(item => 
    (item.startDate <= selectedDateKey && selectedDateKey <= item.endDate)
  );
  
  // Get holidays for current month
  const currentMonthHolidays = feed.holidays.filter(holiday => {
    const holidayDate = parseDateKey(holiday.date);
    return isSameMonth(holidayDate, currentMonth);
  });
  
  // Get all events as map for quick lookup
  const eventsByDate: Record<string, typeof allItems> = {};
  allItems.forEach(item => {
    const start = parseDateKey(item.startDate);
    const end = parseDateKey(item.endDate);
    const current = new Date(start);
    
    while (current <= end) {
      const dateKey = toDateKey(current);
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(item);
      current.setDate(current.getDate() + 1);
    }
  });

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Academic Calendar</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">USAR Academic Events & Deadlines</p>
          </div>

          {/* Working Days Calculator Toggle Button */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
          >
            {showCalculator ? "Hide Calculator" : "Working Days"}
          </button>
        </div>

        {/* Working Days Calculator - Collapsible */}
        {showCalculator && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-lg">
            <div className="mb-6 pb-4 border-b border-slate-200">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">Calculate Working Days</h3>
              <p className="text-sm text-slate-600 mt-1">Excludes weekends and holidays</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">From Date</label>
                <input
                  type="date"
                  value={workingDaysStartDate ? format(workingDaysStartDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setWorkingDaysStartDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">To Date</label>
                <input
                  type="date"
                  value={workingDaysEndDate ? format(workingDaysEndDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setWorkingDaysEndDate(e.target.value ? new Date(e.target.value) : null)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-slate-50 hover:bg-white"
                />
              </div>
            </div>

            {workingDaysStartDate && workingDaysEndDate && (
              <div className="mt-6 space-y-3 border-t border-slate-200 pt-6">
                {(() => {
                  const { workingDays, holidayCount } = calculateWorkingDays(workingDaysStartDate, workingDaysEndDate);
                  const totalDays = Math.ceil((workingDaysEndDate.getTime() - workingDaysStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  const weekendDays = totalDays - workingDays - holidayCount;
                  
                  return (
                    <>
                      <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Working Days</p>
                        <p className="text-3xl sm:text-4xl font-bold text-green-600 mt-2">{workingDays}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 p-4">
                          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Holidays</p>
                          <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{holidayCount}</p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-300 p-4">
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Weekends</p>
                          <p className="text-2xl sm:text-3xl font-bold text-slate-600 mt-2">{weekendDays}</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Calendar */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Month Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-4 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentMonth(today)}
                className="flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="flex-1 sm:flex-none rounded-lg px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Next
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0 border-b border-slate-200 bg-slate-50">
            {weekdayLabels.map(day => (
              <div key={day} className="border-r border-slate-200 px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-bold text-slate-700 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0">
            {calendarDays.map((day, idx) => {
              const dateKey = toDateKey(day);
              const dayEvents = eventsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDate);
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isHoliday = isCurrentMonth && feed.holidays.some(h => h.date === dateKey);
              
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-20 sm:min-h-32 cursor-pointer border-r border-b border-slate-200 p-2 sm:p-3 last:border-r-0 transition hover:shadow-md ${
                    isHoliday ? "bg-red-500" :
                    !isCurrentMonth ? "opacity-15 bg-white" :
                    isWeekend ? "bg-slate-50" : 
                    "bg-white"
                  } ${isToday && !isHoliday ? "ring-2 ring-inset ring-blue-500" : ""} ${
                    isSelected && !isHoliday ? "ring-2 ring-inset ring-blue-500" : ""
                  }`}
                >
                  <div className={`text-xs sm:text-sm font-semibold ${
                    isHoliday ? "text-white" :
                    !isCurrentMonth ? "text-slate-400" :
                    "text-slate-900"
                  } ${isToday && !isHoliday ? "text-blue-600" : ""}`}>
                    {format(day, "d")}
                  </div>
                  
                  {isHoliday && (
                    <div className="mt-1 text-xs font-bold text-white truncate">
                      {feed.holidays.find(h => h.date === dateKey)?.name}
                    </div>
                  )}
                  
                  {!isHoliday && (
                    <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1">
                      {dayEvents.slice(0, 1).map((event, i) => {
                        const titleLower = event.title.toLowerCase();
                        const isSummerEvent = titleLower.includes("summer") || titleLower.includes("internship");
                        
                        return (
                          <div
                            key={i}
                            className={`truncate rounded text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 font-semibold text-white ${getEventBgColor(event)} ${
                              isSummerEvent ? "border border-dashed border-yellow-300" : ""
                            }`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 1 && (
                        <div className="text-xs text-slate-500 px-1">
                          +{dayEvents.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-8 space-y-6">
          {currentMonthHolidays.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg sm:text-xl font-bold text-slate-900">
                Holidays in {format(currentMonth, "MMMM yyyy")}
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {currentMonthHolidays.map(holiday => (
                  <div key={holiday.id} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                    <h4 className="font-semibold text-red-900 text-sm sm:text-base">{holiday.name}</h4>
                    <p className="text-xs sm:text-sm text-red-700 mt-1">{format(parseDateKey(holiday.date), "EEEE, MMMM d, yyyy")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSameMonth(selectedDate, currentMonth) ? (
            <div>
              <h3 className="mb-4 text-lg sm:text-xl font-bold text-slate-900">
                Events on {format(selectedDate, "EEEE, MMMM d, yyyy")}
              </h3>
              
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateEvents.map(event => (
                    <div key={event.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold text-white ${getEventColor(event)}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                          </div>
                          <h4 className="font-semibold text-slate-900 text-sm sm:text-base">{event.title}</h4>
                          <p className="mt-1 text-sm text-slate-600">{event.description}</p>
                          {event.startDate !== event.endDate && (
                            <p className="mt-2 text-xs text-slate-500">
                              {event.startDate === selectedDateKey ? "Starts today" : "Continues"} • Ends {format(parseDateKey(event.endDate), "MMM d")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-50 p-6 sm:p-8 text-center border border-slate-200">
                  <p className="text-slate-600 text-sm sm:text-base">No events scheduled for this date</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-blue-50 p-6 sm:p-8 text-center border border-blue-200">
              <p className="text-blue-700 text-sm sm:text-base">Select a date in {format(currentMonth, "MMMM yyyy")} to view event details</p>
            </div>
          )}

          {/* Legend */}
          <div className="rounded-xl bg-slate-50 p-6 sm:p-8 border border-slate-200">
            <h3 className="mb-4 text-lg sm:text-xl font-bold text-slate-900">Color Legend</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-cyan-500"></div>
                <span className="text-xs sm:text-sm text-slate-700">Mid-Sem Exams</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-lime-600"></div>
                <span className="text-xs sm:text-sm text-slate-700">End-Sem Exams</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded border-2 border-dashed border-yellow-300 flex-shrink-0 bg-fuchsia-700"></div>
                <span className="text-xs sm:text-sm text-slate-700">Summer Training</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-orange-600"></div>
                <span className="text-xs sm:text-sm text-slate-700">Exams</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-emerald-500"></div>
                <span className="text-xs sm:text-sm text-slate-700">Registration</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-rose-600"></div>
                <span className="text-xs sm:text-sm text-slate-700">Holidays</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-yellow-500"></div>
                <span className="text-xs sm:text-sm text-slate-700">Deadline</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-indigo-600"></div>
                <span className="text-xs sm:text-sm text-slate-700">Class</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded flex-shrink-0 bg-teal-500"></div>
                <span className="text-xs sm:text-sm text-slate-700">Break</span>
              </div>
            </div>
          </div>

          {/* Footer with GitHub Link */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">
              Found this helpful?{" "}
              <a
                href="https://github.com/Waqar080206/USAR-Calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Star on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
