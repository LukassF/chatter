import Login from "./login/Login";
import Signup from "./signup/Signup";
import { useLayoutEffect } from "react";
import { useAppDispatch, useAppSelector } from "./store/store";
import { fetchImage, setCurrentUser } from "./store/features/currentUserSlice";
import { decodeToken } from "./utils/decodeToken";
import MessageLog from "./chatbox/MessageLog";
import MessageInput from "./chatbox/MessageInput";
import Chats from "./chats/Chats";
import CreateChat from "./chats/CreateChat";
import ModifyProfile from "./profile/ModifyProfile";
import ChatSettings from "./chatbox/settings/ChatSettings";

function App() {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );

  useLayoutEffect(() => {
    const user = decodeToken(access_token);
    if (user) dispatch(fetchImage(user));
  }, []);

  return (
    <>
      <Signup />
      <hr></hr>
      <Login />

      <hr></hr>
      <ModifyProfile />
      <hr></hr>
      {current_user?.id && (
        <div>
          {current_user?.username}
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              src={
                current_user.image
                  ? current_user.image
                  : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
              }
              alt=""
            />
          </div>
        </div>
      )}
      <hr></hr>
      {current_user && <CreateChat />}
      {current_user && <Chats />}

      {selected_chat && (
        <div style={{ display: "flex" }}>
          <div>
            <MessageLog />
            <MessageInput />
          </div>
          {settings_open && <ChatSettings />}
        </div>
      )}
    </>
  );
}

export default App;
