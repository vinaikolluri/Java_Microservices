import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { EmployeeService } from "../../service/employeeService";
import axios from "axios";
import { AuthService } from "../../service/authService";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

const EmployeeForm = ({ onClose, role, onEmployeeAdded, endpoint }) => {
  const [employeeData, setEmployeeData] = useState({
    fullName: "",
    email: "",
    employeeId: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    designation: "",
    dateOfJoining: "",
    status: "",
    department: "",
    role: role || "EMPLOYEE",
    address: "",
    employeeType: "",
    password: "",
    basicSalary: "",
    targetEmail: "", // New field for Personal Email ID
  });

  const [errors, setErrors] = useState({});
  const token = AuthService.getToken();
  const { user } = AuthService.getUserData();
  const isAdmin = user?.role === 'ADMIN';

  const dobRef = useRef(null);
  const dojRef = useRef(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const userManagementLink = import.meta.env.VITE_USER_MANAGEMENT;

  useEffect(() => {
    const fetchNextEmployeeId = async () => {
      try {
        const lastId = await EmployeeService.getLastEmployeeId();
        setEmployeeData((prevData) => ({
          ...prevData,
          employeeId: lastId + 1,
        }));
      } catch (error) {
        console.error("Error fetching last employee ID:", error.message);
      }
    };

    fetchNextEmployeeId();
  }, []);

  const validate = () => {
    const newErrors = {};

    const dob = new Date(employeeData.dateOfBirth);
    const today = new Date();
    const dobYear = dob.getFullYear();
    const age = today.getFullYear() - dob.getFullYear();
    const ageMonth = today.getMonth() - dob.getMonth();
    if (String(dobYear).length !== 4) {
      newErrors.dateOfBirth = "Year must be 4 digits only.";
    } else if (age < 18 || age > 55 || (age === 18 && ageMonth < 0)) {
      newErrors.dateOfBirth =
        "Employee minimum and maximum age must be 18 and 55 years old.";
    }

    const joiningDate = new Date(employeeData.dateOfJoining);
    const threeMonthsPast = new Date(today);
    const threeMonthsFuture = new Date(today);
    const dojYear = joiningDate.getFullYear();
    threeMonthsPast.setMonth(today.getMonth() - 3);
    threeMonthsFuture.setMonth(today.getMonth() + 3);

    if (String(dojYear).length !== 4) {
      newErrors.dateOfJoining = "Year must be 4 digits only.";
    } else if (
      joiningDate < threeMonthsPast ||
      joiningDate > threeMonthsFuture
    ) {
      newErrors.dateOfJoining =
        "Date of Joining must be within 3 months past or future.";
    }

    const fullNameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
if (!fullNameRegex.test(employeeData.fullName)) {
  newErrors.fullName =
    "Full name must contain first and last name, each starting with a capital letter, separated by one space.";
}

const passwordRegex =
/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?!.*\s).*$/;
if (!passwordRegex.test(employeeData.password)) {
newErrors.password =
  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.";
}

    const phoneRegexStart = /^\+\d{1,3}[6-9]/; 
    const phoneRegexLength = /^\+\d{1,3}[6-9]\d{9}$/; 

    if (!phoneRegexStart.test(employeeData.phoneNumber)) {
        newErrors.phoneNumber =
        "Phone number must start with digits 9, 8, 7, or 6 and include the country code.";
    } else if (!phoneRegexLength.test(employeeData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must be exactly 10 digits (excluding country code).";
    }

    const emailRegex = /^[A-Za-z0-9+_.-]+@(gmail\.com|outlook\.com)$/;
if (!emailRegex.test(employeeData.email)) {
  newErrors.email = "Email must end with @gmail.com or @outlook.com.";
}


const targetEmailRegex = /^[A-Za-z0-9+_.-]+@(gmail\.com|outlook\.com)$/;
if (!targetEmailRegex.test(employeeData.targetEmail)) {
  newErrors.targetEmail = "Email must end with @gmail.com or @outlook.com.";
}

    if (
      isNaN(employeeData.basicSalary) ||
      Number(employeeData.basicSalary) <= 0
    ) {
      newErrors.basicSalary = "Basic salary must be a positive number.";
    }

    const addressRegex = /^[#.0-9a-zA-Z\s,\-/]+$/;
if (!addressRegex.test(employeeData.address)) {
  newErrors.address =
    "Address can only contain letters, numbers, spaces, and the following special characters: # . , - /.";
}

    const designationRegex = /^[A-Za-z ]{5,50}$/;
    if (!designationRegex.test(employeeData.designation)) {
      newErrors.designation =
        "Designation must be between 6 and 50 characters";
    }

    if (
      employeeData.designation.length < 5 ||
      employeeData.designation.length > 50
    ) {
      newErrors.designation =
        "Designation must be between 5 and 50 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "role") return;
    setEmployeeData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value) => {
    setEmployeeData((prevData) => ({
      ...prevData,
      phoneNumber: value?.replace(/\s+/g, "") || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validate()) {
      try {
        const response = await axios.post(
          `${userManagementLink}/api${endpoint}`,
          employeeData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onEmployeeAdded(response.data);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          onClose();
        }, 2000);
      } catch (error) {
        if (error.response && error.response.data.errors) {
          // Handle backend validation errors
          setErrors(error.response.data.errors);
        } else if ((error.response && error.response.status === 500 )|| (error.response && error.response.status === 409 )){
          const errorMessage = error.response.data.error;
          if (errorMessage.includes("Email")) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              email: "Email already registered.",
            }));
          } else if (errorMessage.includes("Duplicate entry")) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              phoneNumber: "Phone number already registered.",
            }));
          }
        } else {
          console.error("Error adding employee:", error);
          alert("An error occurred while adding the employee.");
        }
      }
    }
  };

  const fields = [
    { label: "Full Name", type: "text", name: "fullName", error: errors.fullName },
    { label: "Email", type: "email", name: "email", error: errors.email },
    { label: "Personal Email ID", type: "email", name: "targetEmail" }, // New field
    { label: "Employee Id", type: "number", name: "employeeId", readOnly: true },
    { label: "Phone Number", type: "tel", name: "phoneNumber", error: errors.phoneNumber, isPhoneInput: true },
    { label: "Gender", type: "select", name: "gender", options: ["MALE", "FEMALE", "OTHER"] },
    { label: "Date of Birth", type: "date", name: "dateOfBirth", error: errors.dateOfBirth, ref: dobRef },
    { label: "Designation", type: "text", name: "designation", error: employeeData.designation },
    { label: "Date of Joining", type: "date", name: "dateOfJoining", error: errors.dateOfJoining, ref: dojRef },
    { label: "Status", type: "select", name: "status", options: ["ACTIVE", "INACTIVE"] },
    { label: "Department", type: "select", name: "department", options: ["React Js", "Java", "DevOps", "HR"] },
    { label: "Employment Type", type: "select", name: "employeeType", options: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"] },
    { label: "Role", type: "text", name: "role", readOnly: true, value: [role || employeeData.role] },
    { label: "Basic Salary", type: "number", name: "basicSalary", error: errors.basicSalary },
    { label: "Address", type: "text", name: "address", error: errors.address },
    { label: "Password", type: "password", name: "password", error: errors.password },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-sm bg-black/50">
      <div className="relative bg-white w-full max-w-3xl p-4 md:p-6 rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          Add New {role === "HR" ? "HR" : "Employee"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map((field, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    name={field.name}
                    value={employeeData[field.name]}
                    onChange={handleInputChange}
                    required
                    className={`mt-1 p-2 block w-full border ${
                      errors[field.name] ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.isPhoneInput ? (
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={employeeData.phoneNumber}
                    onChange={handlePhoneChange}
                    className={`mt-1 p-2 block w-full border ${
                      errors.phoneNumber ? "border-red-500" : "border-gray-300"
                    } rounded-md`}
                  />
                ) : (
                  <div className="relative">
                    <input
                      ref={field.ref}
                      type={field.type}
                      name={field.name}
                      value={field.value ? field.value : employeeData[field.name]}
                      onChange={handleInputChange}
                      readOnly={field.readOnly || false}
                      required
                      className={`mt-1 p-2 block w-full border ${
                        errors[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      } ${
                        field.readOnly ? "bg-gray-100 cursor-not-allowed" : ""
                      } rounded-md`}
                    />
                    {(field.name === "dateOfBirth" ||
                      field.name === "dateOfJoining") && (
                      <i
                        className="fas fa-calendar-alt absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        onClick={() => {
                          if (field.ref && field.ref.current) {
                            field.ref.current.showPicker();
                          }
                        }}
                      ></i>
                    )}
                  </div>
                )}
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors[field.name]}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Add {role === "HR" ? "HR" : "Employee"}
            </button>
          </div>
        </form>
        {showSuccessMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md">
              {role === "HR" ? "HR" : "Employee"} added successfully!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeForm;