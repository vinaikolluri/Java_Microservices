import React, { useEffect, useState, useCallback } from "react";
import { AuthService } from "../../service/authService";
import { EmployeeService } from "../../service/employeeService";
import {
  User,
  Mail,
  Building2,
  Shield,
  Phone,
  Calendar,
  MapPin,
  Tag,
  IdCardIcon,
  UserCircle,
  Mails,
  Edit,
} from "lucide-react"; // Import the Edit icon
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

export default function EmployeeProfile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [addressError, setAddressError] = useState(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false); // Track address edit state
  const [isEditingPhone, setIsEditingPhone] = useState(false); // Track phone edit state
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isAuthenticated } = AuthService.getUserData();

  const employeeManagementLink = import.meta.env.VITE_EMPLOYEE_MANAGEMENT;
  const token = sessionStorage.getItem("token");
  

  const fetchEmployeeDetails = useCallback(async () => {
    if (!user?.employeeId) {
      setError("Employee ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${employeeManagementLink}/api/employees/employee/${user.employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch employee details.");
      }

      const data = await response.json();
      setEmployee(data);
      setNewPhoneNumber(data.phoneNumber);
      EmployeeService.updateEmployee(user.employeeId, data);
    } catch (err) {
      console.error("Error in fetching employee details:", err);
      setError(err.message || "An error occurred while fetching employee details.");
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId, employeeManagementLink]);

  useEffect(() => {
    if (isAuthenticated && user?.employeeId) {
      fetchEmployeeDetails();
    } else {
      setError("User is not authenticated or Employee ID is missing.");
      setLoading(false);
    }
  }, [isAuthenticated, user?.employeeId, fetchEmployeeDetails]);

  const validateAddress = (address) => {
    if (!address || address.trim().length === 0) {
      return "Address is required.";
    }
    if (address.length < 5 || address.length > 100) {
      return "Address must be between 5 and 100 characters.";
    }
    if (!/^[#.0-9a-zA-Z\\s,-/ #]+$/.test(address)) {
      return "Address can only contain letters, numbers, commas, periods, and spaces.";
    }
    return null;
  };

  const handleUpdateAddress = async () => {
    const validationError = validateAddress(newAddress);
    if (validationError) {
      setAddressError(validationError);
      return;
    }
  
    setAddressError(null);
    setIsUpdating(true);
  
    try {
      const response = await fetch(
        `${employeeManagementLink}/api/employees/employee/${user.employeeId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: newAddress })
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the response as text
        throw new Error(errorText || "Failed to update address.");
        
      }
  
      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      setIsEditingAddress(false); // Exit edit mode after update
      fetchEmployeeDetails();
    } catch (err) {
      console.error("Error in updating address:", err);
      setError(err.message || "An error occurred while updating the address.");
    } finally {
      setIsUpdating(false);
    }
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return "Phone number is required.";
    const phoneWithoutCode = phone.replace("+91", "").trim();
    if (!/^\d{10}$/.test(phoneWithoutCode)) {
      return "Phone number must be exactly 10 digits.";
    }
    if (!/^[6789]\d{9}$/.test(phoneWithoutCode)) {
      return "Phone number must start with 6, 7, 8, or 9.";
    }
    return null;
  };

  const handleUpdatePhoneNumber = async () => {
    const validationError = validatePhoneNumber(newPhoneNumber);
    if (validationError) {
      setPhoneError(validationError);

      return;
    }

    setPhoneError(null);
    setIsUpdating(true);

    try {
      const token = sessionStorage.getItem("token")
      const response = await fetch(
        `${employeeManagementLink}/api/employees/employee/${user.employeeId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: newPhoneNumber})
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update phone number.");
      }

      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      setError(null);
      setIsEditingPhone(false); // Exit edit mode after update
      fetchEmployeeDetails();
    } catch (err) {
      console.error("Error in updating phone number:", err);
      setError(err.message || "An error occurred while updating phone number.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              {employee?.fullName ? (
                <span className="text-5xl font-bold text-blue-600">
                  {employee.fullName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <UserCircle className="h-20 w-20 text-blue-600" />
              )}
            </div>
            <p className="text-gray-500 mt-2">{employee?.status || "N/A"}</p>
            <h3 className="text-2xl font-semibold text-gray-800">{employee?.fullName || "N/A"}</h3>
            <p className="text-gray-500 mt-2">{employee?.role || "N/A"}</p>
            <p className="text-gray-500 mt-2">{employee?.designation || "N/A"}</p>
          </div>

          {/* Rectangle 2: General Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">General Details</h3>
            <DetailField icon={Mail} label="Email" value={employee?.email} />
            <DetailField icon={IdCardIcon} label="Employee ID" value={employee?.employeeId} />
            <DetailField icon={UserCircle} label="Gender" value={employee?.gender} />
            <DetailField icon={Shield} label="Role" value={employee?.role} />
          </div>

          {/* Rectangle 3: Personal Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Details</h3>
            <DetailField icon={Calendar} label="Date of Birth" value={employee?.dateOfBirth} />
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
              <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Address</p>
                {isEditingAddress ? (
                  <div className="flex flex-col space-y-2">
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {addressError && <p className="text-red-500 text-sm">{addressError}</p>}
                    <button
                      onClick={handleUpdateAddress}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition duration-300"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Save"}
                    </button>
                  </div>
                ) : (
                  <p className="font-medium truncate" title={employee?.address || "N/A"}>
                    {employee?.address || "N/A"}
                  </p>
                )}
              </div>
              {!isEditingAddress && (
                <Edit
                  className="h-5 w-5 text-gray-500 cursor-pointer hover:text-blue-600"
                  onClick={() => setIsEditingAddress(true)}
                />
              )}
            </div>

            <DetailField icon={Mails} label="Personal Email" value={employee?.targetEmail} />
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-500">Phone Number</p>
                {isEditingPhone ? (
                  <div className="flex flex-col space-y-2">
                    <PhoneInput
                      defaultCountry="IN"
                      international
                      value={newPhoneNumber}
                      onChange={setNewPhoneNumber}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
                    <button
                      onClick={handleUpdatePhoneNumber}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition duration-300"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Save"}
                    </button>
                  </div>
                ) : (
                  <p className="font-medium truncate" title={employee?.phoneNumber || "N/A"}>
                    {employee?.phoneNumber || "N/A"}
                  </p>
                )}
              </div>
              {!isEditingPhone && (
                <Edit
                  className="h-5 w-5 text-gray-500 cursor-pointer hover:text-blue-600"
                  onClick={() => setIsEditingPhone(true)}
                />
              )}
            </div>
          </div>

          {/* Rectangle 4: Employment Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Employment Details</h3>
            <DetailField icon={Building2} label="Department" value={employee?.department} />
            <DetailField icon={Building2} label="Designation" value={employee?.designation} />
            <DetailField icon={Shield} label="Employment Type" value={employee?.employeeType} />
            <DetailField icon={Tag} label="Date of Joining" value={employee?.dateOfJoining} />
          </div>
        </div>
      </div>
    </div>
  );
}

const DetailField = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
    <Icon className="h-5 w-5 text-blue-600 flex-shrink-0" />
    <div className="min-w-0">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800 truncate" title={value || "N/A"}>
        {value || "N/A"}
      </p>
    </div>
  </div>
);