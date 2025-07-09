import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const token = sessionStorage.getItem("token");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const employeeId = user?.employeeId;
  const userEmail = user?.email;

  const employeeManagementLink = import.meta.env.VITE_EMPLOYEE_MANAGEMENT;

  const sendOtp = async () => {
    if (!currentPassword) {
      setError('Please enter your current password first');
      return;
    }

    if (!userEmail) {
      setError('Email not found. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${employeeManagementLink}/api/employees/${employeeId}/request-otp`,
        null,
        {
          params: { email: userEmail },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200) {
        setIsOtpSent(true);
        setSuccessMessage(`OTP sent to ${userEmail}`);
      } else {
        setError(response.data || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOtpSent) {
      setError('Please request OTP first');
      return;
    }

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!employeeId) {
      setError('Employee ID is missing. Please log in again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.put(
        `${employeeManagementLink}/api/employees/${employeeId}/change-password`,
        {
          currentPassword,
          newPassword,
          confirmPassword,
          otp
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp('');
      setIsOtpSent(false);
      setError('');
    } catch (err) {
      console.error("Error response:", err.response);
      setError(err.response?.data || "Failed to change password. Please check your current password and OTP then try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 rounded-2xl shadow-lg w-full max-w-md transition transform hover:scale-105">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          <i className="fa fa-lock" aria-hidden="true"></i> Change Password
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isOtpSent ? (
            <>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="currentPassword"
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <i className="fa fa-eye" aria-hidden="true"></i>
                    ) : (
                      <i className="fa fa-eye-slash" aria-hidden="true"></i>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={sendOtp}
                disabled={isLoading || !currentPassword}
                className="w-full py-3 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending OTP...' : `Send OTP to ${userEmail}`}
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Enter OTP sent to {userEmail}
                </label>
                <input
                  type="text"
                  id="otp"
                  className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <i className="fa fa-eye" aria-hidden="true"></i>
                    ) : (
                      <i className="fa fa-eye-slash" aria-hidden="true"></i>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <i className="fa fa-eye" aria-hidden="true"></i>
                    ) : (
                      <i className="fa fa-eye-slash" aria-hidden="true"></i>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="font-semibold">Password Requirements:</p>
                <ul className="list-disc list-inside">
                  <li>At least 8 characters long</li>
                  <li>Contains at least one uppercase letter</li>
                  <li>Contains at least one lowercase letter</li>
                  <li>Contains at least one number</li>
                  <li>Contains at least one special character (e.g., !@#$%^&*)</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp('');
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Back
              </button>
            </>
          )}

          {error && <div className="text-sm text-red-600">{error}</div>}
          {successMessage && <div className="text-sm text-green-600">{successMessage}</div>}
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;