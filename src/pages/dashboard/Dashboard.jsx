import React, { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { getPermissionBadgeColor } from "../../utils";

const Dashboard = () => {
  const instance = useAxios();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [simulate, setSimulate] = useState({
    module: "",
    action: "read",
  });

  const [simResult, setSimResult] = useState(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await instance.get(API.myPermissions);
      if (response && response.data) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateChange = (e) => {
    setSimulate({ ...simulate, [e.target.name]: e.target.value });
  };

  const handleSimulateSubmit = async (e) => {
    e.preventDefault();
    if (!simulate.module || !simulate.action) {
      alert("Please enter both a module and an action.");
      return;
    }
    setSimResult(null); // Clear previous result
    try {
      const response = await instance.post(API.simulateAction, simulate);
      if (response && response.data) {
        setSimResult(response.data);
      }
    } catch (error) {
      console.error("Error simulating action:", error);
      const errorMsg = error.response?.data || {
        message: "An unknown error occurred.",
      };
      setSimResult({ success: false, ...errorMsg });
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {/* Permissions Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Your Current Permissions
          </h2>
          {loading ? (
            <p className="text-gray-500">Loading permissions...</p>
          ) : permissions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => {
                const [module, action] = permission.split(":");
                const colorClass = getPermissionBadgeColor(action);
                return (
                  <span
                    key={permission}
                    className={`px-3 py-1 text-sm font-medium rounded-full ${colorClass}`}
                  >
                    {module}:<strong style={{ textTransform: "capitalize" }}>{action}</strong>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">You have no assigned permissions.</p>
          )}
        </div>

        {/* Simulate Action Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Simulate an Action
          </h2>
          <form
            onSubmit={handleSimulateSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            {/* Module Input */}
            <div>
              <label
                htmlFor="module"
                className="block text-sm font-medium text-gray-700"
              >
                Module Name
              </label>
              <input
                type="text"
                name="module"
                id="module"
                value={simulate.module}
                onChange={handleSimulateChange}
                required
                placeholder="e.g., Users"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Action Select */}
            <div>
              <label
                htmlFor="action"
                className="block text-sm font-medium text-gray-700"
              >
                Action
              </label>
              <select
                name="action"
                id="action"
                value={simulate.action}
                onChange={handleSimulateChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="read">read</option>
                <option value="create">create</option>
                <option value="update">update</option>
                <option value="delete">delete</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:pt-6">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Simulate
              </button>
            </div>
          </form>

          {/* Simulation Result */}
          {simResult && (
            <div
              className={`mt-4 p-4 rounded-md text-sm ${
                simResult.data?.canPerform
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <p className="font-bold">
                {simResult.data?.canPerform
                  ? "Access Granted"
                  : "Access Denied"}
              </p>
              <p>{simResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
