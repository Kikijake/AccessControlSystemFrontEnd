import React, { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import AccessDenied from "../../components/common/AccessDenied";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { usePermissions } from "../../context/PermissionContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const instance = useAxios();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await instance.get(API.groups);
        if (response && response.data) {
          setGroups(response.data.data);
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
    if (can("Groups", "read")) {
      fetchGroups();
    }
  }, []);

  const handleCreate = () => {
    if (!can("Groups", "create")) {
      toast.error("You do not have permission to create groups.");
      return;
    }
    navigate("/groups/create");
  };

  const handleEdit = (groupId) => {
    if (!can("Groups", "update")) {
      toast.error("You do not have permission to update groups.");
      return;
    }
    navigate(`/groups/${groupId}/edit`);
  };

  const handleDelete = (groupId) => {
    if (!can("Groups", "delete")) {
      toast.error("You do not have permission to delete groups.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this group?")) {
      instance
        .delete(`${API.groups}/${groupId}`)
        .then(() => {
          setGroups((prevGroups) =>
            prevGroups.filter((group) => group.id !== groupId)
          );
          toast.success("Group deleted successfully.");
        })
        .catch((err) => {
          if (err.response && err.response.status === 403) {
            toast.error("You do not have permission to delete groups.");
          } else {
            toast.error("Failed to delete group. Please try again later.");
          }
          console.error("Delete group error:", err);
        });
    }
  };

  if (!can("Groups", "read")) {
    return <AccessDenied message={error} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          {can("Groups", "create") && (
            <button
              onClick={handleCreate}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
            >
              + Add Group
            </button>
          )}
        </div>

        {/* Groups Table */}
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
                    Group Name
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
                    Members
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Roles
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
                ) : groups.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-gray-500">
                      No groups found.
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr key={group.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {group.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {group.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.Users?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {group.Roles && group.Roles.length > 0 ? (
                          group.Roles.map((role) => (
                            <span
                              key={role.id}
                              className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">No roles</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {can("Groups", "update") && (
                          <button
                            onClick={() => handleEdit(group.id)}
                            className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {can("Groups", "delete") && (
                          <button
                            onClick={() => handleDelete(group.id)}
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

export default Groups;
