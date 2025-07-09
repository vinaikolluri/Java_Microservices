import React, { useState } from "react";

const AccessManagement = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Deepika Reddy",
      employeeId: "1004",
      emailId: "deepika@gmail.com",
      department: "Java",
      role: "EMPLOYEE",
      status: "Active",
      hasAccess: false,
    },
    {
      id: 2,
      name: "Manasa Garnampalli",
      employeeId: "1002",
      emailId: "manasa@gmail.com",
      department: "HR",
      role: "HR",
      status: "Active",
      hasAccess: true,
    },
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mailId, setMailId] = useState("");
  const [password, setPassword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleGiveAccess = (employee) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleRevokeAccess = (employeeId) => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === employeeId ? { ...emp, hasAccess: false } : emp
      )
    );
  };

  const handleConfirmAccess = () => {
    setEmployees((prevEmployees) =>
      prevEmployees.map((emp) =>
        emp.id === selectedEmployee.id ? { ...emp, hasAccess: true } : emp
      )
    );
    setDialogOpen(false);
    setMailId("");
    setPassword("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Access Management</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Email Id</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id} className="border-b">
                <td className="px-4 py-2">{employee.name}</td>
                <td className="px-4 py-2">{employee.employeeId}</td>
                <td className="px-4 py-2">{employee.emailId}</td>
                <td className="px-4 py-2">{employee.department}</td>
                <td className="px-4 py-2">{employee.role}</td>
                <td className="px-4 py-2">{employee.status}</td>
                <td className="px-4 py-2">
                  {employee.hasAccess ? (
                    <button
                      onClick={() => handleRevokeAccess(employee.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Revoke Access
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGiveAccess(employee)}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Give Access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-10">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Give Access to {selectedEmployee?.name}
            </h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Create Mail ID"
                value={mailId}
                onChange={(e) => setMailId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleConfirmAccess}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Give Access
              </button>
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessManagement;
