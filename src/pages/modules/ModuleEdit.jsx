import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { usePermissions } from "../../context/PermissionContext";

const ModuleEdit = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const instance = useAxios();
  const { can } = usePermissions();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModule = async () => {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Loading module data...");
      try {
        const response = await instance.get(`${API.modules}/${moduleId}`);
        setFormData({
          name: response.data.data.name,
          description: response.data.data.description,
        });
        toast.success("Data loaded!", { id: toastId });
      } catch (err) {
        toast.error("Failed to load module data.", { id: toastId });
        setError("Could not fetch module details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (can("Modules", "update") && can("Modules", "read")) {
      fetchModule();
    }
  }, [moduleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Module name is required.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    try {
      await instance.put(`${API.modules}/${moduleId}`, formData);
      toast.success("Module updated successfully!", { id: toastId });
      navigate("/modules");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update module.", {
        id: toastId,
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can("Modules", "update") || !can("Modules", "read")) {
    return <AccessDenied message={"You do not have permission to edit modules."} />;
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Edit Module</h1>
          <button
            onClick={() => navigate("/modules")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            &larr; Back to Modules
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md space-y-6"
        >
          {/* Module Name Input */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Module Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Description Input */}
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
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/modules")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleEdit;
