import { createSlice } from "@reduxjs/toolkit";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = user?.token
  ? {
      username: user.username,
      token: user.token,
    }
  : {
      username: null,
      token: null,
    };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.username = action.payload.username;
      state.token = action.payload.token;
    },
    loginFail: (state) => {
      state.username = null;
      state.token = null;
    },
    logout: (state) => {
      state.username = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, loginFail, logout } = authSlice.actions;
export default authSlice.reducer;
