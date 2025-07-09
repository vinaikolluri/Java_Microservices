import React, { useEffect, useState } from "react";
import { LeaveService } from "../../service/leaveService";
import { EmployeeService } from "../../service/employeeService";
import { Check, X, Search, Loader2 } from "lucide-react";

// Modal Component to show Leave Balance details
function LeaveBalanceModal({ isOpen, leaveBalance, onClose }) {
  if (!isOpen || !leaveBalance) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">
            Leave Balances for Employee {leaveBalance[0].employeeId}
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {leaveBalance.map((balance) => (
            <div key={balance.id} className="space-y-2">
              <p className="text-gray-700">
                <strong>Leave Type:</strong> {balance.leaveType}
              </p>
              <p className="text-gray-700">
                <strong>Total Leaves:</strong> {balance.totalLeaves}
              </p>
              <p className="text-gray-700">
                <strong>Used Leaves:</strong> {balance.usedLeaves}
              </p>
              <p className="text-gray-700">
                <strong>Remaining Leaves:</strong> {balance.remainingLeaves}
              </p>
              <p className="text-gray-700">
                <strong>Year:</strong> {balance.year}
              </p>
              <hr className="my-2" />
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal Component to show Leave Details
function LeaveDetailsModal({ isOpen, leave, onClose, onUpdateStatus }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null); // 'APPROVE' or 'REJECT'

  const handleStatusUpdate = async (leaveId, status) => {
    setIsProcessing(true);
    setProcessingAction(status === "APPROVED" ? "APPROVE" : "REJECT");
    try {
      await onUpdateStatus(leaveId, status);
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  if (!isOpen || !leave) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">Leave Details</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Employee Name:</strong> {leave.employeeName}
            </p>
            <p className="text-gray-700">
              <strong>Employee ID:</strong> {leave.employeeId}
            </p>
            <p className="text-gray-700">
              <strong>Leave Type:</strong> {leave.leaveType}
            </p>
            <p className="text-gray-700">
              <strong>Start Date:</strong> {leave.startDate}
            </p>
            <p className="text-gray-700">
              <strong>End Date:</strong> {leave.endDate}
            </p>
            <p className="text-gray-700">
              <strong>Reason:</strong> {leave.reason}
            </p>
            <p className="text-gray-700">
              <strong>Status:</strong>{" "}
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  leave.status === "PENDING"
                    ? "bg-yellow-200 text-yellow-700"
                    : leave.status === "APPROVED"
                    ? "bg-green-200 text-green-700"
                    : "bg-red-200 text-red-700"
                }`}
              >
                {leave.status}
              </span>
            </p>
          </div>
          
          {leave.status === "PENDING" ? (
            <div className="flex justify-center space-x-4">
              {/* Approve Button - only show if not processing reject */}
              {(processingAction !== "REJECT") && (
                <button
                  onClick={() => handleStatusUpdate(leave.id, "APPROVED")}
                  disabled={isProcessing}
                  className={`p-2 rounded-full transition-all flex items-center justify-center ${
                    isProcessing
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {isProcessing && processingAction === "APPROVE" ? (
                    <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Approving...
                    </>
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              )}
              
              {/* Reject Button - only show if not processing approve */}
              {(processingAction !== "APPROVE") && (
                <button
                  onClick={() => handleStatusUpdate(leave.id, "REJECTED")}
                  disabled={isProcessing}
                  className={`p-2 rounded-full transition-all flex items-center justify-center ${
                    isProcessing
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  {isProcessing && processingAction === "REJECT" ? (
                    <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Rejecting...
                    </>
                  ) : (
                    <X className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-center text-lg font-semibold text-gray-600">
              Leave has been {leave.status.toLowerCase()}.
            </p>
          )}
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-lg transition-all ${
              isProcessing
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeaveList() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when filter changes
  }, [employeeIdFilter, statusFilter]);

  useEffect(() => {  
    fetchLeavesAndEmployees();
    fetchLeaveBalances();
  }, [year]);

  const fetchLeavesAndEmployees = async () => {
    try {
      const leaveData = await LeaveService.hr.getAllLeaves();
      const employeeData = await EmployeeService.getEmployees();
  
      const employeeMap = employeeData.reduce((map, emp) => {
        map[emp.employeeId.toString()] = {
          fullName: emp.fullName,
          role: emp.role,
        };
        return map;
      }, {});
  
      const filteredLeaves = leaveData.map((leave) => ({
        ...leave,
        employeeName: employeeMap[leave.employeeId.toString()]?.fullName || "Unknown",
        employeeRole: employeeMap[leave.employeeId.toString()]?.role || "Unknown",
      }));
  
      setLeaves(filteredLeaves);
      setLoading(false);
    } catch (err) {
      setError("Error fetching leave or employee data.");
      setLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      const balances = await LeaveService.hr.getLeaveBalances(year);
      setLeaveBalances(balances);
    } catch (err) {
      setError("Error fetching leave balances.");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leaveId, status) => {
    try {
      setIsProcessing(true);
      
      const updatedLeave = await LeaveService.hr.processLeaveRequest(leaveId, {
        status: status.toUpperCase(),
        remarks: status === "APPROVED" ? "Approved by HR" : "Rejected by HR",
      });
      
      setIsDetailsModalOpen(true);
      setLeaves((prevLeaves) =>
        prevLeaves.map((leave) =>
          leave.id === leaveId ? { ...leave, status: updatedLeave.status } : leave
        )
      );

      setSelectedLeave((prevLeave) => ({
        ...prevLeave,
        status: updatedLeave.status,
      }));

      // Update leave balances
      setLeaveBalances((prevBalances) =>
        prevBalances.map((balance) =>
          balance.employeeId === updatedLeave.employeeId
            ? {
                ...balance,
                usedLeaves: status === "APPROVED" ? balance.usedLeaves + 1 : balance.usedLeaves,
                remainingLeaves:
                  status === "APPROVED" ? balance.remainingLeaves - 1 : balance.remainingLeaves,
              }
            : balance
        )
      );
      fetchLeavesAndEmployees();
    fetchLeaveBalances();
    } catch (error) {
      console.error("Error updating leave status.", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowLeaveBalance = (employeeId) => {
    const balances = leaveBalances.filter(
      (balance) => balance.employeeId === Number(employeeId)
    );
    setSelectedLeaveBalance(balances.length > 0 ? balances : null);
    setIsBalanceModalOpen(true);
  };

  const handleShowLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setIsDetailsModalOpen(true);
  };

  const handleCloseBalanceModal = () => {
    setIsBalanceModalOpen(false);
    setSelectedLeaveBalance(null);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedLeave(null);
  };

  const filteredLeaves = leaves.filter((leave) => {
    const statusMatch = statusFilter ? leave.status === statusFilter : true;
    const employeeMatch = employeeIdFilter
      ? leave.employeeId.toString().includes(employeeIdFilter)
      : true;
    return statusMatch && employeeMatch;
  });

  const indexOfLastLeave = currentPage * itemsPerPage;
  const indexOfFirstLeave = indexOfLastLeave - itemsPerPage;
  const currentLeaves = filteredLeaves.slice(indexOfFirstLeave, indexOfLastLeave);

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage >= totalPages;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header and Filters */}
      <h1 className="text-3xl font-bold mb-4 text-gray-700">Leave Requests</h1>
      <div className="flex justify-between items-center mb-6">
        <div className="mb-4 relative overflow-hidden">
          <input
            type="text"
            placeholder="Enter Employee Id here..."
            value={employeeIdFilter}
            onChange={(e) => setEmployeeIdFilter(e.target.value)}
            className="w-80 p-2 pl-12 border rounded-md"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
        </div>
        <div className="flex items-center space-x-4 p-3 rounded-lg">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 pr-1 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Leave Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentLeaves.map((leave) => (
              <tr key={leave.id}>
                <td className="px-6 py-4 whitespace-nowrap">{leave.employeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.leaveType}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.startDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">{leave.endDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      leave.status === "PENDING"
                        ? "bg-yellow-200 text-yellow-700"
                        : leave.status === "APPROVED"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-200 text-red-700"
                    }`}
                  >
                    {leave.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleShowLeaveDetails(leave)}
                    className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleShowLeaveBalance(leave.employeeId)}
                    className="ml-2 p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    Show Leave Balance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center space-x-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          className={`px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 ${
            isPrevDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Prev
        </button>
        <span className="text-lg font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isNextDisabled}
          className={`px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 ${
            isNextDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Next
        </button>
      </div>

      {/* Modals */}
      <LeaveBalanceModal
        isOpen={isBalanceModalOpen}
        leaveBalance={selectedLeaveBalance}
        onClose={handleCloseBalanceModal}
      />

      <LeaveDetailsModal
        isOpen={isDetailsModalOpen}
        leave={selectedLeave}
        onClose={handleCloseDetailsModal}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}