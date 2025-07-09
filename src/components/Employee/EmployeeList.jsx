import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Eye, Search, UserPlus } from "lucide-react";
import EmployeeForm from "./EmployeeForm";
import EditEmployee from "./EditEmployee";
import ViewEmployee from "./ViewEmployee";
import { getRequest, postRequest } from "../../pages/api";
import { EmployeeService } from "../../service/employeeService";
import { AuthService } from "../../service/authService";

export default function EmployeeList() {
  const { user } = AuthService.getUserData();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState({ visible: false, role: null });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // const userManagementLink = import.meta.env.VITE_USER_MANAGEMENT;
  const isAdmin = user?.role === "ADMIN";
  const employeeId = user?.employeeId;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    EmployeeService.fetchEmployeesFromDatabase();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset pagination when search term changes
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      const endpoint = isAdmin
        ? "/admin/getAllEmployees"
        : "/hr/getAllEmployees";
      const data = await getRequest(endpoint);
      const employeesWithRoles = data.map((emp) => ({
        ...emp,
        role: emp.role || "EMPLOYEE",
      }));
      setEmployees(employeesWithRoles);
    } catch (error) {
      console.error("Error fetching employees:", error.message);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
  };

  const handleViewClick = (employee) => {
    setViewingEmployee(employee);
  };

  const handleDeleteEmployee = async (id) => {
    try {
      const endpoint = isAdmin
        ? `/admin/delete/employees/${id}`
        : `/hr/delete/employees/${id}`;
      await postRequest(endpoint, {});
      setEmployees(employees.filter((emp) => emp.id !== id));
    } catch (error) {
      console.error("Error deleting employee:", error.message);
    }
  };

  const handleAddClick = (role) => {
    setShowModal({ visible: true, role });
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      )
    );
    setEditingEmployee(null);
  };

  const renderAddButtons = () => {
    if (isAdmin) {
      return (
        <>
          <button
            onClick={() => handleAddClick("EMPLOYEE")}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Employee</span>
          </button>
          <button
            onClick={() => handleAddClick("HR")}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add HR</span>
          </button>
        </>
      );
    }
    return (
      <button
        onClick={() => handleAddClick("EMPLOYEE")}
        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-2"
      >
        <UserPlus className="h-5 w-5" />
        <span>Add Employee</span>
      </button>
    );
  };

  return (
    <div className="p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employees</h2>
        <div className="flex">{renderAddButtons()}</div>
      </div>

      <div className="mb-4 relative overflow-hidden">
        <input
          type="text"
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pl-12 border rounded-md"
        />
        <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Full Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
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
            {paginatedEmployees.map((employee, index) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {startIndex + index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.employeeId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {employee.status}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewClick(employee)}
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      className="text-yellow-600 hover:text-yellow-800"
                      onClick={() => handleEditClick(employee)}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    {/* <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button> */}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal.visible && (
        <EmployeeForm
          role={showModal.role}
          endpoint={
            isAdmin
              ? showModal.role === "HR"
                ? "/admin/register/hr"
                : "/admin/register/employee"
              : "/hr/register/employee"
          }
          onClose={() => setShowModal({ visible: false, role: null })}
          onEmployeeAdded={() => window.location.reload()}
        />
      )}
      {editingEmployee && (
        <EditEmployee
          role={showModal.role}
          endpoint={
            isAdmin ? "/api/hr/update/employee" : "/api/admin/update/employee"
          }
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleUpdateEmployee}
        />
      )}
      {viewingEmployee && (
        <ViewEmployee
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
        />
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt; Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
