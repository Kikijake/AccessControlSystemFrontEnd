import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useAxios from "../../hooks/useAxios";
import API from "../../networks/API";
import { debounce } from "lodash"; // You may need to run: npm install lodash
import { usePermissions } from "../../context/PermissionContext";
import AccessDenied from "../../components/common/AccessDenied";

const EditGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const instance = useAxios();
  const { can } = usePermissions();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the user search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch initial group data
  useEffect(() => {
    const fetchGroupData = async () => {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Loading group data...");
      try {
        const response = await instance.get(`${API.groups}/${groupId}`);
        setGroup(response.data.data);
        setMembers(response.data.data.Users);
        toast.success("Data loaded successfully!", { id: toastId });
      } catch (err) {
        setError("Failed to load group data.");
        toast.error("Failed to load group data.", { id: toastId });
      } finally {
        setLoading(false);
      }
    };
    if (can("Groups", "update") && can("Groups", "read")) {
      fetchGroupData();
    }
  }, [groupId]);

  // Debounced user search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const response = await instance.get(`${API.users}?search=${query}`);
        const memberIds = new Set(members.map((m) => m.id));
        // Filter out users who are already members
        setSearchResults(
          response.data.data.filter((user) => !memberIds.has(user.id))
        );
      } catch (err) {
        console.error("Failed to search users:", err);
      } finally {
        setIsSearching(false);
      }
    }, 500), // 500ms delay
    [members] // Re-create the debounced function if members change
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  const handleDetailsChange = (e) => {
    setGroup({ ...group, [e.target.name]: e.target.value });
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Saving group details...");
    try {
      await instance.put(`${API.groups}/${groupId}`, {
        name: group.name,
        description: group.description,
      });
      toast.success("Group details updated!", { id: toastId });
    } catch (err) {
      toast.error("Failed to save details.", { id: toastId });
    }
  };

  const handleAddUser = async (user) => {
    const toastId = toast.loading(`Adding ${user.username} to group...`);
    try {
      await instance.post(`${API.groups}/${groupId}/users`, {
        userId: user.id,
      });
      setMembers((prev) => [...prev, user]); // Add user to local state for instant feedback
      setSearchTerm(""); // Clear search
      setSearchResults([]); // Clear results
      toast.success(`${user.username} added successfully!`, { id: toastId });
    } catch (err) {
      toast.error(`Failed to add ${user.username}.`, { id: toastId });
    }
  };

  if (!can("Groups", "update") || !can("Groups", "read")) {
    return <AccessDenied message="You do not have permission to edit groups." />;
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Edit Group: {group?.name}
          </h1>
          <button
            onClick={() => navigate("/groups")}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            &larr; Back to Groups
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Details */}
          <form
            onSubmit={handleDetailsSubmit}
            className="bg-white p-6 rounded-lg shadow-md space-y-4 self-start"
          >
            <h2 className="text-xl font-semibold text-gray-800">
              Group Details
            </h2>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Group Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={group?.name || ""}
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
                value={group?.description || ""}
                onChange={handleDetailsChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Right Column: Members */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Manage Members
            </h2>
            {/* User Search Input */}
            <div>
              <label
                htmlFor="user-search"
                className="block text-sm font-medium text-gray-700"
              >
                Add User by Username
              </label>
              <input
                type="text"
                id="user-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for a user..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            {/* Search Results */}
            {(isSearching || searchResults.length > 0) && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {isSearching && (
                  <p className="p-2 text-sm text-gray-500">Searching...</p>
                )}
                {!isSearching &&
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50"
                    >
                      <span className="text-sm">{user.username}</span>
                      <button
                        onClick={() => handleAddUser(user)}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1 px-2 rounded cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Current Members List */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">
                Current Members ({members.length})
              </h3>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <span className="text-sm">{member.username}</span>
                      {/* Placeholder for remove button */}
                      {/* <button className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer">
                        Remove
                      </button> */}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No users in this group.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGroup;
