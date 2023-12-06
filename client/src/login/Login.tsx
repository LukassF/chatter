import { FC, useCallback, FormEvent, useState, useEffect } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";
import { LoginData } from "../utils/types";
import { useAppDispatch } from "../store/store";
import { setCurrentUser } from "../store/features/currentUserSlice";
import { decodeToken } from "../utils/decodeToken";

const Login: FC = () => {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<LoginData>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  const logIn = useCallback((event: FormEvent) => {
    event.preventDefault();
    const username = (event.target as any).username.value;
    const password = (event.target as any).password.value;

    if (!password || !username) {
      console.log("Fill in all fileds");
      return;
    }

    setForm({ username, password });
  }, []);

  const logout = useCallback(() => {
    fetchData({
      url: BACKEND_URL + "auth/logout",
      method: "POST",
      data: {
        refresh_token: JSON.parse(
          window.localStorage.getItem("refresh_token")!
        ),
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    window.localStorage.removeItem("refresh_token");
    window.localStorage.removeItem("access_token");
  }, []);

  useEffect(() => {
    if (form)
      fetchData({
        url: BACKEND_URL + "auth/login",
        method: "POST",
        data: form,
        headers: {
          "Content-Type": "application/json",
        },
      });
  }, [form]);

  useEffect(() => {
    if (data) {
      const access_token = data.data.access_token;
      const user = decodeToken(access_token);
      dispatch(setCurrentUser(user));

      window.localStorage.setItem("access_token", JSON.stringify(access_token));
      window.localStorage.setItem(
        "refresh_token",
        JSON.stringify(data.data.refresh_token)
      );
    }
  }, [data]);

  return (
    <>
      <h3>Log in below</h3>
      <form onSubmit={logIn}>
        <input type="text" placeholder="Username" name="username" />
        <input type="password" placeholder="Password" name="password" />
        <button>Login</button>
      </form>

      <button onClick={logout}>Logout</button>
    </>
  );
};

export default Login;
