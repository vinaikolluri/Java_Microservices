import React, { useState } from 'react';

const EditDepartment = ({ department, onSave, onClose }) => {
  const [deptName, setDeptName] = useState(department.name);
  const [deptDescription, setDeptDescription] = useState(department.description);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deptName || !deptDescription) {
      alert('Please fill in all fields');
      return;
    }
    onSave({ ...department, name: deptName, description: deptDescription });
    onClose(); // Close the modal after saving
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Edit Department</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="dept_name" className="block text-sm font-medium text-gray-700">
            Department Name
          </label>
          <input
            type="text"
            id="dept_name"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
            placeholder="Enter Department Name"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Department Description
          </label>
          <textarea
            id="description"
            value={deptDescription}
            onChange={(e) => setDeptDescription(e.target.value)}
            placeholder="Enter Department Description"
            className="mt-1 p-2 border border-gray-300 rounded-md w-full"
            rows="4"
          ></textarea>
        </div>
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDepartment;
