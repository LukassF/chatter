import { FC, useCallback, FormEvent, useState, useEffect } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";

const Login: FC = () => {
  const [form, setForm] = useState<LoginData>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading, {
    url: BACKEND_URL + "auth/login",
    method: "POST",
    data: form,
    headers: {
      "Content-Type": "application/json",
    },
  });

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
    if (form) fetchData();
  }, [form]);

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
