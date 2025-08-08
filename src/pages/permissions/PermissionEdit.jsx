import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { usePermissions } from "../../context/PermissionContext";
import AccessDenied from "../../components/common/AccessDenied";

const PermissionEdit = () => {
  const { permissionId } = useParams();
  const navigate = useNavigate();
  const instance = useAxios();
  const { can } = usePermissions();

  const [permission, setPermission] = useState(null);
  const [formData, setFormData] = useState({ ModuleId: "", action: "" });
  const [allRoles, setAllRoles] = useState([]);
  const [allModules, setAllModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [assigningState, setAssigningState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Loading data...");

      try {
        const [permRes, modulesRes, rolesRes] = await Promise.all([
          instance.get(`${API.permissions}/${permissionId}`),
          instance.get(API.modules),
          instance.get(API.roles),
        ]);

        const permData = permRes.data.data;
        setPermission(permData);
        setFormData({ ModuleId: permData.Module.id, action: permData.action });
        setAllModules(modulesRes.data.data);
        setAllRoles(rolesRes.data.data);

        toast.success("Data loaded!", { id: toastId });
      } catch (err) {
        setError("Failed to load data.");
        toast.error("Failed to load data.", { id: toastId });
      } finally {
        setLoading(false);
      }
    };

    if (can("Permissions", "update") && can("Permissions", "read")) {
      fetchData();
    }
  }, [permissionId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setIsSavingDetails(true);
    const toastId = toast.loading("Saving details...");

    try {
      await instance.put(`${API.permissions}/${permissionId}`, formData);
      toast.success("Permission details updated!", { id: toastId });
    } catch (err) {
      toast.error("Failed to save details.", { id: toastId });
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleAssignToRole = async (roleId) => {
    setAssigningState((prev) => ({ ...prev, [roleId]: "loading" }));
    const toastId = toast.loading(`Assigning permission...`);

    try {
      // Use the specific endpoint for assignment
      const response = await instance.post(
        `${API.roles}/${roleId}/permissions`,
        { permissionId }
      );

      // Update local state for instant UI feedback
      const roleToAdd = allRoles.find((r) => r.id === roleId);
      if (roleToAdd) {
        setPermission((prev) => ({
          ...prev,
          Roles: [...prev.Roles, roleToAdd],
        }));
      }

      toast.success(response.data.message || "Permission assigned!", {
        id: toastId,
      });
      setAssigningState((prev) => ({ ...prev, [roleId]: "assigned" }));
    } catch (err) {
      toast.error("Failed to assign permission.", { id: toastId });
      setAssigningState((prev) => ({ ...prev, [roleId]: "error" }));
    }
  };

  if (!can("Permissions", "update") || !can("Permissions", "read")) {
    return <AccessDenied message={"You do not have permission to edit permissions."} />;
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const assignedRoleIds = new Set(permission.Roles.map((r) => r.id));

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Permission
          </h1>
          <button
            onClick={() => navigate("/permissions")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            &larr; Back to Permissions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Permission Details */}
          <form
            onSubmit={handleDetailsSubmit}
            className="bg-white p-6 rounded-lg shadow-md space-y-6 self-start"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Permission Details
            </h2>
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
              >
                {allModules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"
              >
                <option value="create">create</option>
                <option value="read">read</option>
                <option value="update">update</option>
                <option value="delete">delete</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingDetails}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400 cursor-pointer"
              >
                {isSavingDetails ? "Saving..." : "Save Details"}
              </button>
            </div>
          </form>

          {/* Right Column: Role Assignments */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Assign to Roles
            </h2>
            <div className="max-h-80 overflow-y-auto space-y-3">
              {allRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span className="text-sm text-gray-700">{role.name}</span>
                  {assignedRoleIds.has(role.id) ||
                  assigningState[role.id] === "assigned" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Assigned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssignToRole(role.id)}
                      disabled={assigningState[role.id] === "loading"}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded disabled:bg-gray-400 cursor-pointer"
                    >
                      {assigningState[role.id] === "loading"
                        ? "..."
                        : "+ Assign"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionEdit;
