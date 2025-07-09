import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import { AuthService } from "../../service/authService";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-phone-number-input/style.css";

export default function EditEmployee({ employee, onClose, onSave, endpoint }) {
  const [editedEmployee, setEditedEmployee] = useState(employee);
  const [loading, setLoading] = useState(false);

  const token = AuthService.getToken();
  const userManagementLink = import.meta.env.VITE_USER_MANAGEMENT;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee((prevEmployee) => ({
      ...prevEmployee,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setEditedEmployee((prevEmployee) => ({
      ...prevEmployee,
      phoneNumber: value?.replace(/\s+/g, "") || "",
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${userManagementLink}${endpoint}/${editedEmployee.employeeId}`, editedEmployee, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onSave(response.data);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: "Full Name", name: "fullName", value: editedEmployee.fullName, readOnly: true },
    { label: "Email", name: "email", value: editedEmployee.email, readOnly: true },
    { label: "Employee Id", name: "employeeId", value: editedEmployee.employeeId, readOnly: true },
    { label: "Phone Number", name: "phoneNumber", value: editedEmployee.phoneNumber, isPhoneInput: true, readOnly: true },
    { label: "Gender", name: "gender", value: editedEmployee.gender, readOnly: true },
    { label: "Date of Birth", name: "dateOfBirth", value: editedEmployee.dateOfBirth, readOnly: true },
    { label: "Designation", name: "designation", value: editedEmployee.designation, readOnly: false },
    { label: "Date of Joining", name: "dateOfJoining", value: editedEmployee.dateOfJoining, readOnly: true },
    { label: "Status", name: "status", value: editedEmployee.status, type: "select", options: ["ACTIVE", "INACTIVE"], readOnly: false }, // Added type: "select"
    { label: "Department", name: "department", value: editedEmployee.department, type: "select", options: ["React Js", "Java", "DevOps", "HR"], readOnly: false }, // Added type: "select"
    { label: "Employment Type", name: "employeeType", value: editedEmployee.employeeType, readOnly: true },
    { label: "Basic Salary", name: "basicSalary", value: editedEmployee.basicSalary, readOnly: false },
    { label: "Address", name: "address", value: editedEmployee.address, readOnly: true },
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white w-full max-w-4xl p-6 md:p-8 rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Edit Employee</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={field.value}
                    onChange={handleInputChange}
                    disabled={field.readOnly}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option, optionIdx) => (
                      <option key={optionIdx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.isPhoneInput ? (
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={field.value}
                    onChange={handlePhoneChange}
                    disabled={field.readOnly}
                    className={`mt-1 p-2 block w-full border border-gray-300 rounded-md ${field.readOnly ? 'cursor-not-allowed bg-gray-100' : ''}`}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={field.value}
                    onChange={handleInputChange}
                    readOnly={field.readOnly}
                    className={`mt-1 p-2 block w-full border border-gray-300 rounded-md ${field.readOnly ? 'cursor-not-allowed bg-gray-100' : ''}`}
                    disabled={field.readOnly}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="submit"
              className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type = "button"
              onClick={onClose}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}