import { AuthService } from "./authService";

const userManagementLink = import.meta.env.VITE_USER_MANAGEMENT;

export const EmployeeService = {

  fetchEmployeesFromDatabase: async () => {
         try {
           const token = AuthService.getToken();
           if (!token) {
             console.error('No authorization token found');
             return;
           }
    
          const { user } = AuthService.getUserData();
          const isAdmin = user?.role === 'ADMIN';
          
           const endpoint = isAdmin 
             ? `${userManagementLink}/api/admin/getAllEmployees`
             : `${userManagementLink}/api/hr/getAllEmployees`;
    
           const response = await fetch(endpoint, {
             method: 'GET',
             headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json',
             },
           });
          
           if (!response.ok) {
             throw new Error(`Failed to fetch employees, Response Status: ${response.status}`);
           }
    
          const employeesFromDb = await response.json();
         const existingEmployees = EmployeeService.getEmployees();
  
           const employeesToSave = [
             ...existingEmployees,
             ...employeesFromDb.filter(emp => !existingEmployees.some(existingEmp => existingEmp.employeeId === emp.employeeId)),
         ];
    
         sessionStorage.setItem('employees', JSON.stringify(employeesToSave));
    
           const lastEmployeeId = Math.max(...employeesFromDb.map(emp => emp.employeeId), 1000);
    
           return employeesToSave;
         } catch (error) {
           console.error('Error fetching employees:', error);
           throw error;
        }
  },

  // Fetch all employees from localStorage
  getEmployees: () => {
    const employees = sessionStorage.getItem("employees");
    return employees ? JSON.parse(employees) : [];
  },

  // Add a new employee to the list and save to localStorage
  addEmployee: (employee) => {
    const employees = EmployeeService.getEmployees();

    // Check for duplicate employee based on employeeId
    const isDuplicate = employees.some(
      (emp) => emp.employeeId === employee.employeeId
    );
    if (isDuplicate) {
      console.log("Employee with this ID already exists.");
      return;
    }

    // Generate a new unique `id` for the employee
    const lastId = employees.length
      ? Math.max(...employees.map((emp) => emp.id || 1))
      : 1;
    const newId = lastId + 1;

    // Add the new employee
    const updatedEmployees = [...employees, { ...employee, id: newId }];

    // Save the updated list of employees to localStorage
    sessionStorage.setItem("employees", JSON.stringify(updatedEmployees));
    // console.log("Employee added:", { ...employee, id: newId });
  },

  
  addMissingIds: () => {
    const employees = EmployeeService.getEmployees();
    const updatedEmployees = employees.map((emp, index) => ({
      ...emp,
      id: emp.id || index + 1, // Add an `id` if missing
    }));

    
    sessionStorage.setItem("employees", JSON.stringify(updatedEmployees));
    
  },

  // Delete an employee by employeeId and update localStorage
  deleteEmployee: (employeeId) => {
    const employees = EmployeeService.getEmployees();
    const updatedEmployees = employees.filter(
      (emp) => emp.employeeId !== employeeId
    );

    // Update localStorage with the new list
    sessionStorage.setItem("employees", JSON.stringify(updatedEmployees));
  },

  // Update an existing employee by employeeId and save changes to localStorage
  updateEmployee: (employeeId, updatedEmployee) => {
    const employees = EmployeeService.getEmployees();
    const updatedEmployees = employees.map((emp) =>
      emp.employeeId === employeeId ? { ...emp, ...updatedEmployee } : emp
    );

    // Update localStorage
    sessionStorage.setItem("employees", JSON.stringify(updatedEmployees));
    // console.log(`Employee with ID ${employeeId} updated.`);
  },

  // Fetch a single employee by employeeId from localStorage
  getEmployeeById: (employeeId) => {
    const employees = EmployeeService.getEmployees();
    return employees.find((emp) => emp.employeeId === employeeId) || null;
  },

  // Fetch the total number of employees
  getTotalEmployees: () => {
    const employees = EmployeeService.getEmployees();
    return employees.length;
  },

  // Get the last employee ID from the list
  getLastEmployeeId: () => {
    const employees = EmployeeService.getEmployees();
    if (employees.length === 0) return 1001;

    // Find the maximum employeeId
    const lastId = Math.max(...employees.map((emp) => emp.employeeId));
    return lastId;
  },
};
