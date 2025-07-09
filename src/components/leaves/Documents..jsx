import React, { useState, useEffect } from "react";
import {
  getAllFiles,
  downloadAadhar,
  downloadPan,
  downloadExperienceFile,
  downloadSSC,
  downloadIntermediate,
  downloadGraduation,
} from "../../service/documentService";

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const files = await getAllFiles();
        setDocuments([...files]);
        console.log("Updated Documents State:", files);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  const handleDownload = async (employeeId, type, fileId) => {
    try {
      let response;
      switch (type.toLowerCase()) {
        case "aadhar":
          response = await downloadAadhar(employeeId);
          break;
        case "pan":
          response = await downloadPan(employeeId);
          break;
        case "ssc":
          response = await downloadSSC(employeeId);
          break;
        case "intermediate":
          response = await downloadIntermediate(employeeId);
          break;
        case "graduation":
          response = await downloadGraduation(employeeId);
          break;
        case "experience":
          response = await downloadExperienceFile(employeeId, fileId);
          break;
        default:
          throw new Error("Invalid document type");
      }
  
      if (!response) {
        throw new Error("Download failed: No response from server");
      }
    } catch (error) {
      console.error("Download failed:", error);
      // alert(error.message || "Download failed. Please try again.");
    }
  };

  const groupDocumentsByEmployee = (documents) => {
    return documents.reduce((acc, doc) => {
      if (!acc[doc.employeeId]) {
        acc[doc.employeeId] = {
          employeeId: doc.employeeId,
          documents: [],
        };
      }
      acc[doc.employeeId].documents.push(doc);
      return acc;
    }, {});
  };

  const filteredDocuments = Object.values(
    groupDocumentsByEmployee(documents)
  ).filter((employee) =>
    employee.employeeId.toString().includes(searchQuery.toLowerCase())
  );

  const toggleExpandedView = (employeeId) => {
    setExpandedEmployeeId(expandedEmployeeId === employeeId ? null : employeeId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Document Management</h1>
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Search by Employee ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded w-[50vw]"
        />
      </div>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Employee ID</th>
            <th className="p-2 border">No. of Documents</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredDocuments.map((employee) => (
            <React.Fragment key={employee.employeeId}>
              <tr className="hover:bg-gray-100">
                <td className="p-2 border text-center">{employee.employeeId}</td>
                <td className="p-2 border text-center">
                  {employee.documents.length}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => toggleExpandedView(employee.employeeId)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    {expandedEmployeeId === employee.employeeId
                      ? "Hide Documents"
                      : "View Documents"}
                  </button>
                </td>
              </tr>
              {expandedEmployeeId === employee.employeeId && (
                <tr>
                  <td colSpan="3" className="p-2 border">
                    <div className="p-4 bg-gray-50">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-2 border">Document Type</th>
                            <th className="p-2 border">File Name</th>
                            <th className="p-2 border">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {employee.documents.map((doc) => (
                            <tr key={doc.fileId} className="hover:bg-gray-100">
                              <td className="p-2 border text-center">
                                {doc.documentType}
                              </td>
                              <td className="p-2 border text-center">
                                {doc.fileName}
                              </td>
                              <td className="p-2 border text-center">
                                <button
                                  onClick={() =>
                                    handleDownload(doc.employeeId, doc.documentType, doc.id)
                                  }
                                  className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition duration-200"
                                >
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Documents;