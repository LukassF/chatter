import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";

const Signup: FC = () => {
  const [form, setForm] = useState<SignupData>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  const signUp = useCallback((e: FormEvent) => {
    e.preventDefault();
    const username = (e.target as any).username.value;
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    if (!username || !email || !password) {
      console.log("Fill in all fileds");
      return;
    }

    setForm({ username, email, password });
  }, []);

  useEffect(() => {
    if (form)
      fetchData({
        url: BACKEND_URL + "auth/signup",
        method: "POST",
        data: form,
        headers: {
          "Content-Type": "application/json",
        },
      });
  }, [form]);

  return (
    <>
      <h3>Sign up below</h3>
      <form onSubmit={signUp}>
        <input type="text" placeholder="Username" name="username" />
        <input type="email" placeholder="Email" name="email" />
        <input type="password" placeholder="Password" name="password" />
        <button>Sign Up</button>
      </form>
    </>
  );
};

export default Signup;
