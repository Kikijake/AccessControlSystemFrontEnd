import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { LoginPage } from "./auth.route";
import { Layout } from "./layout.route";
import { Dashboard } from "./dashboard.route";
import { UserCreate, UserEdit, Users } from "./users.route";
import { GroupCreate, GroupEdit, Groups } from "./groups.route";
import { RoleCreate, RoleEdit, Roles } from "./roles.route";
import { ModuleCreate, ModuleEdit, Modules } from "./modules.route";
import { PermissionCreate, PermissionEdit, Permissions } from "./permissions.route";
import { PermissionProvider } from "../context/PermissionContext";

const Router = () => {
  const auth = useSelector((state) => state.auth);

  return (
    <>
      {auth.token ? (
        <PermissionProvider>
          <Routes>
            <Route element={<Layout />}>
              <>
                <Route path="*" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* User Routes */}
                <Route path="/users" element={<Users />} />
                <Route path="/users/create" element={<UserCreate />} />
                <Route path="/users/:userId/edit" element={<UserEdit />} />
                {/* Group Routes */}
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/create" element={<GroupCreate />} />
                <Route path="/groups/:groupId/edit" element={<GroupEdit />} />
                {/* Role Routes */}
                <Route path="/roles" element={<Roles />} />
                <Route path="/roles/create" element={<RoleCreate />} />
                <Route path="/roles/:roleId/edit" element={<RoleEdit />} />
                {/* Module Routes */}
                <Route path="/modules" element={<Modules />} />
                <Route path="/modules/create" element={<ModuleCreate />} />
                <Route path="/modules/:moduleId/edit" element={<ModuleEdit />} />
                {/* Permissions Route */}
                <Route path="/permissions" element={<Permissions />} />
                <Route path="/permissions/create" element={<PermissionCreate />} />
                <Route path="/permissions/:permissionId/edit" element={<PermissionEdit />} />
              </>
            </Route>
          </Routes>
        </PermissionProvider>
      ) : (
        <Routes>
          <Route path="*" element={<Navigate to="/login" />} />
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      )}
    </>
  );
};

export default Router;
