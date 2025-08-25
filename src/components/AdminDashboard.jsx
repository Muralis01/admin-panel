import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Users,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const eventsPerPage = 9;
  const navigate = useNavigate();

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log(error);
      const token = localStorage.getItem("token");
      const response = await axios.get("https://easyfest.onrender.com/api/events", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { page: currentPage, size: eventsPerPage },
      });

      let fetchedEvents = response.data.content || response.data;
      setTotalPages(response.data.totalPages || 1);

      // Client-side filters
      const filtered = fetchedEvents.filter((event) => {
        const matchesSearch = event.eventName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const eventDate = new Date(event.date);
        const today = new Date("2025-08-21T18:57:00+05:30"); // Current date and time in IST
        let matchesTime = true;
        if (timeFilter === "UPCOMING") matchesTime = eventDate >= today;
        else if (timeFilter === "PAST") matchesTime = eventDate < today;

        return matchesSearch && matchesTime;
      });

      setEvents(filtered);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load events. Please try again."
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchQuery, timeFilter]);

  // Delete event
  const handleDelete = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://easyfest.onrender.com/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted successfully!");
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  // Format Date
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // ✅ Format Time in HH:MM AM/PM
  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(":");
      const date = new Date();
      date.setHours(hours, minutes);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeStr;
    }
  };

  const getEventTypeColor = (type) => {
    const colors = {
      TECHNICAL: "bg-blue-100 text-blue-800",
      CULTURAL: "bg-purple-100 text-purple-800",
      SPORTS: "bg-green-100 text-green-800",
      WORKSHOP: "bg-orange-100 text-orange-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getTimeStatus = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date("2025-08-21T18:57:00+05:30"); // Current date and time in IST
    return eventDate >= today ? "upcoming" : "past";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Event Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and organize all your events
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/events/create")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Event
          </button>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                value={timeFilter}
                onChange={(e) => {
                  setTimeFilter(e.target.value);
                  setCurrentPage(0);
                }}
              >
                <option value="ALL">All Events</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="PAST">Past</option>
              </select>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              {events.length} {events.length === 1 ? "event" : "events"} found
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.eventId}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                    {event.eventName}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ml-3 ${getEventTypeColor(
                      event.category
                    )}`}
                  >
                    {event.category}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{formatDate(event.date)}</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        getTimeStatus(event.date) === "upcoming"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getTimeStatus(event.date)}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{formatTime(event.time)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span>{event.venue}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-3 text-gray-400" />
                    <span>
                      {event.currentCapacity}/{event.capacity} Attendees
                    </span>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      navigate(`/admin/events/edit/${event.eventId}`)
                    }
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(event.eventId, event.eventName)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/events/${event.eventId}/registrations`)
                    }
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
                  >
                    <Eye className="w-4 h-4 mr-2" /> Registrations
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {currentPage + 1} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      currentPage === i
                        ? "bg-blue-600 text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;