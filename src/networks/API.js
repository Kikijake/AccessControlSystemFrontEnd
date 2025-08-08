import auth from "./auth";
import groups from "./groups";
import modules from "./modules";
import permissions from "./permissions";
import roles from "./roles";
import users from "./users";

const API = {
  ...auth,
  ...permissions,
  ...users,
  ...groups,
  ...roles,
  ...modules
};

export default API;
