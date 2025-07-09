const documentManagementLink = import.meta.env.VITE_DOCUMENT_MANAGEMENT;
const BASE_URL = `${documentManagementLink}/api/v1/files`;


// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (error) {
      errorData = { error: response.statusText || "Request failed" };
    }
    throw new Error(errorData.error || "Request failed");
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Invalid JSON response from server");
  }
};

// Helper function to handle file downloads
const handleFileDownload = async (response, defaultFilename) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Download error:", errorText);
    // throw new Error("Download failed: " + errorText);
  }

  // ✅ Get the correct file type from response headers
  const contentType = response.headers.get("Content-Type");
  if (!contentType) {
    throw new Error("Unknown file type. Cannot determine format.");
  }

  // ✅ Extract file extension dynamically
  const extension = contentType.split("/")[1]; // e.g., "jpeg" from "image/jpeg"
  const filename = `${defaultFilename}.${extension}`;

  // ✅ Convert response to a Blob
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  // ✅ Create and trigger download
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  // ✅ Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};


// ------------------ Common Endpoints ------------------

export const getAllFiles = async () => {
  const response = await fetch(`${BASE_URL}/getAllFiles`);
  return handleResponse(response);
};

// ------------------ Aadhar Endpoints ------------------

export const uploadAadhar = async (employeeId, file) => {
  if (!file) {
    throw new Error("No file selected for upload");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/aadhar/upload/${employeeId}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

export const downloadAadhar = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/aadhar/download/${employeeId}`);
  return handleFileDownload(response, "aadhar_document.pdf");
};

export const updateAadhar = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/aadhar/update/${employeeId}`, {
    method: "PUT",
    body: formData,
  });

  return handleResponse(response);
};

export const deleteAadhar = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/aadhar/delete/${employeeId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};

// ------------------ PAN Endpoints ------------------

export const uploadPan = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/pan/upload/${employeeId}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

export const downloadPan = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/pan/download/${employeeId}`);
  await handleFileDownload(response, "pan_document.pdf");
};

export const updatePan = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/pan/update/${employeeId}`, {
    method: "PUT",
    body: formData,
  });

  return handleResponse(response);
};

export const deletePan = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/pan/delete/${employeeId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};

// ------------------ Educational Documents Endpoints ------------------

export const uploadSSC = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/ssc/upload/${employeeId}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

export const downloadSSC = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/ssc/download/${employeeId}`);
  await handleFileDownload(response, "ssc_document.pdf");
};

export const updateSSC = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/ssc/update/${employeeId}`, {
    method: "PUT",
    body: formData,
  });

  return handleResponse(response);
};

export const deleteSSC = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/ssc/delete/${employeeId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};

export const uploadIntermediate = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/intermediate/upload/${employeeId}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

export const downloadIntermediate = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/intermediate/download/${employeeId}`);
  await handleFileDownload(response, "intermediate_document.pdf");
};

export const updateIntermediate = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/intermediate/update/${employeeId}`, {
    method: "PUT",
    body: formData,
  });

  return handleResponse(response);
};

export const deleteIntermediate = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/intermediate/delete/${employeeId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};

export const uploadGraduation = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/graduation/upload/${employeeId}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

export const downloadGraduation = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/graduation/download/${employeeId}`);
  await handleFileDownload(response, "graduation_document.pdf");
};

export const updateGraduation = async (employeeId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/graduation/update/${employeeId}`, {
    method: "PUT",
    body: formData,
  });

  return handleResponse(response);
};

export const deleteGraduation = async (employeeId) => {
  const response = await fetch(`${BASE_URL}/graduation/delete/${employeeId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};

// ------------------ Experience Endpoints ------------------

export const uploadExperience = async (employeeId, files) => {
  if (!files || files.length === 0) {
    throw new Error("No files selected for upload");
  }

  const formData = new FormData();

  if (Array.isArray(files)) {
    files.forEach((file) => {
      if (file) {
        formData.append("files", file);
      }
    });
  } else {
    formData.append("files", files); // Handle single file case
  }

  try {
    const response = await fetch(`${BASE_URL}/experience/upload/${employeeId}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading experience documents:", error.message);
    throw error;
  }
};


export const downloadExperienceFile = async (employeeId, fileId) => {
  const response = await fetch(`${BASE_URL}/experience/download/${employeeId}/${fileId}`);
  await handleFileDownload(response, "experience_document.pdf");
};

export const updateExperienceFile = async (employeeId, fileId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/experience/update/${employeeId}/${fileId}`, {
    method: "PUT",
    body: formData,
  });

  return handleResponse(response);
};

export const deleteExperienceFile = async (employeeId, fileId) => {
  const response = await fetch(`${BASE_URL}/experience/delete/${employeeId}/${fileId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
};