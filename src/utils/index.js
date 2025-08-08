export const getPermissionBadgeColor = (action) => {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800";
    case "read":
      return "bg-blue-100 text-blue-800";
    case "update":
      return "bg-yellow-100 text-yellow-800";
    case "delete":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
