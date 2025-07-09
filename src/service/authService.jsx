// authService.jsx

export const AuthService = {

    getUser: () => {
      const user = sessionStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        // console.log("Retrieved user:", parsedUser);  // For debugging
        return parsedUser;
      }
      return null;
    },
  
    // Fetch token from local storage
    getToken: () => {
      return sessionStorage.getItem("token");
    },
  
    // Check if user is authenticated
    isAuthenticated: () => {
      return !!sessionStorage.getItem("token");
    },
  
    // Save user and token to local storage
    setUser: (userData) => {
      const {email, token, employeeId, ...user } = userData;
      sessionStorage.setItem("user", JSON.stringify({ ...user, employeeId, email }));
      sessionStorage.setItem("token", token);
      console.log("User set:", { ...user, employeeId, email });
    },
  
    // Remove user and token from local storage
    logout: () => {
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("employees");
      console.log("User logged out.");
    },
  
    // Load user and token from local storage
    loadUserFromLocalStorage: () => {
      const user = sessionStorage.getItem("user");
      const token = sessionStorage.getItem("token");
      if (user && token) {
        console.log("Loaded user from localStorage:", JSON.parse(user));
        return { user: JSON.parse(user), token };
      }
      return null;
    },
  
    // Save user data to local storage
    saveUserToLocalStorage: (employee) => {
      sessionStorage.setItem("employee", JSON.stringify(employee));
    },

     // New method to get user data and authentication status
  getUserData: () => {
    const user = AuthService.getUser();  // Use existing getUser method
    const isAuthenticated = !!user;  // Check if user exists
    return { user, isAuthenticated };
  },
  };
  