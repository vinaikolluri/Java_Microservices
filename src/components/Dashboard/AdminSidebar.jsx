import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaCalendarAlt,
  FaFile,
  FaShieldAlt,
  FaClock,
  FaLaptop,
  FaBars,
} from "react-icons/fa";

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  // Collapse sidebar when navigating
  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Sidebar Header with Toggle Button */}
      <div className="bg-teal-700 h-16 flex items-center justify-between px-4 space-x-1">
        <h1 className={`text-xl font-bold text-white ${!isOpen && "hidden"}`}>
          HRMS
        </h1>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white focus:outline-none"
        >
          {isOpen ? <FaBars /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="px-4 mt-4 space-y-2">
        <NavLink
          to="/admin/dashboard"
          end
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaTachometerAlt />
          {isOpen && <span className="ml-3">Dashboard</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/employees"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaUsers />
          {isOpen && <span className="ml-3">Employees</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/departments"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaBuilding />
          {isOpen && <span className="ml-3">Departments</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/leaves"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaCalendarAlt />
          {isOpen && <span className="ml-3">Leaves</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/attendance"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaClock />
          {isOpen && <span className="ml-3">Attendance</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/access"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaShieldAlt />
          {isOpen && <span className="ml-3">Access</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/assets"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaLaptop />
          {isOpen && <span className="ml-3">Assets</span>}
        </NavLink>

        <NavLink
          to="/admin/dashboard/documents"
          className={({ isActive }) =>
            `${
              isActive
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaFile />
          {isOpen && <span className="ml-3">Documents</span>}
        </NavLink>
      </div>
    </div>
  );
};

export default AdminSidebar;