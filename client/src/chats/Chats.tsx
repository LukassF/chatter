import { useState, useEffect } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../utils/api/constants";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  Chat,
  addChats,
  addMessages,
  pushToTop,
  setChats,
  setLastMessage,
  setSelectedChat,
  setUserHasSeen,
  triggerChatReload,
} from "../store/features/availableChatsSlice";
import { User } from "../store/features/currentUserSlice";

const Chats = () => {
  const dispatch = useAppDispatch();
  const available_chats = useAppSelector(
    (state) => state.available_chats.chats
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const trigger_chat_reload = useAppSelector(
    (state) => state.available_chats.trigger_chat_reload
  );
  const current_user = useAppSelector((state) => state.current_user.user);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  useEffect(() => {
    if (access_token)
      fetchData({
        url: BACKEND_URL + "api/chats/getchats",
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [access_token, trigger_chat_reload]);

  useEffect(() => {
    if (data && !error) dispatch(setChats(data.data));
    if (error) {
      dispatch(setChats([]));
      dispatch(setSelectedChat(undefined));
    }
  }, [data, error]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    ws.onmessage = (msg) => {
      const data = typeof msg.data == "string" && JSON.parse(msg.data);

      if (
        data.type === "chat" &&
        data.users.find((val: User) => val.id === current_user?.id)
      )
        dispatch(triggerChatReload());
      else if (data.type == "message") {
        dispatch(addMessages(data));
        //TO IMPLEMENT no chat reload but push to top and so on last message bla bla
        // dispatch(
        //   setLastMessage({
        //     chat_id: data.chat_id,
        //     user_id: data.user_id,
        //     content: data.content,
        //     id: data.id,
        //     created_at: data.created_at,
        //   })
        // );
        // dispatch(pushToTop(data.chat_id));
        dispatch(triggerChatReload());
      } else if (data.type == "hasseen") {
        dispatch(triggerChatReload());
        // dispatch(
        //   setUserHasSeen({
        //     user_id: data.user_id,
        //     chat_id: data.chat_id,
        //     last_msg_id: data.last_msg_id,
        //   })
        // );
      }
    };

    return () => ws.close();
  }, [selected_chat, current_user]);

  const determineUser = (user_id: number, users: any[] | undefined) => {
    if (!users || !user_id) return;
    const index = users.findIndex((item) => item.id == user_id);
    return users[index];
  };

  return (
    <>
      <h2>Available chats</h2>
      {available_chats ? (
        available_chats.map((item: Chat, index: number) => (
          <div
            key={index}
            onClick={() => dispatch(setSelectedChat(item))}
            style={{
              display: "flex",
              background:
                determineUser(current_user?.id!, item.users)?.has_seen !==
                item.last_message_id
                  ? "grey"
                  : "transparent",
            }}
          >
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
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                src={
                  item.image
                    ? item.image
                    : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                }
                alt=""
              />
            </div>
            <div>
              <h4 style={{ margin: 0 }}>{item.name}</h4>
              {item.message && (
                <div>
                  {determineUser(item.message_user_id, item.users)?.username}:
                  {item.message}
                </div>
              )}
            </div>

            {/* <ul style={{ listStyle: "none", padding: "0px" }}>
              {item.users?.map((user, id: number) => (
                <li
                  style={{ fontSize: "15px", color: "grey" }}
                  key={index + id}
                >
                  {user.username}
                </li>
              ))}
            </ul> */}
          </div>
        ))
      ) : (
        <div>No chats yet</div>
      )}
    </>
  );
};

export default Chats;
