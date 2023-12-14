import { useEffect, useLayoutEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";
import {
  setLastSeenMessage,
  setMessages,
  setSelectedChat,
  toggleSettings,
} from "../store/features/availableChatsSlice";

const MessageLog = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.available_chats.messages);
  const [msg_res, setMsgRes] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setMsgRes, setError, setLoading);

  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const available_chats = useAppSelector(
    (state) => state.available_chats.chats
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  useLayoutEffect(() => {
    if (access_token)
      fetchData({
        url: BACKEND_URL + "api/messages/getall?chat_id=" + selected_chat?.id,
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [selected_chat, access_token]);

  useEffect(() => {
    if (msg_res && !error) dispatch(setMessages(msg_res.data));
    if (error) dispatch(setMessages([]));
  }, [msg_res]);

  useEffect(() => {
    if (!available_chats.find((item) => item.id == selected_chat?.id))
      dispatch(setSelectedChat(undefined));
  }, [available_chats, selected_chat]);

  useEffect(() => {
    if (messages && messages.length > 0)
      dispatch(setLastSeenMessage(messages[messages.length - 1]?.id));
  }, [messages]);

  return (
    <div
      style={{
        background: "lightgrey",
        width: "200px",
        height: "300px",
        overflow: "auto",
      }}
    >
      <span style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0 }}>{selected_chat?.name}</h4>
        <span
          style={{ cursor: "pointer" }}
          onClick={() => dispatch(toggleSettings(true))}
        >
          settings
        </span>
      </span>
      <hr></hr>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {messages && messages.length > 0 ? (
          messages.map((item, index) => (
            <div
              key={index}
              style={{
                alignSelf: item.user_id
                  ? current_user?.id === item.user_id
                    ? "flex-end"
                    : "flex-start"
                  : "center",
                fontSize: !item.user_id ? "10px" : "15px",
              }}
            >
              {item.content}
            </div>
          ))
        ) : (
          <p>No messages yet</p>
        )}
      </div>
    </div>
  );
};

export default MessageLog;
