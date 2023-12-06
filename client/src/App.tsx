import Login from "./login/Login";
import Signup from "./signup/Signup";
import { BACKEND_URL } from "./utils/api/constants";
import { useState, useLayoutEffect } from "react";
import { fetchApi } from "./utils/api/fetchApi";
import { useAppDispatch, useAppSelector } from "./store/store";
import { addPerson, fetchContent } from "./store/features/personSlice";
import { setCurrentUser } from "./store/features/currentUserSlice";
import { decodeToken } from "./utils/decodeToken";
import MessageLog from "./chatbox/MessageLog";
import MessageInput from "./chatbox/MessageInput";

function App() {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  useLayoutEffect(() => {
    const token_str = window.localStorage.getItem("access_token");
    const token = token_str ? JSON.parse(token_str) : null;

    if (token) {
      const user = decodeToken(token);
      dispatch(setCurrentUser(user));
    }
  }, []);

  return (
    <>
      <Signup />
      <hr></hr>
      <Login />

      <button
        onClick={() =>
          fetchData({
            url: BACKEND_URL + "api/users",
            method: "GET",
            headers: {
              Authorization:
                "Bearer " +
                JSON.parse(window.localStorage.getItem("access_token")!),
            },
          })
        }
      >
        Fetch data
      </button>

      <button onClick={() => dispatch(addPerson({ name: "josh" }))}>
        Add person
      </button>

      <button onClick={() => dispatch(fetchContent())}>async thunk</button>

      <div>{current_user.username}</div>

      <MessageLog />
      <MessageInput />
    </>
  );
}

export default App;
