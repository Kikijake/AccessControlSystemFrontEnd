import React from "react";

export const Users = React.lazy(() => import("../pages/users/Users.jsx"));
export const UserCreate = React.lazy(() => import("../pages/users/UserCreate.jsx"));
export const UserEdit = React.lazy(() => import("../pages/users/UserEdit.jsx"));