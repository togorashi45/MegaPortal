"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type EventType = "cron" | "meeting" | "deadline" | "other";

interface CalendarEvent {
  _id: Id<"events">;
  title: string;
  description?: string;
  startTime: number;
  endTime?: number;
  eventType: EventType;
  color?: string;
  agentId?: string;
}

const eventTypeColors: Record<EventType, string> = {
  cron: "bg-blue-600",
  meeting: "bg-terracotta",
  deadline: "bg-gold",
  other: "bg-gray-600",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const events = useQuery(api.events.listByRange, {
    startTime: startOfMonth.getTime(),
    endTime: endOfMonth.getTime(),
  }) as CalendarEvent[] | undefined;

  const createEvent = useMutation(api.events.create);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date: Date | null) => {
    if (!date || !events) return [];

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    return events.filter(
      (event) => event.startTime >= dayStart && event.startTime < dayEnd
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate) return;

    const formData = new FormData(e.currentTarget);
    const timeStr = formData.get("time") as string;
    const [hours, minutes] = timeStr.split(":").map(Number);

    const eventDate = new Date(selectedDate);
    eventDate.setHours(hours, minutes, 0, 0);

    await createEvent({
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      startTime: eventDate.getTime(),
      eventType: formData.get("eventType") as string,
      agentId: formData.get("agentId") as string || undefined,
    });

    setShowNewEventForm(false);
    setSelectedDate(null);
    e.currentTarget.reset();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = getDaysInMonth();

  return (
    <div className="p-8 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white">Calendar</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              ←
            </button>
            <span className="text-lg text-gray-300 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              →
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setShowNewEventForm(true);
          }}
          className="px-4 py-2 bg-terracotta hover:bg-terracotta/80 text-white rounded-lg transition-colors"
        >
          + New Event
        </button>
      </div>

      {showNewEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#242424] p-6 rounded-lg w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Time
                </label>
                <input
                  name="time"
                  type="time"
                  required
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Type
                </label>
                <select
                  name="eventType"
                  defaultValue="other"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="cron">Cron Job</option>
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agent ID (optional)
                </label>
                <input
                  name="agentId"
                  type="text"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-terracotta hover:bg-terracotta/80 text-white rounded transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewEventForm(false);
                    setSelectedDate(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#242424] rounded-lg border border-gray-800 overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-[#2a2a2a] border-b border-gray-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center font-semibold text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const isToday = date &&
              date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-800 ${
                  date ? "bg-[#242424] hover:bg-[#2a2a2a] cursor-pointer" : "bg-[#1a1a1a]"
                } transition-colors`}
                onClick={() => {
                  if (date) {
                    setSelectedDate(date);
                    setShowNewEventForm(true);
                  }
                }}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-2 ${
                      isToday ? "text-terracotta" : "text-gray-300"
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event._id}
                          className={`text-xs p-1 rounded ${eventTypeColors[event.eventType]} text-white truncate`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center space-x-6 text-sm">
        <span className="text-gray-400">Event Types:</span>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-300">Cron Job</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-terracotta rounded"></div>
          <span className="text-gray-300">Meeting</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gold rounded"></div>
          <span className="text-gray-300">Deadline</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span className="text-gray-300">Other</span>
        </div>
      </div>
    </div>
  );
}
