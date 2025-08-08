import React, { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import AccessDenied from "../../components/common/AccessDenied";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { usePermissions } from "../../context/PermissionContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const instance = useAxios();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await instance.get(API.users); // e.g., GET /api/users
        if (response && response.data) {
          setUsers(response.data.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view groups.");
        } else {
          setError("Failed to fetch groups. Please try again later.");
        }
        console.error("Fetch groups error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (can("Users", "read")) {
      fetchUsers();
    }
  }, []); // The empty dependency array ensures this runs once on mount

  const handleCreate = () => {
    if (!can("Users", "create")) {
      toast.error("You do not have permission to create roles.");
      return;
    }
    navigate("/users/create");
  };

  const handleEdit = (userId) => {
    if (!can("Users", "update")) {
      toast.error("You do not have permission to edit users.");
      return;
    }
    navigate(`/users/${userId}/edit`);
  };

  const handleDelete = (userId) => {
    if (!can("Users", "delete")) {
      toast.error("You do not have permission to delete users.");
      return;
    }
    try {
      if (
        window.confirm(
          "Are you sure you want to delete this role? This action cannot be undone."
        )
      ) {
        instance
          .delete(`${API.users}/${userId}`)
          .then(() => {
            setUsers(users.filter((user) => user.id !== userId));
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

  if (!can("Users", "read")) {
    return <AccessDenied message={error} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          {can("Users", "create") && (
            <button
              onClick={handleCreate}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
            >
              + Add User
            </button>
          )}
        </div>

        {/* User Table */}
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
                    Username
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Groups
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Joined At
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
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.Groups && user.Groups.length > 0 ? (
                          user.Groups.map((group) => (
                            <span
                              key={group.id}
                              className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {can("Users", "update") && (
                          <button
                            onClick={() => handleEdit(user.id)}
                            className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {can("Users", "delete") && (
                          <button
                            onClick={() => handleDelete(user.id)}
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

export default Users;
