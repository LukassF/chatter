import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import useApi from "../hooks/useApi";

const Signup: FC = () => {
  const [form, setForm] = useState<SignupData>();
  const [data, error, loading, fetchData] = useApi(
    {
      url: "http://localhost:5000/api/auth/signup",
      method: "POST",
      data: form,
      headers: {
        "Content-Type": "application/json",
      },
    },
    false
  );

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
    if (form) fetchData();
  }, [form]);

  return (
    <>
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
