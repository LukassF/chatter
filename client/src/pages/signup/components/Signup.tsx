import { FC, FormEvent, useCallback, useEffect, useState } from "react";
import { fetchApi } from "../../../utils/api/fetchApi";
import { BACKEND_URL } from "../../../utils/api/constants";
import { SignupData } from "../../../utils/types";
import { useAppDispatch } from "../../../store/store";
import {
  setAccessToken,
  setRefreshToken,
} from "../../../store/features/tokensSlice";
import { decodeToken } from "../../../utils/decodeToken";
import { fetchUser } from "../../../store/features/currentUserSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Signup: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string | null>();
  const [password, setPassword] = useState<string | null>();

  const [form, setForm] = useState<SignupData>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);
  const [usernameError, setUsernameError] = useState<string | null>();
  const [emailError, setEmailError] = useState<string | null>();
  const [passwordError, setPasswordError] = useState<string | null>();

  const signUp = useCallback((e: FormEvent) => {
    e.preventDefault();
    const username = (e.target as any).username.value;
    const email = (e.target as any).email.value;
    const password = (e.target as any).password.value;

    if (!username) setUsernameError("Fill in all fields!");
    if (!email) setEmailError("Fill in all fields!");
    if (!password) setPasswordError("Fill in all fields!");

    if (password.length < 6)
      setPasswordError("Password has to be at least 6 characters long");

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
      setEmailError("Invalid email!");

    if (
      !username ||
      !email ||
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) ||
      password.length < 6
    )
      return;

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

  useEffect(() => {
    if (error) {
      const err = error.response.data;

      if (err.type == "password") setPasswordError(err.error);
      if (err.type == "username") setUsernameError(err.error);
      if (err.type == "email") setEmailError(err.error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      switch (success.data.operation) {
        case "signup":
          toast.success("Signed up successfully!");
          fetchData({
            url: BACKEND_URL + "auth/login",
            method: "POST",
            data: { username: email, password },
            headers: {
              "Content-Type": "application/json",
            },
          });
          break;

        case "login":
          dispatch(setAccessToken(success.data.access_token));
          dispatch(setRefreshToken(success.data.refresh_token));

          const user = decodeToken(success.data.access_token);
          if (user) dispatch(fetchUser(user));
          toast.success("Logged in successfully!");
          navigate("/");
      }
    }
  }, [success]);

  return (
    <section className="flex flex-col justify-center items-stretch w-full xs:w-[80%] ">
      <h3 className="text-center text-3xl font-bold mb-2">Sign up below</h3>
      <h6 className="mb-5 text-md font-light text-center">
        Join our amazing community!
      </h6>
      <form
        onSubmit={signUp}
        className="flex flex-col gap-3"
        autoComplete="off"
      >
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            name="username"
            className={`form-control ${usernameError && "is-invalid"}`}
            onChange={() => setUsernameError(null)}
          />
          {usernameError && (
            <div className="invalid-feedback">{usernameError}</div>
          )}
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Email"
            name="email"
            className={`form-control ${emailError && "is-invalid"}`}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError(null);
            }}
          />
          {emailError && <div className="invalid-feedback">{emailError}</div>}
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            className={`form-control ${passwordError && "is-invalid"}`}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
            }}
          />
          {passwordError && (
            <div className="invalid-feedback">{passwordError}</div>
          )}
        </div>

        <button className="btn btn-primary">Sign Up</button>
        <span className="text-[12px] xs:text-sm text-gray-500">
          Or{" "}
          <Link to="/login">
            <em className="font-bold underline cursor-pointer hover:text-gray-700">
              Log in
            </em>
          </Link>{" "}
          if you already have an account!
        </span>
      </form>
    </section>
  );
};

export default Signup;
