import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/auth/authActions";

const Login = () => {
  const dispatch = useDispatch();
  const [payload, setPayload] = useState({
    username: "",
    password: "",
  });
  const [isError, setIsErrors] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(payload.username, payload.password))
      .then((response) => {
        console.log("response", response);
      })
      .catch(({ response: { data } }) => {
        console.log(data);
        setIsErrors(true);
      });
    console.log(payload);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIsErrors(false);
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <>
      <div className="bg-gray-100 flex justify-center items-center h-screen">
        <div className="w-1/2 h-screen hidden lg:block">
          <img
            src="https://placehold.co/800x/7a00e6/ffffff.png?text=Access+Control+System&font=Montserrat"
            alt="Placeholder Image"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
          <h1 className="text-2xl font-semibold mb-4">Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              {isError && (
                <div className="alert bg-red-400 border-none mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0 stroke-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span className="text-white">
                    Invalid username or password
                  </span>
                </div>
              )}
              <label htmlFor="username" className="block text-gray-600">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 text-black"
                autoComplete="off"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-600">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500 text-black"
                autoComplete="off"
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md mt-4 py-2 px-4 w-full"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
