import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { usePermissions } from "../../context/PermissionContext";
import AccessDenied from "../../components/common/AccessDenied";

const EditUser = () => {
  const { userId } = useParams();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const instance = useAxios();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Loading user data...");

      try {
        const response = await instance.get(`${API.users}/${userId}`);
        setUser(response.data.data);
        toast.success("Data loaded successfully!", { id: toastId });
      } catch (err) {
        setError("Failed to load user data.");
        toast.error("Failed to load user data.", { id: toastId });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (can("Users", "update") && can("Users", "read")) {
      fetchData();
    }
  }, [userId]);

  const handleChange = (e) => {
    // We update a temporary copy of the password fields, not the main user object
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.password && user.password !== user.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving changes...");

    // Payload no longer includes groupIds
    const payload = {
      username: user.username,
    };
    if (user.password) {
      payload.password = user.password;
    }

    try {
      await instance.put(`${API.users}/${userId}`, payload);
      toast.success("User updated successfully!", { id: toastId });
      navigate("/users");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user.", {
        id: toastId,
      });
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!can("Users", "update") || !can("Users", "read"))
    return <AccessDenied message="You do not have permission to edit users." />;

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit User: {user.username}
          </h1>
          <button
            onClick={() => navigate("/users")}
            className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            &larr; Back to Users
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: User Details */}
          <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                name="username"
                id="username"
                value={user.username}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="border-t pt-6 space-y-6">
              <p className="text-sm text-gray-500">
                Leave password fields blank to keep the current password.
              </p>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={user.password || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={user.confirmPassword || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Group Membership (Read-Only) */}
          <div className="lg:col-span-1 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Group Membership
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.Groups && user.Groups.length > 0 ? (
                user.Groups.map((group) => (
                  <span
                    key={group.id}
                    className="inline-block bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full"
                  >
                    {group.name}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  This user is not in any groups.
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="lg:col-span-3 flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/users")}
              className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm disabled:bg-gray-400"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
