import React, { createContext, useState, useEffect, useContext } from "react";
import useAxios from "../hooks/useAxios";
import API from "../networks/API";

const PermissionContext = createContext();

export const usePermissions = () => {
  return useContext(PermissionContext);
};

export const PermissionProvider = ({ children }) => {
  const instance = useAxios();
  const [permissions, setPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await instance.get(API.myPermissions);
        if (response && response.data) {
          setPermissions(new Set(response.data.data));
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        setPermissions(new Set()); // Ensure permissions is not null on error
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);
  const can = (module, action) => {
    const permissionString = `${module}:${action}`;
    return permissions.has(permissionString);
  };

  const value = {
    can,
    loading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {!loading && children}
    </PermissionContext.Provider>
  );
};
