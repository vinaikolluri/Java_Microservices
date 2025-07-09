import { React, useEffect, useState } from 'react';
import { EmployeeService } from '../../service/employeeService';
import { LeaveService } from '../../service/leaveService';
import { AuthService } from '../../service/authService';
import { FaUsers, FaBuilding, FaFileAlt, FaCheckCircle, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';

const AdminSummary = () => {
    const [totalEmployees, setTotalEmployees] = useState(EmployeeService.getTotalEmployees()); // Load cached count immediately
    const [leaveCounts, setLeaveCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    
    const user = AuthService.getUserData()
    const role = user?.role

    useEffect(() => {
        const fetchData = async () => {
            try {
                await EmployeeService.fetchEmployeesFromDatabase();
                setTotalEmployees(EmployeeService.getTotalEmployees()); // Update after fetching
                if (role !=="EMPLOYEE" ){
                const counts = await LeaveService.hr.getLeaveCounts();
                setLeaveCounts({ ...counts });
                } else {
                const counts = await LeaveService.employee.getLeaveCounts();
                setLeaveCounts({ ...counts });   
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className='p-6 bg-gray-100 min-h-screen'>
            <h3 className='text-2xl font-bold text-gray-800'>Dashboard</h3>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-6'>
                {/* Total Employees Card */}
                <div className='bg-gray-200 p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gray-300'>
                    <p className='text-lg font-semibold text-gray-700'>Total Employees</p>
                    <div className='flex justify-between items-center mt-4'>
                        <FaUsers className='text-6xl text-gray-700' />
                        <p className='text-4xl font-bold text-gray-800'>{totalEmployees}</p>
                    </div>
                </div>

                {/* Total Departments Card */}
                <div className='bg-gray-200 p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gray-300'>
                    <p className='text-lg font-semibold text-gray-700'>Total Departments</p>
                    <div className='flex justify-between items-center mt-4'>
                        <FaBuilding className='text-6xl text-blue-500' />
                        <p className='text-4xl font-bold text-gray-800'>4</p>
                    </div>
                </div>
            </div>

            <h3 className='text-2xl font-bold text-gray-800 mt-3'>Leave Requests</h3>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-6'>
                {/* Total Leaves Applied Card */}
                <div className='bg-gray-200 p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gray-300'>
                    <p className='text-lg font-semibold text-gray-700'>Total Leaves Applied</p>
                    <div className='flex justify-between items-center mt-4'>
                        <FaFileAlt className='text-6xl text-purple-500' />
                        <p className='text-4xl font-bold text-gray-800'>{leaveCounts.total}</p>
                    </div>
                </div>

                {/* Leaves Approved Card */}
                <div className='bg-gray-200 p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gray-300'>
                    <p className='text-lg font-semibold text-gray-700'>Leaves Approved</p>
                    <div className='flex justify-between items-center mt-4'>
                        <FaCheckCircle className='text-6xl text-green-500' />
                        <p className='text-4xl font-bold text-gray-800'>{leaveCounts.approved}</p>
                    </div>
                </div>

                {/* Leaves Pending Card */}
                <div className='bg-gray-200 p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gray-300'>
                    <p className='text-lg font-semibold text-gray-700'>Leaves Pending</p>
                    <div className='flex justify-between items-center mt-4'>
                        <FaHourglassHalf className='text-6xl text-yellow-500' />
                        <p className='text-4xl font-bold text-gray-800'>{leaveCounts.pending}</p>
                    </div>
                </div>

                {/* Leaves Rejected Card */}
                <div className='bg-gray-200 p-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105 hover:shadow-xl hover:bg-gray-300'>
                    <p className='text-lg font-semibold text-gray-700'>Leaves Rejected</p>
                    <div className='flex justify-between items-center mt-4'>
                        <FaTimesCircle className='text-6xl text-red-500' />
                        <p className='text-4xl font-bold text-gray-800'>{leaveCounts.rejected}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSummary;
