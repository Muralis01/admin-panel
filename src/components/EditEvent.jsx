import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function EditEvent() {
  const { eventId } = useParams();
  const [formData, setFormData] = useState({
    eventName: "",
    date: "",
    time: "", // store in 12-hr format like "06:30 PM"
    venue: "",
    description: "",
    capacity: "",
    currentCapacity: 0,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // helper: convert 24hr -> 12hr format
  const to12HourFormat = (time24) => {
    if (!time24) return "";
    let [hour, minute] = time24.split(":");
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12; // convert 0 -> 12
    return `${String(h).padStart(2, "0")}:${minute} ${ampm}`;
  };

  // helper: convert 12hr -> 24hr format
  const to24HourFormat = (time12) => {
    if (!time12) return "";
    const [time, modifier] = time12.split(" ");
    let [hour, minute] = time.split(":");
    let h = parseInt(hour, 10);

    if (modifier === "PM" && h !== 12) {
      h += 12;
    }
    if (modifier === "AM" && h === 12) {
      h = 0;
    }
    return `${String(h).padStart(2, "0")}:${minute}:00`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/events/${eventId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        const event = response.data;
        setFormData({
          eventName: event.eventName || "",
          date: event.date || "",
          time: to12HourFormat(event.time || ""), // convert here
          venue: event.venue || "",
          capacity: event.capacity || "",
          description: event.description || "",
          currentCapacity: event.currentCapacity ?? 0,
        });
      } catch (err) {
        toast.error("Failed to load event");
      }
    };
    fetchEvent();
  }, [eventId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token || !token.startsWith("eyJ")) {
      toast.error("Invalid or missing authentication token");
      navigate("/admin/login");
      return;
    }

    try {
      const payload = {
        ...formData,
        time: to24HourFormat(formData.time), // convert back before sending
      };

      await axios.put(`http://localhost:8080/api/events/${eventId}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Event updated successfully!");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <Toaster position="top-right" reverseOrder={false} />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-t-xl border-b border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Edit Event
                </h1>
                <p className="text-slate-600">Update event details</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-b-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Time (with time picker) */}
                {/* Time (12-hour format with AM/PM) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Time <span className="text-red-500">*</span>
                  </label>

                  <div className="flex gap-2">
                    {/* Hours */}
                    <select
                      value={formData.hour || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hour: e.target.value,
                          time: `${e.target.value}:${prev.minute || "00"} ${
                            prev.ampm || "AM"
                          }`,
                        }))
                      }
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">HH</option>
                      {[...Array(12)].map((_, i) => {
                        const hr = i + 1;
                        return (
                          <option key={hr} value={hr < 10 ? `0${hr}` : hr}>
                            {hr}
                          </option>
                        );
                      })}
                    </select>

                    {/* Minutes */}
                    <select
                      value={formData.minute || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minute: e.target.value,
                          time: `${prev.hour || "12"}:${e.target.value} ${
                            prev.ampm || "AM"
                          }`,
                        }))
                      }
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">MM</option>
                      {[...Array(60)].map((_, i) => {
                        const min = i < 10 ? `0${i}` : i;
                        return (
                          <option key={i} value={min}>
                            {min}
                          </option>
                        );
                      })}
                    </select>

                    {/* AM/PM */}
                    <select
                      value={formData.ampm || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          ampm: e.target.value,
                          time: `${prev.hour || "12"}:${prev.minute || "00"} ${
                            e.target.value
                          }`,
                        }))
                      }
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      <option value="">AM/PM</option>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Venue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Hidden currentCapacity */}
              <input
                type="hidden"
                name="currentCapacity"
                value={formData.currentCapacity}
              />

              {/* Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Updating..." : "Update Event"}
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

export default EditEvent;
