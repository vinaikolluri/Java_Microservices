import React, { useState } from "react";
import Modal from "./Modal";
import AddDepartment from "./AddDepartment";
import EditDepartment from "./EditDepartment";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: "JAVA", description: "Java" },
    { id: 2, name: "React JS", description: "Frontend React" },
    { id: 3, name: "Devops", description: "Devops" },
    { id: 4, name: "HR", description: "Human Resource Management" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const handleDelete = (id) => {
    setDepartments(departments.filter((dept) => dept.id !== id));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveNewDepartment = (newDepartment) => {
    setDepartments([...departments, newDepartment]);
    setIsAddModalOpen(false);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleSaveEditDepartment = (updatedDepartment) => {
    setDepartments(
      departments.map((dept) =>
        dept.id === updatedDepartment.id ? updatedDepartment : dept
      )
    );
    setIsEditModalOpen(false);
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-6">Manage Departments</h1>

      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search By Department"
          value={searchQuery}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-1/3"
        />
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Add New Department
        </button>
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <AddDepartment
          onSave={handleSaveNewDepartment}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        {editingDepartment && (
          <EditDepartment
            department={editingDepartment}
            onSave={handleSaveEditDepartment}
            onClose={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* Department List */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">S No</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept, index) => (
                <tr key={dept.id} className="even:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">{dept.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{dept.description}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
        <span>Rows per page: 10</span>
        <span>
          1-{filteredDepartments.length} of {filteredDepartments.length}
        </span>
      </div>
    </div>
  );
};

export default DepartmentList;
