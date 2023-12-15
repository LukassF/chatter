import { FC, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import ModifyProfile from "../profile/components/modify/ModifyProfile";
import CreateChat from "./components/chat/create/CreateChat";
import Chats from "./components/chat/Chats";
import MessageLog from "./components/messaging/MessageLog";
import ChatSettings from "./components/chat/settings/ChatSettings";
import MessageInput from "./components/messaging/MessageInput";
import { BACKEND_URL, WEBSOCKET_URL } from "../../utils/api/constants";
import { fetchImage } from "../../store/features/currentUserSlice";
import { decodeToken } from "../../utils/decodeToken";
import { fetchApi } from "../../utils/api/fetchApi";
import { deleteTokens } from "../../store/features/tokensSlice";

const Dashboard: FC = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const refresh_token = useAppSelector((state) => state.tokens.refresh_token);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );
  const messages = useAppSelector((state) => state.available_chats.messages);

  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  useLayoutEffect(() => {
    const user = decodeToken(access_token);
    if (user) dispatch(fetchImage(user));
  }, []);

  useEffect(() => {
    if (
      access_token &&
      current_user &&
      current_user.id &&
      selected_chat &&
      selected_chat.id &&
      messages &&
      messages.length > 0
    )
      fetchData({
        url: BACKEND_URL + "api/chats/toggleseen/" + current_user.id,
        method: "PATCH",
        data: { chat_id: selected_chat.id },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [selected_chat, access_token, current_user, messages]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            users: selected_chat?.users,
            user_id: current_user?.id,
            chat_id: selected_chat?.id,
            last_msg_id: messages ? messages[messages?.length - 1].id : null,
            type: "hasseen",
          })
        );
      };
    }

    return () => ws.close();
  }, [success]);

  const logout = useCallback(() => {
    fetchData({
      url: BACKEND_URL + "auth/logout",
      method: "POST",
      data: {
        refresh_token,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch(deleteTokens());
    window.location.reload();
  }, []);

  return (
    <>
      <button onClick={logout}>Logout</button>
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
};

export default Dashboard;
