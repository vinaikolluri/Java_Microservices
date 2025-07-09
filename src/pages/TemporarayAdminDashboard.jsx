import {React, useState} from 'react'
import TemporaryAdminSidebar from '../components/Dashboard/TemporaryAdminSidebar'
import Navbar from '../components/Dashboard/Navbar'
import { Outlet } from 'react-router-dom'

const TemporarayAdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar state moved here

  return (
    <div className="flex">
      {/* Sidebar with Toggle Control */}
      <TemporaryAdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content - Adjusts based on Sidebar State */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"} flex-1 bg-gray-100 h-screen`}>
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default TemporarayAdminDashboard
