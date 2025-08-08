// src/redux/auth/authActions.js
import axios from "axios";
import API from "../../networks/API";
import { loginSuccess, loginFail, logout as logoutAction } from "./authSlice";
import { API_URL } from "../../networks/domain";

export const login = (username, password) => async (dispatch) => {
  try {
    const res = await axios.post(
      `${API_URL}/api${API.login}`,
      { username, password},
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    localStorage.setItem("user", JSON.stringify(res.data.data));

    dispatch(
      loginSuccess({
        username: res.data.data.name,
        token: res.data.data.token,
      })
    );

    return Promise.resolve(res);
  } catch (err) {
    dispatch(loginFail());
    return Promise.reject(err);
  }
};

export const logout = () => async (dispatch) => {
  // const user = JSON.parse(localStorage.getItem("user"));
  // const headers = {
  //   "Content-Type": "application/json",
  //   "device-Type": "web",
  //   Authorization: `Bearer ${user.token}`,
  // };

  localStorage.removeItem("user");
  dispatch(logoutAction());

  // await axios.post(`${API_URL}/api${API.logout}`, {}, { headers });
};
