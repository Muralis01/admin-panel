import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import CreateAdminPage from "./pages/CreateAdminPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import RegisteredStudents from "./components/RegisteredStudents";

function App() {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("role") === "ADMIN");

  // 🔄 keep isAdmin in sync whenever localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdmin(localStorage.getItem("role") === "ADMIN");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/admin/dashboard"
            element={isAdmin ? <AdminDashboardPage /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/create-admin"
            element={isAdmin ? <CreateAdminPage /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/events/create"
            element={isAdmin ? <CreateEventPage /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/admin/events/edit/:eventId"
            element={isAdmin ? <EditEventPage /> : <Navigate to="/admin/login" />}
          />
          <Route
            path="/events/:eventId/registrations"
            element={isAdmin ? <RegisteredStudents /> : <Navigate to="/admin/login" />}
          />

          <Route path="*" element={<Navigate to="/admin/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
