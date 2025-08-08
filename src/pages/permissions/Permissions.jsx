import React, { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import AccessDenied from "../../components/common/AccessDenied";
import { getPermissionBadgeColor } from "../../utils";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { usePermissions } from "../../context/PermissionContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Permissions = () => {
  const instance = useAxios();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        // API call should include associated Module to get its name
        const response = await instance.get(API.permissions);
        if (response && response.data) {
          setPermissions(response.data.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view permissions.");
        } else {
          setError("Failed to fetch permissions. Please try again later.");
        }
        console.error("Fetch permissions error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (can("Permissions", "read")) {
      fetchPermissions();
    }
  }, []);

  const handleCreate = () => {
    if (!can("Permissions", "create")) {
      alert("You do not have permission to create a new permission.");
      return;
    }
    navigate("/permissions/create");
  };

  const handleEdit = (permissionId) => {
    if (!can("Permissions", "update")) {
      alert("You do not have permission to edit permissions.");
      return;
    }
    navigate(`/permissions/${permissionId}/edit`);
  };

  const handleDelete = (permissionId) => {
    if (!can("Permissions", "delete")) {
      alert("You do not have permission to delete permissions.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this permission?")) {
      instance
        .delete(`${API.permissions}/${permissionId}`)
        .then(() => {
          setPermissions(
            permissions.filter((permission) => permission.id !== permissionId)
          );
          toast.success("Module deleted successfully.");
        })
        .catch((err) => {
          console.error("Delete module error:", err);
          toast.error("Failed to delete module. Please try again later.");
        });
    }
  };

  if (!can("Permissions", "read")) {
    return <AccessDenied message={error} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Permission Management
          </h1>
          {can("Permissions", "create") && (
            <button
              onClick={handleCreate}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
            >
              + Add Permission
            </button>
          )}
        </div>

        {/* Permissions Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Module
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assigned Roles Count
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>
                    <SkeletonLoader rows={5} cols={5} />
                  </>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : permissions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      No permissions found.
                    </td>
                  </tr>
                ) : (
                  permissions.map((permission) => (
                    <tr key={permission.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permission.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full ${getPermissionBadgeColor(
                            permission.action
                          )}`}
                        >
                          {permission.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {permission.Module?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {permission.Roles?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {can("Permissions", "update") && (
                          <button
                            onClick={() => handleEdit(permission.id)}
                            className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {can("Permissions", "delete") && (
                          <button
                            onClick={() => handleDelete(permission.id)}
                            className="cursor-pointer text-red-600 hover:text-red-900 ml-4"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;
