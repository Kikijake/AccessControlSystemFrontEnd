import React from "react";

export const Modules = React.lazy(() => import("../pages/modules/Modules.jsx"));
export const ModuleEdit = React.lazy(() => import("../pages/modules/ModuleEdit.jsx"));
export const ModuleCreate = React.lazy(() => import("../pages/modules/ModuleCreate.jsx"));