import React, { useState } from 'react';
import AdminSidebar from '../components/Dashboard/AdminSidebar';
import Navbar from '../components/Dashboard/Navbar';
import { Outlet } from 'react-router-dom';

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open/close state

  return (
    <div className="flex">
      {/* Sidebar with Toggle Control */}
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

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

export default AdminDashboard;