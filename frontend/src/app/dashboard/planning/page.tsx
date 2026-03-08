
"use client";

import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/AuthenticatedLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePublishing } from "@/hooks/usePublishing";
import { addCalendarEvent } from "@/lib/api/publishing";

// UI libraries
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export default function PlanningPage() {
  const { token, isAuthenticated, authReady } = useAuth();
  const { schedules, loading, error, fetchSchedules, createSchedule } =
    usePublishing();

  const formatLongDate = (d: Date) => {
    // add ordinal suffix to day (1st, 2nd, 3rd, 4th, etc.)
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
    const month = d.toLocaleString(undefined, { month: "long" });
    const day = getOrdinal(d.getDate());
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // scheduling form state (moved to modal)
  const [newDate, setNewDate] = useState("");
  const [newContentId, setNewContentId] = useState(""); // used for library removal
  const [newContentTitle, setNewContentTitle] = useState(""); // visible title field
  const [newPlatform, setNewPlatform] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"ready" | "drafts">("ready");

  // library items state (could come from API later)
  const initialReady = [
    { id: "1", title: "Your SaaS is Leaking Money", platform: "Twitter" },
    { id: "2", title: "How I use AI for content creation", platform: "YouTube" },
  ];
  const initialDrafts = [
    { id: "3", title: "Idea about AI and creativity", platform: "Blog" },
  ];
  const [libraryItems, setLibraryItems] = useState(initialReady);
  const [draftItems, setDraftItems] = useState(initialDrafts);

  useEffect(() => {
    if (token && isAuthenticated()) {
      fetchSchedules(token);
    }
  }, [token, isAuthenticated, fetchSchedules]);

  const handleCreate = async () => {
    if (!token) return;

    // simple client validation
    if (!newContentTitle || !newPlatform || !newDate) {
      alert("Please fill in content title, platform, and date/time before scheduling.");
      return;
    }

    try {
      await createSchedule(token, {
        contentId: newContentTitle,
        platform: newPlatform,
        scheduledTime: newDate,
      });
      // remove from library by id if we have one
      if (newContentId) {
        setLibraryItems((prev) => prev.filter((i) => i.id !== newContentId));
      }

      setNewContentId("");
      setNewContentTitle("");
      setNewPlatform("");
      setNewDate("");
      setShowModal(false);
      // refresh schedules list
      if (token) fetchSchedules(token);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to create schedule");
    }
  };

  const addCalendar = async (scheduleId: string, accessToken: string) => {
    if (!token) return;
    try {
      await addCalendarEvent(token, scheduleId, accessToken);
    } catch (e) {
      console.error("calendar event error", e);
      throw e;
    }
  };




  // identify schedules for selected date
  const schedulesForDate = schedules.filter(
    (s) =>
      new Date(s.scheduledTime).toDateString() ===
      selectedDate.toDateString(),
  );

  return (
    <AuthenticatedLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Publishing & Planning</h1>
        <p className="text-gray-600 mt-1">Schedule your content and post consistently.</p>
      </div>

      {/* calendar and side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface p-4 rounded shadow flex flex-col h-full">
          <p className="font-semibold mb-2" style={{ color: "var(--color-text)" }}>
            Content Calendar
          </p>
          <div className="w-full h-full flex justify-center items-center">
            <Calendar
              onChange={(val) => {
                if (val && !(Array.isArray(val))) {
                  setSelectedDate(val as Date);
                }
              }}
              onClickDay={(date) => {
                setSelectedDate(date);
                // open modal to schedule on this date if library has ready items
                if (libraryItems.length > 0) {
                  setShowModal(true);
                  setNewDate(date.toISOString().slice(0, 16));
                }
              }}
              value={selectedDate}
              className="w-full h-full"
              tileContent={({ date, view }) => {
                if (view === "month") {
                  const daySchedules = schedules.filter(
                    (s) =>
                      new Date(s.scheduledTime).toDateString() ===
                      date.toDateString(),
                  );
                  if (daySchedules.length > 0) {
                    return (
                      <div className="flex flex-col items-center text-[8px] leading-tight">
                        <span className="text-indigo-400">
                          {daySchedules.length}
                        </span>
                        <span className="truncate max-w-[2.5rem]">
                          {daySchedules[0].contentId}
                        </span>
                      </div>
                    );
                  }
                }
                return null;
              }}
            />
          </div>
        </div>
        <div className="bg-surface p-4 rounded shadow">
          <p className="font-semibold mb-1" style={{ color: "var(--color-text)" }}>
            Scheduled for <span className="text-indigo-400">{formatLongDate(selectedDate)}</span>
          </p>
          <p className="text-text-secondary text-sm mb-3">
            {schedulesForDate.length} post{schedulesForDate.length === 1 ? '' : 's'} scheduled.
          </p>
          {schedulesForDate.length === 0 && <p>No posts scheduled.</p>}
          {schedulesForDate.map((s) => (
            <div
              key={s.scheduleId}
              className="mb-2 p-3 border border-gray-600 rounded bg-surface flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full">
                  {s.platform.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{s.contentId}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(s.scheduledTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button className="px-3 py-1 bg-gray-700 text-white rounded">
                View & Copy
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* scheduling modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-surface p-6 rounded shadow max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Schedule Post</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Content title or ID"
                value={newContentTitle}
                onChange={(e) => {
                  setNewContentTitle(e.target.value);
                  setNewContentId(e.target.value); // keep id in sync when typing manually
                }}
                className="w-full bg-surface border border-gray-600 text-white rounded p-2"
              />
              <input
                type="text"
                placeholder="Platform (e.g. Twitter)"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="w-full bg-surface border border-gray-600 text-white rounded p-2"
              />
              <input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-surface border border-gray-600 text-white rounded p-2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* library section */}
      <div className="mt-8">
        <div className="flex space-x-4 border-b border-gray-600 mb-4">
          <button
            onClick={() => setActiveTab("ready")}
            className={`pb-2 ${
              activeTab === "ready" ? "border-b-2 border-indigo-600" : ""
            }`}
          >
            Ready to Schedule ({libraryItems.length})
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`pb-2 ${
              activeTab === "drafts" ? "border-b-2 border-indigo-600" : ""
            }`}
          >
            Drafts ({draftItems.length})
          </button>
        </div>
        {activeTab === "ready" && (
          <div className="space-y-3">
            {libraryItems.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-gray-600 rounded bg-surface flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.platform}</p>
                </div>
                <button
                  onClick={() => {
                    // open modal with this item
                    setNewContentId(item.id);
                    setNewContentTitle(item.title);
                    setNewPlatform(item.platform);
                    setNewDate(selectedDate.toISOString().slice(0, 16));
                    setShowModal(true);
                  }}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Schedule
                </button>
              </div>
            ))}
          </div>
        )}
        {activeTab === "drafts" && (
          <div className="space-y-3">
            {draftItems.map((item) => (
              <div key={item.id} className="p-3 border border-gray-600 rounded bg-surface">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-400">{item.platform}</p>
              </div>
            ))}
            {draftItems.length === 0 && (
              <p className="text-text-secondary">No drafts yet.</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded"
          onClick={() => {
            // navigate to analytics or next step
            window.location.href = "/dashboard/analytics";
          }}
        >
          Continue to Analysis →
        </button>
      </div>
    </AuthenticatedLayout>
  );
}
