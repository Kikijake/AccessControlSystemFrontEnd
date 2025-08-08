import React, { useEffect, useState } from "react";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import AccessDenied from "../../components/common/AccessDenied";
import SkeletonLoader from "../../components/common/SkeletonLoader";
import { usePermissions } from "../../context/PermissionContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Modules = () => {
  const instance = useAxios();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        // API call should include associated Permissions to get the count
        const response = await instance.get(API.modules);
        if (response && response.data) {
          setModules(response.data.data);
        }
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("You do not have permission to view modules.");
        } else {
          setError("Failed to fetch modules. Please try again later.");
        }
        console.error("Fetch modules error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (can("Modules", "read")) {
      fetchModules();
    }
  }, []);

  const handleCreate = () => {
    if (!can("Modules", "create")) {
      toast.error("You do not have permission to create modules.");
      return;
    }
    navigate("/modules/create");
  };

  const handleEdit = (moduleId) => {
    if (!can("Modules", "update")) {
      toast.error("You do not have permission to edit modules.");
      return;
    }
    navigate(`/modules/${moduleId}/edit`);
  };

  const handleDelete = (moduleId) => {
    if (!can("Modules", "delete")) {
      toast.error("You do not have permission to delete modules.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this module?")) {
      instance
        .delete(`${API.modules}/${moduleId}`)
        .then(() => {
          setModules(modules.filter((module) => module.id !== moduleId));
          toast.success("Module deleted successfully.");
        })
        .catch((err) => {
          console.error("Delete module error:", err);
          toast.error("Failed to delete module. Please try again later.");
        });
    }
  };

  if (!can("Modules", "read")) {
    return <AccessDenied message={error} />;
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Module Management
          </h1>
          {can("Modules", "create") && (
            <button
              onClick={handleCreate}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors duration-300"
            >
              + Add Module
            </button>
          )}
        </div>

        {/* Modules Table */}
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
                    Module Name
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
                ) : modules.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-gray-500">
                      No modules found.
                    </td>
                  </tr>
                ) : (
                  modules.map((module) => (
                    <tr key={module.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {module.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-md truncate">
                        {module.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {module.Permissions?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {can("Modules", "update") && (
                          <button
                            onClick={() => handleEdit(module.id)}
                            className="cursor-pointer text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                        )}
                        {can("Modules", "delete") && (
                          <button
                            onClick={() => handleDelete(module.id)}
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

export default Modules;
