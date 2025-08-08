import React from "react";
import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaUsers } from "react-icons/fa";
import { BsGearFill, BsCollectionFill } from "react-icons/bs";
import { AiFillFire, AiOutlineLogout } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { logout } from "../redux/auth/authActions";

const Layout = () => {
  const dispatch = useDispatch();
  const currentPath = useLocation().pathname;
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const navItems = [
    { to: "/dashboard", icon: <FaHome />, label: "Dashboard" },
    { to: "/users", icon: <FaUser />, label: "Users" },
    { to: "/groups", icon: <FaUsers />, label: "Groups" },
    { to: "/roles", icon: <BsGearFill />, label: "Roles" },
    { to: "/modules", icon: <BsCollectionFill />, label: "Modules" },
    { to: "/permissions", icon: <AiFillFire />, label: "Permissions" },
  ];

  return (
    <div className="flex h-screen">
      <div className={`bg-violet-600 h-full p-5 w-64`}>
        <div className="flex justify-between overflow-hidden">
          <h1 className="text-2xl font-semibold">Access Control System</h1>
        </div>
        <ul className="mt-5">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`block flex items-center gap-2 py-2 px-4 hover:bg-purple-900 rounded ${currentPath.includes(item.to) ? "bg-purple-900 text-white" : ""}`}
              >
                {item.icon} {item.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              className="block flex items-center gap-2 mt-1 py-2 px-4 hover:bg-purple-900 rounded w-full cursor-pointer text-left bg-red-400 text-white"
              onClick={() => {
                dispatch(logout());
              }}
            >
              <AiOutlineLogout />
              Logout
            </button>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-10 bg-white text-black overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
