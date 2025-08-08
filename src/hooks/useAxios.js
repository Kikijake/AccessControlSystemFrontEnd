import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/auth/authActions";
import { API_URL } from "../networks/domain";

const useAxios = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch()
  const instance = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth.token}`,
    },
  });

  instance.interceptors.request.use(
    (request) => {
      return request;
    },
    (error) => {
      if (error.response.status === 401) {
        dispatch(logout());
      }
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;