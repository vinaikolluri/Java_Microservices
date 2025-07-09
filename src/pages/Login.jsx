import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../service/authService';
import { postRequest } from './api';
import {FaEyeSlash, FaEye} from 'react-icons/fa';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        try {
            const response = await postRequest('/auth/login', { email, password });
            console.log(response);

            if (response && response.accessToken) {
                const { accessToken, role, employeeId, email } = response;

                
                AuthService.setUser({ token: accessToken, role, employeeId, email });

                if (rememberMe) {
                    sessionStorage.setItem('rememberedEmail', email);
                    sessionStorage.setItem('rememberPassword', password)
                } else {
                    sessionStorage.removeItem('rememberedEmail');
                    sessionStorage.removeItem('rememberPassword')
                }

                if (role === 'HR') {
                    navigate('/hr/dashboard');
                } else if (role === 'EMPLOYEE') {
                    navigate('/employee/dashboard');
                } else if (role === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else if (role === 'TEMPORARY_Admin') {
                    navigate('/temporary/admin/dashboard');
                } else {
                    setError('Unknown role. Please contact support.');
                }
            } else {
                setError(response?.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error("Login request error:", error);
            setError('Invalid login credentials.');
        }
    };

    React.useEffect(() => {
        const rememberedEmail = sessionStorage.getItem('rememberedEmail');
        const rememberPassword = sessionStorage.getItem('rememberPassword');

        if (rememberedEmail && rememberPassword) {
            setEmail(rememberedEmail);
            setPassword(rememberPassword);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-r from-teal-600 from-20% to-gray-300 to-80%">
            <div className="w-full mx-4 sm:mx-6 md:mx-8 lg:mx-10 xl:mx-auto max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">                <h2 className="text-teal-800 text-2xl font-bold mb-6 text-center">Login to your Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded"
                            placeholder="Enter Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="*******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
                    <div className="mb-4 flex items-center justify-between">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="ml-2 text-gray-700">Remember Me</span>
                        </label>
                        <a href="/forgot-password" className="text-teal-600">Forgot Password?</a>
                    </div>
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full bg-teal-700 text-white py-2 rounded hover:bg-teal-800 transition duration-300"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;