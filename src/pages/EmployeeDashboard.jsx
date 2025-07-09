import React, { useState } from 'react';
import EmpSidebar from './../components/EmpDashboard/EmpSidebar'
import Navbar from '../components/Dashboard/Navbar';
import { Outlet } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open/close state

  return (
    <div className="flex">
      {/* Sidebar with Toggle Control */}
      <EmpSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content - Adjusts based on Sidebar State */}
      <div
        className={`transition-all duration-300 flex-1 bg-gray-100 h-screen ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
