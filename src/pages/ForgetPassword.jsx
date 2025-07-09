import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1); // 1: Email step, 2: Reset password step
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const userManagementLink = import.meta.env.VITE_USER_MANAGEMENT;

    // Handle sending OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        try {
            console.log('Sending OTP for email:', email); // Debugging log
            // Send email as a query parameter
            const response = await axios.post(`${userManagementLink}/api/password/forgot?email=${email}`);

            if (response.status >= 200 && response.status < 300) {
                setSuccess(response.data || 'OTP has been sent to your email');
                setStep(2);
            } else {
                setError(response.data || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError(
                error.response?.data?.message || 
                error.message || 
                'An error occurred while sending OTP'
            );
        }
    };

    // Handle resending OTP
    const handleResendOtp = async () => {
        setError('');
        setSuccess('');

        try {
            // Resend email as a query parameter
            const response = await axios.post(`${userManagementLink}/api/password/forgot?email=${email}`);
            
            if (response.status >= 200 && response.status < 300) {
                setSuccess(response.data || 'New OTP has been sent to your email');
            } else {
                setError(response.data || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            setError(
                error.response?.data?.message || 
                error.message || 
                'An error occurred while resending OTP'
            );
        }
    };

    // Handle resetting password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newPassword || !confirmPassword || !otp) {
            setError('Please fill all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post(`${userManagementLink}/api/password/reset`, {
                email,
                newPassword,
                confirmPassword,
                otp
            });

            if (response.status >= 200 && response.status < 300) {
                setSuccess('Password reset successfully. You can now login with your new password.');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            setError(
                error.response?.data?.message || 
                error.message || 
                'An error occurred while resetting password'
            );
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-r from-teal-600 from-20% to-gray-300 to-80%">
            <div className="w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h2 className="text-teal-800 text-2xl font-bold mb-6 text-center">
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>

                {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
                {success && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{success}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition duration-300"
                            >
                                Send OTP
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-teal-600 hover:underline"
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border rounded bg-gray-100"
                                value={email}
                                readOnly
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="otp" className="block text-gray-700">OTP</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="text-teal-600 text-sm mt-1 hover:underline"
                            >
                                Resend OTP
                            </button>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-gray-700">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition duration-300"
                            >
                                Reset Password
                            </button>
                        </div>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-teal-600 hover:underline"
                            >
                                Back to Email
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;