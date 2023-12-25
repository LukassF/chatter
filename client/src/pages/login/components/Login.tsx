import {
  FC,
  useCallback,
  FormEvent,
  useState,
  useEffect,
  ChangeEvent,
  useMemo,
} from "react";
import { fetchApi } from "../../../utils/api/fetchApi";
import { BACKEND_URL } from "../../../utils/api/constants";
import { LoginData } from "../../../utils/types";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { fetchUser } from "../../../store/features/currentUserSlice";
import { decodeToken } from "../../../utils/decodeToken";
import {
  setAccessToken,
  setRefreshToken,
} from "../../../store/features/tokensSlice";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";

const Login: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const access_token = useAppSelector((state) => state.tokens.access_token);

  const init_user = useMemo((): {
    username: string;
    password: string;
  } | null => {
    const saved = window.localStorage.getItem("remembered_user");

    if (!saved) return null;

    return JSON.parse(saved);
  }, [window.localStorage]);

  const [type, setType] = useState<boolean>(false);
  const [form, setForm] = useState<LoginData>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = fetchApi(setData, setError, setLoading);
  const [usernameError, setUsernameError] = useState<string | null>();
  const [passwordError, setPasswordError] = useState<string | null>();
  const [remember, setRemember] = useState<boolean>(
    !!window.localStorage.getItem("remembered_user")
  );

  const logIn = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const username = (event.target as any).username.value;
      const password = (event.target as any).password.value;

      if (!username) setUsernameError("Fields cannot be empty!");
      if (!password) setPasswordError("Fields cannot be empty!");
      if (!username || !password) return;

      if (remember) saveUser(username, password);
      else removeUser();

      setForm({ username, password });
    },
    [remember]
  );

  const saveUser = useCallback((username: string, password: string) => {
    window.localStorage.setItem(
      "remembered_user",
      JSON.stringify({ username, password })
    );
  }, []);

  const removeUser = useCallback(() => {
    const saved = window.localStorage.getItem("remembered_user");

    if (saved) window.localStorage.removeItem("remembered_user");
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
      if (user) dispatch(fetchUser(user));

      toast.success("Logged in successfully!");

      navigate("/");
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      const err = error.response.data;

      if (err.type == "password") setPasswordError(err.error);
      if (err.type == "username") setUsernameError(err.error);
    }
  }, [error]);

  // useEffect(() => {
  //   console.log(usernameError, passwordError);
  // }, [usernameError, passwordError]);

  return (
    <section className="flex flex-col justify-center items-stretch w-full xs:w-[85%]">
      <h3 className="text-center text-3xl font-bold mb-2">Log in below</h3>
      <h6 className="mb-5 text-md font-light text-center">
        Get back to chatting now!
      </h6>
      <form onSubmit={logIn} className="flex flex-col gap-1" autoComplete="off">
        <div className="form-group p-2">
          <input
            defaultValue={init_user ? init_user.username : ""}
            type="text"
            placeholder="Username or email"
            name="username"
            className={`form-control ${usernameError && "is-invalid"}`}
            onChange={() => setUsernameError(null)}
          />
          {usernameError && (
            <div className="invalid-feedback">{usernameError}</div>
          )}
        </div>

        <div className="form-group relative p-1">
          {/* <div className="relative"> */}
          <input
            defaultValue={init_user ? init_user.password : ""}
            type={type ? "text" : "password"}
            placeholder="Password"
            name="password"
            className={`form-control ${passwordError && "is-invalid"}`}
            onChange={() => setPasswordError(null)}
          />
          {!passwordError && (
            <button
              type="button"
              onClick={() => setType((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px] rounded-full  aspect-square hover:bg-stone-100 flex justify-center items-center"
            >
              <i className="fa fa-eye  text-muted"></i>
            </button>
          )}
          {/* </div> */}
          {passwordError && (
            <div className="invalid-feedback">{passwordError}</div>
          )}
        </div>

        <div className="form-group p-1 flex justify-start items-center gap-2">
          {/* <div className="form-check"> */}
          <label htmlFor="rememberMe" className="text-sm text-stone-700">
            Remember me
          </label>
          <input
            defaultChecked={remember}
            className="form-check-input cursor-pointer"
            type="checkbox"
            id="rememberMe"
            name="remember"
            onChange={(e) => setRemember(e.target.checked)}
          />
          {/* </div> */}
        </div>

        <button className="btn btn-primary m-1 min-h-[39px]">
          {loading ? (
            <div className="flex justify-center items-center">
              <RotatingLines
                strokeColor="white"
                strokeWidth="5"
                animationDuration="0.75"
                width="20"
                visible={true}
              />
            </div>
          ) : (
            "Log in"
          )}
        </button>
        <span className="text-[12px] xs:text-sm text-gray-500 m-1">
          Or{" "}
          <Link to="/signup">
            <em className="font-bold underline cursor-pointer hover:text-gray-700">
              Sign up
            </em>
          </Link>{" "}
          if you don't have an account!
        </span>
      </form>
    </section>
  );
};

export default Login;
