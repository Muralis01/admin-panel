import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  GraduationCap,
  Download,
  Filter,
} from "lucide-react";

const RegisteredStudents = () => {
  const { eventId } = useParams();
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // 🔥 Force fresh fetch on mount + eventId change
  useEffect(() => {
    const fetchRegisteredStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:8080/api/events/${eventId}/registrations`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Cache-Control": "no-cache", // 🚫 disable caching
            },
          }
        );

        // Directly use server response
        const registrations = response.data.map((reg) => ({
          ...reg,
          attended: reg.attended ?? false, // normalize only if null
        }));

        setAllRegistrations(registrations);
        setFilteredRegistrations(registrations);
      } catch (err) {
        console.error("Error fetching registered students:", err);
        setError("Failed to load registered students.");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchRegisteredStudents();
    }
  }, [eventId]);

  // Search & filter
  useEffect(() => {
    let filtered = allRegistrations;

    if (departmentFilter !== "all") {
      filtered = filtered.filter(
        (reg) => reg.student?.department === departmentFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (reg) =>
          reg.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reg.student?.studentId
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reg.student?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reg.student?.department
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRegistrations(filtered);
  }, [searchTerm, departmentFilter, allRegistrations]);

  const departments = [
    ...new Set(allRegistrations.map((reg) => reg.student?.department)),
  ].filter(Boolean);



  // ✅ Toggle attendance with optimistic UI update
  const handleAttendanceChange = async (registrationId) => {
    setAllRegistrations((prev) =>
      prev.map((reg) =>
        reg.registrationId === registrationId
          ? { ...reg, attended: !reg.attended }
          : reg
      )
    );

    try {
      const response = await axios.put(
        `http://localhost:8080/api/registrations/${registrationId}/toggle-attendance`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Cache-Control": "no-cache",
          },
        }
      );

      // sync with backend
      setAllRegistrations((prev) =>
        prev.map((reg) =>
          reg.registrationId === registrationId
            ? { ...reg, attended: response.data.attended ?? false }
            : reg
        )
      );
    } catch (err) {
      console.error("Error toggling attendance:", err);
      alert("Failed to toggle attendance. Reverting...");
      // rollback UI if request fails
      setAllRegistrations((prev) =>
        prev.map((reg) =>
          reg.registrationId === registrationId
            ? { ...reg, attended: !reg.attended }
            : reg
        )
      );
    }
  };

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Registered Students</h1>
              <p className="text-blue-100">Event ID: #{eventId}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="text-2xl font-bold px-9">
                {filteredRegistrations.length}
              </span>
              <p className="text-sm text-blue-100">Total Registered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by name, student ID, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700"
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchTerm || departmentFilter !== "all"
                ? "No matches found"
                : "No students registered yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || departmentFilter !== "all"
                ? "Try adjusting your search criteria or filters"
                : "Students will appear here once they register for this event"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Attended
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Student ID
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((reg, index) => (
                  <tr
                    key={reg.registrationId}
                    className="hover:bg-blue-50 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-6 text-center">{index + 1}</td>

                    {/* Attendance checkbox */}
                    <td className="py-4 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={reg.attended || false}
                        onChange={() =>
                          handleAttendanceChange(reg.registrationId)
                        }
                        className="h-5 w-5 text-blue-600 cursor-pointer"
                      />
                    </td>

                    <td className="py-4 px-6">{reg.student?.studentId}</td>
                    <td className="py-4 px-6">{reg.student?.name}</td>
                    <td className="py-4 px-6">
                      <a
                        href={`mailto:${reg.student?.email}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {reg.student?.email}
                      </a>
                    </td>
                    <td className="py-4 px-6">{reg.student?.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisteredStudents;
