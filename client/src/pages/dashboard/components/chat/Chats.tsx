import { useState, useEffect } from "react";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../utils/api/constants";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  Chat,
  addChats,
  addMessage,
  pushToTop,
  setChats,
  setLastMessage,
  setSelectedChat,
  setUserHasSeen,
  triggerChatReload,
} from "../../../../store/features/availableChatsSlice";
import { User } from "../../../../store/features/currentUserSlice";
import ChatCard from "./individual/ChatCard";

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
      console.log(data);
      if (
        data.type === "chat" &&
        data.users.find((val: User) => val.id === current_user?.id)
      )
        dispatch(triggerChatReload());
      else if (data.type == "message") {
        dispatch(addMessage(data));
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

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : available_chats ? (
        <article className="flex flex-col justify-stretch">
          {available_chats.map((item: Chat, index: number) => (
            <ChatCard item={item} key={index} />
          ))}
        </article>
      ) : (
        <div>No chats yet</div>
      )}
    </>
  );
};

export default Chats;
