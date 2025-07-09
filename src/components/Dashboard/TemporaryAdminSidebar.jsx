import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaBuilding,
  FaTachometerAlt,
  FaUsers,
  FaCalendarAlt,
  FaFile,
  FaShieldAlt,
  FaClock,
  FaLaptop,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const TemporaryAdminSidebar = ({ isOpen, setIsOpen }) => {
  return (
    <div
      className={`bg-gray-800 text-white h-screen fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Sidebar Header with Toggle Button */}

      <div className="bg-teal-700 h-16 flex items-center justify-between px-4 space-x-1">
        <img
          src={logo}
          alt="Logo"
          className={`h-10 transition-all duration-300 ${
            isOpen ? "w-28" : "w-10"
          } invert mix-blend-lighten brightness-1000 contrast-200`}
        />
        <button onClick={() => setIsOpen(!isOpen)} className="text-white">
          {isOpen ? <FaChevronLeft size={20} /> : <FaChevronRight size={20} />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <div className="px-4 mt-4 space-y-2">
        <NavLink
          to="/temporary/admin/dashboard"
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
          to="/temporary/admin/dashboard/employees"
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
          to="/temporary/admin/dashboard/departments"
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
          to="/temporary/admin/dashboard/leaves"
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
          to="/temporary/admin/dashboard/attendance"
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
          to="/temporary/admin/dashboard/assets"
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
          to="/temporary/admin/dashboard/documents"
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

export default TemporaryAdminSidebar;
