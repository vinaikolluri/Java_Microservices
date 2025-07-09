import React, { useState, useEffect } from "react";
import {  
  getAllFiles,  
  uploadAadhar,  
  updateAadhar,  
  deleteAadhar,  
  uploadPan,  
  updatePan,  
  deletePan,  
  uploadSSC,  
  updateSSC,  
  deleteSSC,  
  uploadIntermediate,  
  updateIntermediate,  
  deleteIntermediate,  
  uploadGraduation,  
  updateGraduation,  
  deleteGraduation,  
  uploadExperience,  
  updateExperienceFile,  
  deleteExperienceFile
} from "../../service/documentService";
import { Pencil, Plus, Trash2 } from "lucide-react";

const DocumentManagement = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [sscFile, setSscFile] = useState(null);
  const [intermediateFile, setIntermediateFile] = useState(null);
  const [graduationFile, setGraduationFile] = useState(null);
  const [experienceFiles, setExperienceFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  
  // Get experience documents
  const [experienceDocuments, setExperienceDocuments] = useState([]);

  const user = JSON.parse(sessionStorage.getItem("user"));
  const employeeId = user?.employeeId;

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const files = await getAllFiles();
        const filteredFiles = files.filter((file) => file.employeeId === employeeId);
        setDocuments([...filteredFiles]);
        
        // Filter out experience documents
        const expDocs = filteredFiles.filter(
          (file) => file.documentType.toLowerCase() === "experience"
        );
        setExperienceDocuments(expDocs);
        
        console.log("Updated Documents State:", filteredFiles);
        console.log("Experience Documents:", expDocs);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, [employeeId]);

  const getFileName = (type) => {
    const doc = documents.find((doc) => doc.documentType.toLowerCase() === type.toLowerCase());
    return doc ? doc.fileName : "No file uploaded";
  };

  // Check if document exists
  const documentExists = (type) => {
    return documents.some((doc) => doc.documentType.toLowerCase() === type.toLowerCase());
  };

  const handleFileChange = (e, type, fileId = null) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === "aadhar") {
        setAadharFile(files[0]); 
      } else if (type === "pan") {
        setPanFile(files[0]); 
      } else if (type === "ssc") {
        setSscFile(files[0]);
      } else if (type === "intermediate") {
        setIntermediateFile(files[0]); 
      } else if (type === "graduation") {
        setGraduationFile(files[0]); 
      } else if (type === "experience") {
        // Just set the single file for updates
        setExperienceFiles([files[0]]);
      } 
      setSelectedFile(files[0]);
      setSelectedFileName(files[0].name);
      setSelectedDocType(type);
      if (fileId) {
        setSelectedFileId(fileId);
      }
    }
  };

  // Handle file upload
  const handleUpload = async (type) => {
    try {
      let response;
      if (type === "aadhar" && aadharFile) {
        response = await uploadAadhar(employeeId, aadharFile);
        setSuccessMessage("Aadhar uploaded successfully!");
      } else if (type === "pan" && panFile) {
        response = await uploadPan(employeeId, panFile);
        setSuccessMessage("PAN uploaded successfully!");
      } else if (type === "ssc" && sscFile) {
        response = await uploadSSC(employeeId, sscFile);
        setSuccessMessage("SSC document uploaded successfully!");
      } else if (type === "intermediate" && intermediateFile) {
        response = await uploadIntermediate(employeeId, intermediateFile);
        setSuccessMessage("Intermediate document uploaded successfully!");
      } else if (type === "graduation" && graduationFile) {
        response = await uploadGraduation(employeeId, graduationFile);
        setSuccessMessage("Graduation document uploaded successfully!");
      } else if (type === "experience" && experienceFiles.length > 0) {
        // Upload a single experience file
        response = await uploadExperience(employeeId, experienceFiles[0]);
        setSuccessMessage("Experience document uploaded successfully!");
      } else {
        throw new Error(`No file selected for ${type}.`);
      }
  
      console.log("Upload response:", response);
      // Refresh the documents
      await refreshDocuments();
  
      // Reset file states after upload
      resetFileStates();
    } catch (error) {
      setError(error.message);
      console.error("Failed to upload files:", error);
    }
  };

  // Handle file update
  const handleUpdate = async (type) => {
    try {
      if (type === "aadhar" && selectedFile) {
        await updateAadhar(employeeId, selectedFile);
        setSuccessMessage("Aadhar updated successfully!");
      } else if (type === "pan" && selectedFile) {
        await updatePan(employeeId, selectedFile);
        setSuccessMessage("PAN updated successfully!");
      } else if (type === "ssc" && selectedFile) {
        await updateSSC(employeeId, selectedFile);
        setSuccessMessage("SSC document updated successfully!");
      } else if (type === "intermediate" && selectedFile) {
        await updateIntermediate(employeeId, selectedFile);
        setSuccessMessage("Intermediate document updated successfully!");
      } else if (type === "graduation" && selectedFile) {
        await updateGraduation(employeeId, selectedFile);
        setSuccessMessage("Graduation document updated successfully!");
      } else if (type === "experience" && selectedFile && selectedFileId) {
        await updateExperienceFile(employeeId, selectedFileId, selectedFile);
        setSuccessMessage("Experience document updated successfully!");
      } else {
        console.error("No file selected for update or invalid document type.");
        return;
      }
      
      // Refresh documents
      await refreshDocuments();
      
      // Reset states
      resetFileStates();
    } catch (error) {
      setError(error.message);
      console.error("Failed to update file:", error);
    }
  };

  // Handle file deletion
  const handleDelete = async (type, fileId = null) => {
    try {
      if (type === "aadhar") {
        await deleteAadhar(employeeId);
        setSuccessMessage("Aadhar deleted successfully!");
      } else if (type === "pan") {
        await deletePan(employeeId);
        setSuccessMessage("PAN deleted successfully!");
      } else if (type === "ssc") {
        await deleteSSC(employeeId);
        setSuccessMessage("SSC document deleted successfully!");
      } else if (type === "intermediate") {
        await deleteIntermediate(employeeId);
        setSuccessMessage("Intermediate document deleted successfully!");
      } else if (type === "graduation") {
        await deleteGraduation(employeeId);
        setSuccessMessage("Graduation document deleted successfully!");
      } else if (type === "experience" && fileId) {
        await deleteExperienceFile(employeeId, fileId);
        setSuccessMessage("Experience document deleted successfully!");
      } else {
        throw new Error("Invalid document type or missing file ID for experience document");
      }
      
      // Refresh documents
      await refreshDocuments();
    } catch (error) {
      setError(error.message);
      console.error("Failed to delete file:", error);
    }
  };

  // Refresh documents helper function
  const refreshDocuments = async () => {
    try {
      const updatedDocs = await getAllFiles();
      const filtered = updatedDocs.filter((file) => file.employeeId === employeeId);
      setDocuments(filtered);
      
      // Update experience documents
      const expDocs = filtered.filter(
        (file) => file.documentType.toLowerCase() === "experience"
      );
      setExperienceDocuments(expDocs);
    } catch (error) {
      console.error("Failed to refresh documents:", error);
      setError("Failed to refresh documents");
    }
  };

  // Reset file states helper
  const resetFileStates = () => {
    setAadharFile(null);
    setPanFile(null);
    setSscFile(null);
    setIntermediateFile(null);
    setGraduationFile(null);
    setExperienceFiles([]);
    setSelectedFile(null);
    setSelectedDocType("");
    setSelectedFileName("");
    setSelectedFileId(null);
  };

  // Function to add a new experience row
  const addExperienceRow = () => {
    setSelectedDocType("experience");
    setSelectedFile(null);
    setSelectedFileName("");
    setSelectedFileId(null);
  };

  // Render appropriate action buttons based on document existence
  const renderActionButtons = (type, fileId = null) => {
    const exists = documentExists(type);
    
    if (type === "experience" && fileId) {
      // For existing experience documents
      return (
        <>
          <button
            onClick={() => handleUpdate("experience")}
            className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-200"
            disabled={!selectedFileName || selectedFileId !== fileId}
          >
            Update
          </button>
          <button
            onClick={() => handleDelete("experience", fileId)}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-200 ml-2"
          >
            Delete
          </button>
        </>
      );
    } else if (type === "experience" && !fileId) {
      // For new experience document
      return (
        <button
          onClick={() => handleUpload("experience")}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition duration-200"
          disabled={!selectedFileName || selectedDocType !== "experience" || selectedFileId}
        >
          Upload
        </button>
      );
    } else {
      // For other document types
      return exists ? (
        <>
          <button
            onClick={() => handleUpdate(type)}
            className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition duration-200"
          >
            Update
          </button>
          <button
            onClick={() => handleDelete(type)}
            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-200 ml-2"
          >
            Delete
          </button>
        </>
      ) : (
        <button
          onClick={() => handleUpload(type)}
          className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Upload
        </button>
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Document Management</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Document Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Document Type</th>
            <th className="p-2 border">File</th>
            <th className="p-2 border">File Name</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Aadhar Row */}
          <tr className="bg-white">
            <td className="p-2 border text-center">Aadhar</td>
            <td className="p-2 border text-center">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  id="aadhar-file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "aadhar")}
                />
                <label
                  htmlFor="aadhar-file"
                  className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  Choose File
                </label>
                {selectedFileName && selectedDocType === "aadhar" && (
                  <span className="ml-2">{selectedFileName}</span>
                )}
                <button
                  onClick={() => document.getElementById("aadhar-file").click()}
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </td>
            <td className="p-2 border text-center">{getFileName("aadhar")}</td>
            <td className="p-2 border text-center">
              {renderActionButtons("aadhar")}
            </td>
          </tr>

          {/* PAN Row */}
          <tr className="bg-white">
            <td className="p-2 border text-center">PAN</td>
            <td className="p-2 border text-center">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  id="pan-file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "pan")}
                />
                <label
                  htmlFor="pan-file"
                  className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  Choose File
                </label>
                {selectedFileName && selectedDocType === "pan" && (
                  <span className="ml-2">{selectedFileName}</span>
                )}
                <button
                  onClick={() => document.getElementById("pan-file").click()}
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </td>
            <td className="p-2 border text-center">{getFileName("pan")}</td>
            <td className="p-2 border text-center">
              {renderActionButtons("pan")}
            </td>
          </tr>

          {/* SSC Row */}
          <tr className="bg-white">
            <td className="p-2 border text-center">SSC</td>
            <td className="p-2 border text-center">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  id="ssc-file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "ssc")}
                />
                <label
                  htmlFor="ssc-file"
                  className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  Choose File
                </label>
                {selectedFileName && selectedDocType === "ssc" && (
                  <span className="ml-2">{selectedFileName}</span>
                )}
                <button
                  onClick={() => document.getElementById("ssc-file").click()}
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </td>
            <td className="p-2 border text-center">{getFileName("ssc")}</td>
            <td className="p-2 border text-center">
              {renderActionButtons("ssc")}
            </td>
          </tr>

          {/* Intermediate Row */}
          <tr className="bg-white">
            <td className="p-2 border text-center">Intermediate</td>
            <td className="p-2 border text-center">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  id="intermediate-file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "intermediate")}
                />
                <label
                  htmlFor="intermediate-file"
                  className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  Choose File
                </label>
                {selectedFileName && selectedDocType === "intermediate" && (
                  <span className="ml-2">{selectedFileName}</span>
                )}
                <button
                  onClick={() => document.getElementById("intermediate-file").click()}
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </td>
            <td className="p-2 border text-center">{getFileName("intermediate")}</td>
            <td className="p-2 border text-center">
              {renderActionButtons("intermediate")}
            </td>
          </tr>

          {/* Graduation Row */}
          <tr className="bg-white">
            <td className="p-2 border text-center">Graduation</td>
            <td className="p-2 border text-center">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  id="graduation-file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "graduation")}
                />
                <label
                  htmlFor="graduation-file"
                  className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  Choose File
                </label>
                {selectedFileName && selectedDocType === "graduation" && (
                  <span className="ml-2">{selectedFileName}</span>
                )}
                <button
                  onClick={() => document.getElementById("graduation-file").click()}
                  className="ml-2 text-blue-500 hover:text-blue-600"
                >
                  <Pencil size={16} />
                </button>
              </div>
            </td>
            <td className="p-2 border text-center">{getFileName("graduation")}</td>
            <td className="p-2 border text-center">
              {renderActionButtons("graduation")}
            </td>
          </tr>

          {/* Experience Rows */}
          {experienceDocuments.map((doc) => (
            <tr key={doc.id} className="bg-white">
              <td className="p-2 border text-center">Experience</td>
              <td className="p-2 border text-center">
                <div className="flex items-center justify-center">
                  <input
                    type="file"
                    id={`experience-file-${doc.id}`}
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "experience", doc.id)}
                  />
                  <label
                    htmlFor={`experience-file-${doc.id}`}
                    className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                  >
                    Choose File
                  </label>
                  {selectedFileName && selectedDocType === "experience" && selectedFileId === doc.id && (
                    <span className="ml-2">{selectedFileName}</span>
                  )}
                  <button
                    onClick={() => {
                      document.getElementById(`experience-file-${doc.id}`).click();
                    }}
                    className="ml-2 text-blue-500 hover:text-blue-600"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </td>
              <td className="p-2 border text-center">{doc.fileName}</td>
              <td className="p-2 border text-center">
                {renderActionButtons("experience", doc.id)}
              </td>
            </tr>
          ))}

          {/* Add New Experience Row */}
          <tr className="bg-white">
            <td className="p-2 border text-center">New Experience</td>
            <td className="p-2 border text-center">
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  id="new-experience-file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "experience")}
                />
                <label
                  htmlFor="new-experience-file"
                  className="cursor-pointer bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300"
                >
                  Choose File
                </label>
                {selectedFileName && selectedDocType === "experience" && !selectedFileId && (
                  <span className="ml-2">{selectedFileName}</span>
                )}
              </div>
            </td>
            <td className="p-2 border text-center">No file uploaded</td>
            <td className="p-2 border text-center">
              {renderActionButtons("experience")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DocumentManagement;