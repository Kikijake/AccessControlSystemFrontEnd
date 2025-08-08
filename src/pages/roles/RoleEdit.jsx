import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { getPermissionBadgeColor } from "../../utils";
import { usePermissions } from "../../context/PermissionContext";
import AccessDenied from "../../components/common/AccessDenied";

const RoleEdit = () => {
  const { roleId } = useParams();
  const instance = useAxios();
  const navigate = useNavigate();
  const {can} = usePermissions();

  const [role, setRole] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigningState, setAssigningState] = useState({}); // Tracks loading state per button

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Loading role data...");

      try {
        const [roleRes, groupsRes] = await Promise.all([
          instance.get(`${API.roles}/${roleId}`),
          instance.get(API.groups),
        ]);

        setRole(roleRes.data.data);
        setAllGroups(groupsRes.data.data);
        toast.success("Data loaded successfully!", { id: toastId });
      } catch (err) {
        setError("Failed to load role data.");
        toast.error("Failed to load role data.", { id: toastId });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (can("Roles", "update") && can("Roles", "read")) {
      fetchData();
    }
  }, [roleId]);

  const handleDetailsChange = (e) => {
    setRole({ ...role, [e.target.name]: e.target.value });
  };

  const handleAssignToGroup = async (groupId) => {
    setAssigningState((prev) => ({ ...prev, [groupId]: "loading" }));
    const toastId = toast.loading("Assigning role to group...");

    try {
      const response = await instance.post(
        `${API.groups}/${groupId}${API.roles}`,
        {
          roleId,
        }
      );

      const updatedRoleData = response.data.data;
      setRole((prev) => ({
        ...prev,
        Groups: [...prev.Groups, updatedRoleData],
      }));

      const groupToAdd = allGroups.find((g) => g.id === groupId);
      if (groupToAdd) {
        setRole((prev) => ({ ...prev, Groups: [...prev.Groups, groupToAdd] }));
      }

      toast.success(response.data.message || "Role assigned!", { id: toastId });
      setAssigningState((prev) => ({ ...prev, [groupId]: "assigned" }));
    } catch (err) {
      toast.error("Failed to assign role.", { id: toastId });
      console.error(err);
      setAssigningState((prev) => ({ ...prev, [groupId]: "error" }));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving changes...");
    try {
      await instance.put(`${API.roles}/${roleId}`, {
        name: role.name,
        description: role.description,
      });
      toast.success("Role details updated!", { id: toastId });
    } catch (err) {
      toast.error("Failed to save changes.", { id: toastId });
      console.error(err);
    }
  };
  
    if(!can("Roles", "update") || !can("Roles", "read")) {
      return <AccessDenied message="You do not have permission to edit roles." />;
    }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  const assignedGroupIds = new Set(role.Groups.map((g) => g.id));

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Role: {role.name}
          </h1>
          <button
            onClick={() => navigate("/roles")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            &larr; Back to Roles
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Details & Permissions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Role Details Form */}
            <form
              onSubmit={handleSaveChanges}
              className="bg-white p-6 rounded-lg shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Role Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={role.name}
                    onChange={handleDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={role.description}
                    onChange={handleDetailsChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* Read-Only Permissions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Permissions
              </h2>
              <div className="flex flex-wrap gap-2">
                {role.Permissions?.length > 0 ? (
                  role.Permissions.map((p) => (
                    <span
                      key={p.id}
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getPermissionBadgeColor(
                        p.action
                      )}`}
                    >
                      {p.Module?.name}:<strong>{p.action}</strong>
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">This role has no permissions.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Group Assignments */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Assign to Groups
            </h2>
            <div className="max-h-96 overflow-y-auto space-y-3">
              {allGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <span className="text-sm text-gray-700">{group.name}</span>
                  {assignedGroupIds.has(group.id) ||
                  assigningState[group.id] === "assigned" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Assigned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssignToGroup(group.id)}
                      disabled={assigningState[group.id] === "loading"}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded disabled:bg-gray-400"
                    >
                      {assigningState[group.id] === "loading"
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

export default RoleEdit;
