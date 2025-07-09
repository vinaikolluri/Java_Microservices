import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, Clock, FileText, Lock } from 'lucide-react';
import { AuthService } from '../../service/authService';
import { EmployeeService } from '../../service/employeeService';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null); // Ref for the dropdown

  const { user, isAuthenticated } = AuthService.getUserData();
  const employeeId = user?.employeeId;
  const userRole = user?.role || '';

  useEffect(() => {
    const fetchEmployeeName = async () => {
      if (!employeeId) {
        setError("Employee ID is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        let employee = EmployeeService.getEmployeeById(employeeId);
        if (!employee) {
          const token = AuthService.getToken();
          const response = await fetch(
            `${import.meta.env.VITE_EMPLOYEE_MANAGEMENT}/api/employees/employee/${employeeId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!response.ok) throw new Error("Failed to fetch employee details.");
          employee = await response.json();
          EmployeeService.updateEmployee(employeeId, employee);
        }
        if (employee && employee.fullName) {
          setUserName(employee.fullName);
        } else {
          setError("Employee name not found.");
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching employee name.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeName();
  }, [employeeId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Add event listener when the dropdown is open
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <nav className="bg-teal-600 shadow-md p-3.5">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">WELCOME</h1>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center animate-pulse"></div>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-teal-600 shadow-md p-3.5">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">WELCOME</h1>
          <div className="text-red-500">{error}</div>
        </div>
      </nav>
    );
  }

  const firstLetter = userName.charAt(0).toUpperCase();

  const rolePaths = {
    HR: '/hr/dashboard',
    ADMIN: '/admin/dashboard',
    TEMPORARY_ADMIN: '/temporary/admin/dashboard'
  };

  const dashboardPath = rolePaths[userRole] || '';

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-teal-600 shadow-md p-3.5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Hi, <i>{userName}!!</i></h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="w-10 h-10 rounded-full bg-white text-teal-600 flex items-center justify-center font-bold"
          >
            {firstLetter}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-lg p-2 z-50">
              {userRole === 'HR' || userRole === 'TEMPORARY_ADMIN' ? (
                <>
                  <button
                    onClick={() => handleNavigation(`${dashboardPath}/profile`)}
                    className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
                  >
                    <User className="h-5 w-5 text-teal-600" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleNavigation(`${dashboardPath}/my-leaves`)}
                    className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
                  >
                    <Calendar className="h-5 w-5 text-teal-600" />
                    <span>My Leaves</span>
                  </button>
                  <button
                    onClick={() => handleNavigation(`${dashboardPath}/my-attendance`)}
                    className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
                  >
                    <Clock className="h-5 w-5 text-teal-600" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    onClick={() => handleNavigation(`${dashboardPath}/my-documents`)}
                    className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
                  >
                    <FileText className="h-5 w-5 text-teal-600" />
                    <span>My Documents</span>
                  </button>
                  <button
                onClick={() => handleNavigation(`${dashboardPath}/change-password`)}
                className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
              >
               <Lock className="h-5 w-5 text-teal-600" />
                <span>Change Password</span>
              </button>
                </>
                
              ) : userRole === 'ADMIN' ? (
                <>
                <button
                  onClick={() => handleNavigation(`${dashboardPath}/profile`)}
                  className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
                >
                  <User className="h-5 w-5 text-teal-600" />
                  <span>Profile</span>
                </button>
                <button
                onClick={() => handleNavigation(`${dashboardPath}/change-password`)}
                className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
              >
               <Lock className="h-5 w-5 text-teal-600" />
               <span>Change Password</span>
              </button>
              </>
              ) : null}
              <button
                onClick={handleLogout}
                className="w-full text-teal-600 hover:bg-teal-100 px-4 py-2 text-left rounded-lg flex items-center space-x-2"
              >
                <LogOut className="h-5 w-5 text-teal-600" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}