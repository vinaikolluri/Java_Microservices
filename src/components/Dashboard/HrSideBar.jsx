import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FaBuilding,
  FaTachometerAlt,
  FaUsers,
  FaLaptop,
  FaCalendarAlt,
  FaFile,
  FaClock,
  FaBars,
} from "react-icons/fa";
import logo from "../../assets/logo.jpg";

const HrSidebar = ({ isOpen, setIsOpen, isHovered, setIsHovered }) => {
  const location = useLocation();

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
          to="/hr/dashboard"
          end
          className={({ isActive }) =>
            `${
              isActive ? "bg-teal-500 text-white" : "text-gray-300 hover:bg-gray-700"
            } flex items-center py-3 px-4 rounded-md transition-all`
          }
        >
          <FaTachometerAlt />
          {(isHovered || isOpen) && <span className="ml-3">Dashboard</span>}
        </NavLink>

        {[  
          { to: "/hr/dashboard/employees", icon: <FaUsers />, label: "Employees" },
          { to: "/hr/dashboard/departments", icon: <FaBuilding />, label: "Departments" },
          { to: "/hr/dashboard/leaves", icon: <FaCalendarAlt />, label: "Leaves" },
          { to: "/hr/dashboard/attendance", icon: <FaClock />, label: "Attendance" },
          { to: "/hr/dashboard/assets", icon: <FaLaptop />, label: "Assets" },
          { to: "/hr/dashboard/documents", icon: <FaFile />, label: "Documents" },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={`flex items-center py-3 px-4 rounded-md transition-all ${
              location.pathname.startsWith(to)
                ? "bg-teal-500 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            {icon}
            {(isHovered || isOpen) && <span className="ml-3">{label}</span>}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default HrSidebar;