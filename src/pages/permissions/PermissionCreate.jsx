import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { usePermissions } from "../../context/PermissionContext";
import AccessDenied from "../../components/common/AccessDenied";

const CreatePermission = () => {
  const navigate = useNavigate();
  const instance = useAxios();
  const { can } = usePermissions();

  const [formData, setFormData] = useState({
    ModuleId: "",
    action: "read", // Default to a common action
  });
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all modules to populate the dropdown
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoadingModules(true);
        const response = await instance.get(API.modules);
        setModules(response.data.data);
      } catch (err) {
        toast.error("Could not fetch the list of modules.");
        console.error(err);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ModuleId || !formData.action) {
      toast.error("Both a module and an action must be selected.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating new permission...");

    try {
      await instance.post(API.permissions, formData);
      toast.success("Permission created successfully!", { id: toastId });
      navigate("/permissions");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to create permission.",
        { id: toastId }
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can("Permissions", "create")) {
    return <AccessDenied message={"You do not have permission to create permissions."} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Permission
          </h1>
          <button
            onClick={() => navigate("/permissions")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            &larr; Back to Permissions
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6"
        >
          {/* Module Select */}
          <div>
            <label
              htmlFor="ModuleId"
              className="block text-sm font-medium text-gray-700"
            >
              Module
            </label>
            <select
              name="ModuleId"
              id="ModuleId"
              value={formData.ModuleId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              disabled={loadingModules}
            >
              <option value="" disabled>
                {loadingModules ? "Loading modules..." : "Select a module"}
              </option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
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
              value={formData.action}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="create">create</option>
              <option value="read">read</option>
              <option value="update">update</option>
              <option value="delete">delete</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/permissions")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingModules}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Permission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePermission;
