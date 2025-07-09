import React from "react";
import { X } from "lucide-react";

const ViewEmployee = ({ employee, onClose }) => {
  // Define the fields to display
  const fields = [
    { label: "Full Name", key: "fullName" },
    { label: "Email", key: "email" },
    { label: "Employee ID", key: "employeeId" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Personal Email", key: "targetEmail" },
    { label: "Gender", key: "gender" },
    { label: "Date of Birth", key: "dateOfBirth" },
    { label: "Designation", key: "designation" },
    { label: "Date of Joining", key: "dateOfJoining" },
    { label: "Status", key: "status" },
    { label: "Department", key: "department" },
    { label: "Employment Type", key: "employeeType" },
    { label: "Role", key: "role" },
    { label: "Basic Salary", key: "basicSalary" },
    { label: "Address", key: "address" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-sm bg-black/50">
      <div className="relative bg-white w-full max-w-4xl p-6 md:p-8 rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Employee Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="text"
                value={employee[key] || ""}
                readOnly
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;