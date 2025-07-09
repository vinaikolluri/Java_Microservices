import axios from "axios";
import { AuthService } from "./authService";

const leaveManagementLink = import.meta.env.VITE_ATTENDANCE_LEAVE_MANAGEMENT;
const token = sessionStorage.getItem("token");

export const LeaveService = {
  employee: {
    async getLeaves() {
      const { user } = AuthService.getUserData();
      const employeeId = user.employeeId;
      const response = await axios.get(`${leaveManagementLink}/api/employee/leaves/${employeeId}`);
      return response.data;
    },

    async getLeaveBalance(year = new Date().getFullYear()) {
      const { user } = AuthService.getUserData();
      const employeeId = user.employeeId;
      const response = await axios.get(`${leaveManagementLink}/api/employee/leave-balances/${employeeId}?year=${year}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },

    async getBalances() {
      const { user } = AuthService.getUserData();
      const employeeId = user.employeeId;
      const response = await axios.get(`${leaveManagementLink}/api/employee/balance/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    },

    async applyLeave(leaveData) {
      const response = await axios.post(`${leaveManagementLink}/api/employee/leave/apply`, leaveData);
      return response.data;
    },

    async getLeaveCounts() {
      const leaves = await LeaveService.employee.getLeaves();
      return {
        total: leaves.length,
        pending: leaves.filter(leave => leave.status === "Pending").length,
        approved: leaves.filter(leave => leave.status === "Approved").length,
        rejected: leaves.filter(leave => leave.status === "Rejected").length,
      };
    },
  },

  // HR-specific methods
  hr: {
    async getAllLeaves() {
      const response = await axios.get(`${leaveManagementLink}/api/hr/leaves`);
      return response.data;
    },

    async processLeaveRequest(leaveId, { status, remarks }) {
      const response = await axios.put(`${leaveManagementLink}/api/hr/leave/${leaveId}?status=${status}&remarks=${encodeURIComponent(remarks)}`);
      return response.data;
    },

    async getLeaveBalances(year = new Date().getFullYear()) {
      const response = await axios.get(`${leaveManagementLink}/api/hr/leave-balances?year=${year}`);
      return response.data;
    },

    async getLeaveCounts() {
      const leaves = await LeaveService.hr.getAllLeaves();
      return {
        total: leaves.length,
        pending: leaves.filter(leave => leave.status === "PENDING").length,
        approved: leaves.filter(leave => leave.status === "APPROVED").length,
        rejected: leaves.filter(leave => leave.status === "REJECTED").length,
      };
    },
  },
};
