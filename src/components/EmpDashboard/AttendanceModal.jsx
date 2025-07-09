import React from "react";

const AttendanceModal = ({ isOpen, onClose, summary, allAttendances, hrSummary, isHR }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Attendance Summary</h2>
        {!isHR && summary && (
          <div>
            <p>Total Hours: {summary.totalHours}</p>
            <p>Days Present: {summary.daysPresent}</p>
            <p>Days Absent: {summary.daysAbsent}</p>
          </div>
        )}
        {isHR && allAttendances.length > 0 && (
          <ul>
            {allAttendances.map((attendance) => (
              <li key={attendance.id} className="mb-2">
                Employee ID: {attendance.employeeId}, Check In: {attendance.checkInTime}, Check Out: {attendance.checkOutTime}
              </li>
            ))}
          </ul>
        )}
        {isHR && Object.keys(hrSummary).length > 0 && (
          <ul>
            {Object.entries(hrSummary).map(([employeeId, summaryData]) => (
              <li key={employeeId} className="mb-2">
                Employee ID: {employeeId}, Total Hours: {summaryData.totalHours}, Days Present: {summaryData.daysPresent}, Days Absent: {summaryData.daysAbsent}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AttendanceModal;