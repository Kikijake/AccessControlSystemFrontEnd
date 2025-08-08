import React, { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import AccessDenied from "../../components/common/AccessDenied";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { usePermissions } from "../../context/PermissionContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Roles = () => {
  const instance = useAxios();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        // API call should include associated Permissions and Groups
        const response = await instance.get(API.roles);
        if (response && response.data) {
          setRoles(response.data.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view roles.");
        } else {
          setError("Failed to fetch roles. Please try again later.");
        }
        console.error("Fetch roles error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (can("Roles", "read")) {
      fetchRoles();
    }
  }, []);

  const handleCreate = () => {
    if (!can("Roles", "create")) {
      toast.error("You do not have permission to create roles.");
      return;
    }
    navigate("/roles/create");
  };
  const handleEdit = (roleId) => {
    if (!can("Roles", "update")) {
      toast.error("You do not have permission to edit roles.");
      return;
    }
    navigate(`/roles/${roleId}/edit`);
  };

  const handleDelete = (roleId) => {
    if (!can("Roles", "delete")) {
      toast.error("You do not have permission to delete roles.");
      return;
    }
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this role? This action cannot be undone."
        )
      ) {
        instance
          .delete(`${API.roles}/${roleId}`)
          .then(() => {
            setRoles(roles.filter((role) => role.id !== roleId));
            toast.success("Role deleted successfully.");
          })
          .catch((err) => {
            console.error(err);
            toast.error("Failed to delete role.");
          });
      }
    } catch (err) {
      console.error("Delete role error:", err);
      toast.error("Failed to delete role.");
    }
  };

  if (!can("Roles", "read")) {
    return <AccessDenied message={error} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
          {can("Roles", "create") && (
            <button
              onClick={handleCreate}
              className=" cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
            >
              + Add Role
            </button>
          )}
        </div>

        {/* Roles Table */}
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
                    Role Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Permissions Count
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Assigned to Groups
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <>
                    <SkeletonLoader rows={5} cols={6} />
                  </>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {role.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {role.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {role.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {role.Permissions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {role.Groups && role.Groups.length > 0 ? (
                          role.Groups.map((group) => (
                            <span
                              key={group.id}
                              className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
                            >
                              {group.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">
                            No groups
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {can("Roles", "update") && (
                          <button
                            onClick={() => handleEdit(role.id)}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          >
                            Edit
                          </button>
                        )}
                        {can("Roles", "delete") && (
                          <button
                            onClick={() => handleDelete(role.id)}
                            className="text-red-600 hover:text-red-900 ml-4 cursor-pointer"
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

export default Roles;
