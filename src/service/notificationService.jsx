import axios from "axios";

const NotificationLink = import.meta.env.VITE_NOTIFICATION_MANAGEMENT

const API_BASE_URL = `${NotificationLink}/api/notifications`;
const TWILIO_API_BASE_URL = `${NotificationLink}/api/twilio`;

const NotificationService = {
  sendEmailOtp: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send-otp-email`, null, {
        params: { email },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending email OTP:", error.response?.data || error.message);
      throw error;
    }
  },

  verifyEmailOtp: async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, null, {
        params: { email, otp },
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying email OTP:", error.response?.data || error.message);
      throw error;
    }
  },

  sendCredentials: async (email, credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/send-credentials`, credentials, {
        params: { email },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending credentials:", error.response?.data || error.message);
      throw error;
    }
  },

  sendPhoneOtp: async (phoneNumber) => {
    try {
      const response = await axios.post(`${TWILIO_API_BASE_URL}/send-otp`, null, {
        params: { phoneNumber },
      });
      return response.data;
    } catch (error) {
      console.error("Error sending phone OTP:", error.response?.data || error.message);
      throw error;
    }
  },

  verifyPhoneOtp: async (phoneNumber, otp) => {
    try {
      const response = await axios.post(`${TWILIO_API_BASE_URL}/verify-otp`, null, {
        params: { phoneNumber, otp },
      });
      return response.data;
    } catch (error) {
      console.error("Error verifying phone OTP:", error.response?.data || error.message);
      throw error;
    }
  },

  sendLeaveApprovalNotification: async (leaveResponse) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave/approval`, leaveResponse)
      return response.data;
    } catch (error) {
      console.error("Error sending leave response:", error.response?.data || error.message);
      throw error;
    }
  },

  sendLeaveRejectionNotification: async (leaveResponse) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/leave/rejection`, leaveResponse)
      return response.data;
    } catch (error) {
      console.error("Error sending leave response:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default NotificationService;
