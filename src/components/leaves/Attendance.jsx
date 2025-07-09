import React, { useEffect, useState } from "react";
import { AttendanceService } from "../../service/attendanceService";
import * as XLSX from "xlsx";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 7;
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    const storedEmployees = JSON.parse(sessionStorage.getItem("employees")) || [];
    setEmployees(storedEmployees);
    fetchAttendance(startDate, endDate);
  }, []);

  const fetchAttendance = async (startDate, endDate) => {
    try {
      let data;
      if (selectedEmployeeId) {
        data = await AttendanceService.getAttendanceSummary(selectedEmployeeId, startDate, endDate);
      } else {
        data = await AttendanceService.getAllAttendanceSummary(startDate, endDate);
      }
      
      setAttendanceData(data);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      setError("Failed to fetch attendance. Please check the dates and try again.");
    }
  };
  

  const handleDownload = async () => {
    try {
      let fileContent;
      if (selectedEmployeeId) {
        fileContent = await AttendanceService.getAttendanceLeavesForEmployee(selectedEmployeeId, startDate, endDate);
      } else {
        fileContent = await AttendanceService.getAttendanceLeaves(startDate, endDate);
      }

      if (fileContent instanceof Blob) {
        const url = window.URL.createObjectURL(fileContent);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = selectedEmployeeId 
          ? `attendance_${selectedEmployeeId}_${startDate}_to_${endDate}.xlsx`
          : `attendance_leaves_${startDate}_to_${endDate}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const worksheet = XLSX.utils.json_to_sheet(fileContent);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Leaves");
        XLSX.writeFile(workbook, 
          selectedEmployeeId 
            ? `attendance_${selectedEmployeeId}_${startDate}_to_${endDate}.xlsx` 
            : `attendance_leaves_${startDate}_to_${endDate}.xlsx`
        );
      }
    } catch (error) {
      console.error("Error downloading attendance:", error.message);
    }
  };

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentRecords = attendanceData.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(attendanceData.length / recordsPerPage);


  const formatTime = (time) => {
    if (!time) return "N/A"; 
    try {
      return new Date(time).toLocaleTimeString();
    } catch (error) {
      console.error("Error formatting time:", error);
      return "N/A";
    }
  };

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return "00:00:00"; 

    // Assuming workingHours is in hours (e.g., 0.016666666666666666 = 1 minute)
    const totalSeconds = Math.round(workingHours * 3600); // Convert hours to seconds

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-700">Attendance Management</h1>

      {/* Date Picker, Employee Selection, Fetch & Download Buttons */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-40"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-40"
          />
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="p-2 border border-gray-300 rounded w-40"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeId} ({emp.fullName})
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchAttendance(startDate, endDate)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
          >
            Fetch Attendance
          </button>
          <button
            onClick={handleDownload}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            Download
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* ✅ Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1000px] w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr className="text-left">
              <th className="p-3 border w-32">Employee ID</th>
              <th className="p-3 border w-32">Name</th>
              <th className="p-3 border w-40">Check-In Time</th>
              <th className="p-3 border w-40">Check-Out Time</th>
              <th className="p-3 border w-28">Working Hours</th>
              <th className="p-3 border w-28">Date</th>
              <th className="p-3 border w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((record, index) => (
                <tr key={index} className="border hover:bg-gray-100">
                  <td className="p-3 border">{record.employeeId}</td>
                  <td className="p-3 border">
                    {employees.find((emp) => emp.employeeId === record.employeeId)?.fullName || "N/A"}
                  </td>
                  <td className="p-3 border">{formatTime(record.checkIn)}</td>
                  <td className="p-3 border">{formatTime(record.checkOut)}</td>
                  <td className="p-3 border">
                    {formatWorkingHours(record.workingHours)}
                  </td>
                  <td className="p-3 border">{record.date ? new Date(record.date).toLocaleDateString() : "N/A"}</td>
                  <td className="p-3 border">{record.status || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center p-4">No attendance records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {attendanceData.length > recordsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Previous
          </button>

          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Attendance;
