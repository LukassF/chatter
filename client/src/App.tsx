import Login from "./login/Login";
import Signup from "./signup/Signup";
import { useLayoutEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store/store";
import { setCurrentUser } from "./store/features/currentUserSlice";
import { decodeToken } from "./utils/decodeToken";
import MessageLog from "./chatbox/MessageLog";
import MessageInput from "./chatbox/MessageInput";
import Chats from "./chats/Chats";
import CreateChat from "./chats/CreateChat";

function App() {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);

  useLayoutEffect(() => {
    const user = decodeToken(access_token);
    dispatch(setCurrentUser(user));
  }, []);

  return (
    <>
      <Signup />
      <hr></hr>
      <Login />

      <div>{current_user?.username}</div>

      {/* <MessageLog />
      <MessageInput /> */}
      {current_user && <CreateChat />}
      {current_user && <Chats />}
    </>
  );
}

export default App;
