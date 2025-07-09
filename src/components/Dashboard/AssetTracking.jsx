import { useState, useEffect } from "react";
import axios from "axios";

export default function AssetTracking() {
  const [assets, setAssets] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [newAsset, setNewAsset] = useState({
    serialNo: "",
    brand: "",
    ram: "",
    rom: "",
    processor: "",
    dateOfIssue: "",
    accessories: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false); 

  const assetTrackingManagementLink = import.meta.env.VITE_ASSET_MANAGEMENT;
  const token = sessionStorage.getItem("token"); 

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const res = await axios.get(`${assetTrackingManagementLink}/api/assets/getAllAssets`, axiosConfig);
      setAssets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching assets:", error);
      setAssets([]);
    }
  };

  const fetchAssetsByEmployee = async () => {
    if (!employeeId) return;
    try {
      const res = await axios.get(
        `${assetTrackingManagementLink}/api/assets/employee/${employeeId}`,
        axiosConfig
      );
      setAssets(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching assets by employee:", error);
      setAssets([]);
    }
  };

  const handleAssignAsset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${assetTrackingManagementLink}/api/assets/${employeeId}`, newAsset, axiosConfig);
      alert("Asset Assigned Successfully");
      setNewAsset({ serialNo: "", brand: "", ram: "", rom: "", processor: "", dateOfIssue: "", accessories: "" });
      fetchAssets();
      setIsModalOpen(false); 
    } catch (error) {
      console.error("Error assigning asset:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between">
        
      <h1 className="text-3xl font-bold mb-4">Asset Tracking</h1>

      {/* Button to open the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
      >
        Assign Asset
      </button>
      </div>
      {/* Modal Dialog for Assigning Asset */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[70%] md:w-[60%] lg:w-[50%]">
            <h2 className="text-xl font-semibold mb-2">Assign Asset</h2>
            <form onSubmit={handleAssignAsset} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Serial No"
                className="p-2 border rounded"
                value={newAsset.serialNo}
                onChange={(e) => setNewAsset({ ...newAsset, serialNo: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Brand"
                className="p-2 border rounded"
                value={newAsset.brand}
                onChange={(e) => setNewAsset({ ...newAsset, brand: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="RAM"
                className="p-2 border rounded"
                value={newAsset.ram}
                onChange={(e) => setNewAsset({ ...newAsset, ram: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="ROM"
                className="p-2 border rounded"
                value={newAsset.rom}
                onChange={(e) => setNewAsset({ ...newAsset, rom: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Processor"
                className="p-2 border rounded"
                value={newAsset.processor}
                onChange={(e) => setNewAsset({ ...newAsset, processor: e.target.value })}
                required
              />
              <input
                type="date"
                className="p-2 border rounded"
                value={newAsset.dateOfIssue}
                onChange={(e) => setNewAsset({ ...newAsset, dateOfIssue: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Accessories (comma separated)"
                className="p-2 border rounded"
                value={newAsset.accessories}
                onChange={(e) => setNewAsset({ ...newAsset, accessories: e.target.value.split(",") })}
              />
              <input
                type="number"
                placeholder="Employee ID"
                className="p-2 border rounded"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
              <div className="col-span-2 flex justify-between">
                <button
                  type="submit"
                  className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Assign Asset
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded shadow-md mb-4">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Enter Employee ID"
            className="p-2 border rounded"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
          />
          <button onClick={fetchAssetsByEmployee} className="p-2 bg-green-600 text-white rounded hover:bg-green-700">
            Search
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">All Assets</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Employee ID</th> {/* Added Employee ID column */}
              <th className="border p-2">Serial No</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">RAM</th>
              <th className="border p-2">ROM</th>
              <th className="border p-2">Processor</th>
              <th className="border p-2">Date of Issue</th>
              <th className="border p-2">Accessories</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(assets) && assets.length > 0 ? (
              assets.map((asset) => (
                <tr key={asset.id} className="text-center">
                  <td className="border p-2">{asset.employeeId}</td> {/* Display Employee ID */}
                  <td className="border p-2">{asset.serialNo}</td>
                  <td className="border p-2">{asset.brand}</td>
                  <td className="border p-2">{asset.ram}</td>
                  <td className="border p-2">{asset.rom}</td>
                  <td className="border p-2">{asset.processor}</td>
                  <td className="border p-2">{asset.dateOfIssue}</td>
                  <td className="border p-2">{asset.accessories?.join(", ")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center p-4">No assets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}