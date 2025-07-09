import React, { useState, useEffect } from "react";
import { AttendanceService } from "../../service/attendanceService";
import { AuthService } from "../../service/authService";
import { FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { format, differenceInHours, differenceInMinutes, parseISO } from 'date-fns';

const formatTime = (timeString) => {
  if (!timeString) return "--:--";
  try {
    const date = new Date(timeString);
    return format(date, 'hh:mm a');
  } catch (error) {
    console.error("Error formatting time:", error.message);
    return "--:--";
  }
};

const calculateWorkingHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return "--:--";
  try {
    const start = parseISO(checkIn);
    const end = parseISO(checkOut);
    const hours = differenceInHours(end, start);
    const minutes = differenceInMinutes(end, start) % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error calculating working hours:", error);
    return "--:--";
  }
};

const EmployeeAttendance = () => {
  const { user, isAuthenticated } = AuthService.getUserData();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [timer, setTimer] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [checkInTimestamp, setCheckInTimestamp] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  const employeeId = user?.employeeId;
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!isAuthenticated) {
      console.error("User is not authenticated. Redirecting to login...");
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (employeeId) {
      fetchAttendance();
    }
  }, [employeeId]);

  useEffect(() => {
    const storedCheckInTimestamp = sessionStorage.getItem("checkInTimestamp");
    if (storedCheckInTimestamp) {
      setCheckInTimestamp(Number(storedCheckInTimestamp));
      setIsCheckedIn(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isCheckedIn && checkInTimestamp) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - checkInTimestamp) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTimestamp]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await AttendanceService.getEmployeeById(employeeId);
      const records = Array.isArray(data) ? data : [data];
      setAttendanceRecords(records);

      const todayRec = records.find(rec => rec.date.split("T")[0] === today);
      setTodayRecord(todayRec);

      if (todayRec) {
        if (todayRec.checkIn && !todayRec.checkOut) {
          setIsCheckedIn(true);
          const checkInTime = new Date(todayRec.checkIn).getTime();
          setCheckInTimestamp(checkInTime);
          sessionStorage.setItem("checkInTimestamp", checkInTime);
        } else if (todayRec.checkIn && todayRec.checkOut) {
          setIsCheckedIn(false);
          sessionStorage.removeItem("checkInTimestamp");
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (isCheckedIn || (todayRecord && todayRecord.checkOut)) return;
    
    try {
      await AttendanceService.checkIn(employeeId);
      const checkInTime = Date.now();
      setCheckInTimestamp(checkInTime);
      sessionStorage.setItem("checkInTimestamp", checkInTime);
      await fetchAttendance();
      setIsCheckedIn(true);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleCheckOutClick = () => {
    setShowPopup(true);
  };

  const handleConfirmCheckout = async () => {
    try {
      await AttendanceService.checkOut(employeeId);
      await fetchAttendance();
      setIsCheckedIn(false);
      setShowPopup(false);
      sessionStorage.removeItem("checkInTimestamp");
    } catch (error) {
      console.error(error.message);
    }
  };

  const formatTimer = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiCheckCircle /> Present</span>;
      case 'absent':
        return <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiAlertCircle /> Absent</span>;
      case 'late':
        return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiClock /> Late</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Attendance</h2>
          
        </div>
        
        <div className="relative w-full md:w-auto">
          <button
            onClick={isCheckedIn ? handleCheckOutClick : handleCheckIn}
            disabled={todayRecord?.checkOut}
            className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all w-full md:w-48
              ${todayRecord?.checkOut ? 'bg-gray-400 cursor-not-allowed' : 
                isCheckedIn ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              flex items-center justify-center gap-2`}
          >
            {todayRecord?.checkOut ? (
              <>
                <FiCheckCircle /> Done for today
              </>
            ) : isCheckedIn ? (
              <>
                <FiClock /> {formatTimer(timer)}
              </>
            ) : (
              <>
                <FiClock /> Clock In
              </>
            )}
          </button>
          
          {todayRecord?.checkIn && !todayRecord?.checkOut && (
            <p className="text-xs text-gray-500 mt-1 text-center">
              Last clock-in at {formatTime(todayRecord.checkIn)}
            </p>
          )}
        </div>
      </div>
      


      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white shadow-xl rounded-xl p-8 w-96 text-center">
            <div className="mb-6">
              <FiClock className="mx-auto text-4xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Confirm Clock Out</h3>
            <p className="text-gray-600 mb-6">
              You've worked for {formatTimer(timer)} today. Are you sure you want to clock out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={handleConfirmCheckout}
              >
                Yes, Clock Out
              </button>
              <button 
                className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg transition-colors"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.date.split("T")[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(record.checkIn)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(record.checkOut)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateWorkingHours(record.checkIn, record.checkOut)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(record.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Attendance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Present Days</p>
            <p className="text-2xl font-bold text-blue-600">
              {attendanceRecords.filter(r => r.status?.toLowerCase() === 'present').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Absent Days</p>
            <p className="text-2xl font-bold text-red-600">
              {attendanceRecords.filter(r => r.status?.toLowerCase() === 'absent').length}
            </p>
          </div>
          {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Average Working Hours</p>
            <p className="text-2xl font-bold text-green-600">
              {attendanceRecords.length > 0 
                ? attendanceRecords
                    .filter(r => r.checkIn && r.checkOut)
                    .reduce((acc, curr) => {
                      const [h, m] = calculateWorkingHours(curr.checkIn, curr.checkOut).split(':');
                      return acc + parseInt(h) + parseInt(m)/60;
                    }, 0) / attendanceRecords.filter(r => r.checkIn && r.checkOut).length || 0
                : 0
              }h
            </p>
          </div> */}
        </div>
      </div>
    </div>
    
  );
};

export default EmployeeAttendance;