import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

function CreateEvent() {
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "",
    description: "",
    venue: "",
    capacity: "",
    category: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const eventCategories = ["TECHNICAL", "CULTURAL", "SPORTS", "WORKSHOP"];

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "capacity") {
      value = value.replace(/\D/g, "");
    }
    setFormData({ ...formData, [name]: value });
  };

  const showError = (msg) => {
    setError(msg);
    toast.error(msg, { position: "top-right" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validations
    if (formData.eventName.trim().length < 5) {
      return showError("Event name must be at least 5 characters");
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.time)) {
      return showError("Time must be in HH:mm format (e.g., 10:00 or 14:30)");
    }

    const capacityNum = Number(formData.capacity);
    if (!capacityNum || capacityNum <= 0) {
      return showError("Capacity must be a positive number");
    }

    if (!eventCategories.includes(formData.category)) {
      return showError("Please select a valid event category");
    }

    const token = localStorage.getItem("token");
    if (!token || !token.startsWith("eyJ")) {
      showError("Invalid or missing authentication token");
      navigate("/admin/login");
      return;
    }

    const payload = {
      ...formData,
      capacity: capacityNum,
      currentCapacity: 0, // ✅ Ensure new event starts with 0 registrations
    };

    const toastId = toast.loading("Creating event...", {
      position: "top-right",
    });

    try {
      await axios.post("https://easyfest.onrender.com/api/events", payload, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.dismiss(toastId);
      toast.success("Event created successfully!", { position: "top-right" });
      navigate("/admin/dashboard");
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      toast.dismiss(toastId);

      if (err.response?.status === 401) {
        showError("Authentication failed. Please log in again.");
        navigate("/admin/login");
      } else if (err.response?.status === 415) {
        showError(err.response.data?.message || "Unsupported media type.");
      } else if (err.response?.data?.errors) {
        const errorMsg = Object.values(err.response.data.errors)
          .map((e) => `${e.field}: ${e.defaultMessage}`)
          .join(", ");
        showError(errorMsg);
      } else {
        showError(err.response?.data?.message || "Failed to create event.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-xl border-b border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Create New Event
                </h1>
                <p className="text-slate-600">
                  Add a new event to the college calendar
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-b-xl shadow-lg p-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter event name (minimum 5 characters)"
                    required
                    minLength={5}
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter venue location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Maximum attendees"
                    required
                    min={1}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="" disabled>
                      Select event category
                    </option>
                    {eventCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter event description (optional)"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Create Event
                </button>
                <Link
                  to="/admin/dashboard"
                  className="flex-1 bg-slate-500 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;
