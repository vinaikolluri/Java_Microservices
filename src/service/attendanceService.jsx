const attendanceServiceLink = import.meta.env.VITE_ATTENDANCE_LEAVE_MANAGEMENT;

export const AttendanceService = {
  // Employee Attendance Endpoints
  checkIn: async (employeeId) => {
    const response = await fetch(`${attendanceServiceLink}/api/employee/attendance/check-in?employeeId=${employeeId}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Failed to check in.");
    }
    return response.json();
  },

  checkOut: async (employeeId, workDescription) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/employee/attendance/check-out?employeeId=${employeeId}&workDescription=${workDescription}`,
      {
        method: "POST",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to check out.");
    }
    return response.json();
  },


  getAttendanceSummaryByEmployee: async (employeeId, startDate, endDate) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/employee/attendance/${employeeId}/range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch attendance summary for the employee.");
    }
    return response.json();
  },

  getEmployeeById: async (employeeId) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/employee/attendance/${employeeId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch employee attendance record.");
    }
    return response.json();
  },


  // HR Attendance Endpoints

  getAttendanceSummary: async (employeeId, startDate, endDate) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/hr/attendance/summary/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch attendance summary.");
    }
    return response.json();
  },

  getAllAttendanceSummary: async (startDate, endDate) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/hr/attendance/range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch all attendance summaries.");
    }
    return response.json();
  },
  
  getAttendanceLeaves: async (startDate, endDate) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/export/attendance-leaves?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch attendance leaves.");
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.blob();
    }
  },

  getAttendanceLeavesForEmployee: async (employeeId,startDate, endDate) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/export/attendance-leaves/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch attendance leaves.");
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    } else {
      return response.blob();
    }
  },

  getEmployeeAttendanceByHR: async (employeeId) => {
    const response = await fetch(
      `${attendanceServiceLink}/api/hr/attendance/employee/${employeeId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch employee attendance record by HR.");
    }
    return response.json();
  },
};