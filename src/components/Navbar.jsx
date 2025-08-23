import { Link, useNavigate } from 'react-router-dom';
import CollegeEventIcon from "../assets/college-event-icon.svg";

// Navbar Component
function Navbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('role') === 'ADMIN';
  const name = localStorage.getItem('name');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    navigate('/admin/login');
  };

  return (
    <nav className="bg-slate-800 border-b-4 border-amber-500 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div >
              <img
                src={CollegeEventIcon}
                alt="EazyFest Logo"
                className="w-13 h-13 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">EazyFest</h1>
              <p className="text-amber-300 text-xs font-medium">Event Management System</p>
            </div>
          </Link>
          
          {isAdmin && (
            <div className="flex items-center space-x-8">
             
              <div className="flex space-x-6">
                <Link 
                  to="/admin/dashboard" 
                  className="text-gray-300 hover:text-amber-400 font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-amber-400 pb-1"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/admin/create-admin" 
                  className="text-gray-300 hover:text-amber-400 font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-amber-400 pb-1"
                >
                  Create Admin
                </Link>
                <Link 
                  to="/admin/events/create" 
                  className="text-gray-300 hover:text-amber-400 font-medium transition-colors duration-200 border-b-2 border-transparent hover:border-amber-400 pb-1"
                >
                  Create Event
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 shadow-md"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
