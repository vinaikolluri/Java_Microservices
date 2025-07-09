import React, { useState, useEffect } from "react";
import { LeaveService } from "../../service/leaveService";
import { AuthService } from "../../service/authService";
import { Calendar, AlertCircle } from "lucide-react";

export default function EmployeeLeaves() {
  const { user, isAuthenticated } = AuthService.getUserData();
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user?.employeeId) {
      fetchLeavesAndBalance();
    }
  }, [user?.employeeId]);

  const fetchLeavesAndBalance = async () => {
    if (user?.employeeId) {
      try {
        const [userLeaves, currentLeaveBalance] = await Promise.all([
          LeaveService.employee.getLeaves(),
          LeaveService.employee.getBalances()
        ]);

        const balance = {};
        currentLeaveBalance.forEach(item => {
          balance[item.leaveType.toLowerCase() + "Leave"] = item.remainingLeaves;
        });

        setLeaves(userLeaves);
        setLeaveBalance(balance);
      } catch (error) {
        setErrorMessage("Failed to fetch leave data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!formData.type) {
      errors.type = "Leave type is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);

      if (formData.type === "SICK") {
        if (startDate < today) {
          errors.startDate = "Cannot apply SICK leave for past dates";
        }
      } else {
        // For non-SICK leaves, must be at least one day in advance
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (startDate < tomorrow) {
          errors.startDate = "Regular leaves must be applied at least one day in advance";
        }
      }
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = "End date cannot be before start date";
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      errors.reason = "Reason must be at least 10 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    if (!validateForm()) {
      return;
    }
  
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
  
    try {
      const newLeave = {
        employeeId: user.employeeId,
        leaveType: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      };
  
      await LeaveService.employee.applyLeave(newLeave);
      
      setSuccessMessage("Leave applied successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
  
      await fetchLeavesAndBalance();
      
      // Reset form
      setFormData({ type: "", startDate: "", endDate: "", reason: "" });
      setShowForm(false);
    } catch (error) {
      let errorMsg = "Failed to apply leave. Please try again.";
      
      // Handle Spring Boot error response format
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMsg = error.response.data.message;
        }
        else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
  
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(""), 5000);
      console.error("Leave application error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My Leaves</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setErrorMessage("");
            setValidationErrors({});
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
        >
          Request Leave
        </button>
      </div>

      {successMessage && (
  <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg shadow-md">
    {successMessage}
  </div>
)}

{errorMessage && (
  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg shadow-md flex items-center gap-2">
    <AlertCircle className="h-5 w-5" />
    <span>{errorMessage}</span>
  </div>
)}

      {/* Leave Balance Section */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Leave Balance
        </h3>
        {loading ? (
          <p className="text-gray-600">Loading leave balance...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-800">Sick Leave</p>
              <p className="text-2xl font-bold text-blue-600">
                {leaveBalance.sickLeave || 0} days
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <p className="text-sm text-green-800">Casual Leave</p>
              <p className="text-2xl font-bold text-green-600">
                {leaveBalance.casualLeave || 0} days
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.type ? "border-red-500" : ""
                }`}
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value });
                  setValidationErrors({ ...validationErrors, type: "" });
                }}
              >
                <option value="">Select Type</option>
                <option value="SICK">Sick Leave</option>
                <option value="CASUAL">Casual Leave</option>
                <option value="OTHER">Other Leave</option>
              </select>
              {validationErrors.type && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.startDate ? "border-red-500" : ""
                  }`}
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    setValidationErrors({ ...validationErrors, startDate: "" });
                  }}
                  min={formData.type === "SICK" ? today : tomorrowStr}
                />
                {validationErrors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.endDate ? "border-red-500" : ""
                  }`}
                  value={formData.endDate}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    setValidationErrors({ ...validationErrors, endDate: "" });
                  }}
                  min={formData.startDate || today}
                  disabled={!formData.startDate}
                />
                {validationErrors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.reason ? "border-red-500" : ""
                }`}
                rows={3}
                value={formData.reason}
                onChange={(e) => {
                  setFormData({ ...formData, reason: e.target.value });
                  setValidationErrors({ ...validationErrors, reason: "" });
                }}
                placeholder="Explain the reason for your leave (minimum 10 characters)"
              />
              {validationErrors.reason && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.reason}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setValidationErrors({});
                }}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg shadow-lg transition duration-300 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-xl"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Leave History Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave History</h3>
        
        {leaves.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaves.map((leave) => {
              const startDate = leave.startDate ? new Date(leave.startDate) : null;
              const endDate = leave.endDate ? new Date(leave.endDate) : null;
              
              const duration = startDate && endDate ? 
                Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 
                'N/A';

              return (
                <div 
                  key={leave.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 transition-all hover:shadow-lg"
                  style={{
                    borderLeftColor: 
                      leave.status === "APPROVED" ? "#10B981" : 
                      leave.status === "PENDING" ? "#F59E0B" : 
                      "#EF4444"
                  }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            leave.type === "SICK" ? "bg-blue-100 text-blue-800" :
                            leave.type === "CASUAL" ? "bg-green-100 text-green-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>
                            {leave.leaveType}
                          </span>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {startDate ? startDate.toLocaleDateString() : 'N/A'} - {endDate ? endDate.toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">Reason: {leave.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        leave.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        leave.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                      <span>
                        Total Days: {duration} {duration === 1 ? 'day' : 'days'}
                      </span>
                      {/* <span>
                        Applied on: {today}
                      </span> */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-3 text-lg font-medium text-gray-700">No leave history found</h4>
            <p className="mt-1 text-gray-500">You haven't applied for any leaves yet</p>
          </div>
        )}
      </div>
    </div>
  );
}