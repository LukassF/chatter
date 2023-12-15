import { FC, useCallback, FormEvent, useState, useEffect } from "react";
import { fetchApi } from "../../../utils/api/fetchApi";
import { BACKEND_URL } from "../../../utils/api/constants";
import { LoginData } from "../../../utils/types";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import {
  fetchImage,
  setCurrentUser,
} from "../../../store/features/currentUserSlice";
import { decodeToken } from "../../../utils/decodeToken";
import {
  deleteTokens,
  setAccessToken,
  setRefreshToken,
} from "../../../store/features/tokensSlice";
import { useNavigate } from "react-router-dom";

const Login: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const access_token = useAppSelector((state) => state.tokens.access_token);

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
      dispatch(setAccessToken(data.data.access_token));
      dispatch(setRefreshToken(data.data.refresh_token));

      const user = decodeToken(data.data.access_token);
      if (user) dispatch(fetchImage(user));

      navigate("/");
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
    </>
  );
};

export default Login;