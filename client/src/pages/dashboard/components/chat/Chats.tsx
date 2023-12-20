import { useState, useEffect, useDeferredValue } from "react";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../utils/api/constants";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  addChats,
  addMessage,
  pushToTop,
  setChats,
  setLastMessage,
  setSelectedChat,
  setUserHasSeen,
  toggleSettings,
  triggerChatReload,
} from "../../../../store/features/availableChatsSlice";
import { User } from "../../../../store/features/currentUserSlice";
import ChatCard from "./individual/ChatCard";
import AvailableChatsSkeleton from "./loaders/AvailableChatsSkeleton";
import { Chat } from "../../../../utils/types";

const Chats = ({ search }: { search: string | null }) => {
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
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = fetchApi(setData, setError, setLoading);

  const deferredInput = useDeferredValue(search);

  useEffect(() => {
    if (access_token && !loading)
      fetchData({
        url: BACKEND_URL + "api/chats/getchats?search=" + deferredInput,
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [access_token, trigger_chat_reload, deferredInput]);

  useEffect(() => {
    if (data && !error) {
      dispatch(setChats(data.data));
    }
    if (error) {
      dispatch(setChats([]));
      dispatch(setSelectedChat(undefined));
    }
  }, [data, error]);

  useEffect(() => {
    dispatch(
      setSelectedChat(
        available_chats.find((val) => val.id === selected_chat?.id)
      )
    );
  }, [available_chats]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);
    ws.onmessage = (msg) => {
      const message = typeof msg.data == "string" && JSON.parse(msg.data);
      if (
        message.type === "chat" &&
        message.users.find((val: User) => val.id === current_user?.id)
      )
        dispatch(triggerChatReload());
      else if (message.type == "message") {
        dispatch(addMessage(message));

        dispatch(
          setLastMessage({
            chat_id: message.chat_id,
            user_id: message.user_id,
            content: message.content,
            id: message.id,
            created_at: message.created_at,
          })
        );
        dispatch(pushToTop(message.chat_id));
      } else if (message.type == "hasseen") {
        dispatch(
          setUserHasSeen({
            user_id: message.user_id,
            chat_id: message.chat_id,
            last_msg_id: message.last_msg_id,
          })
        );
      }
    };

    return () => ws.close();
  }, [selected_chat, current_user]);

  return (
    <>
      {(loading && (!available_chats || available_chats.length === 0)) ||
      (search!.length > 0 && loading) ? (
        <AvailableChatsSkeleton />
      ) : available_chats && available_chats.length > 0 ? (
        <article className="flex flex-col justify-stretch overflow-auto">
          {available_chats.map((item: Chat, index: number) => (
            <ChatCard item={item} key={index} />
          ))}
        </article>
      ) : (
        <h3 className="m-3 text-md font-medium text-muted">
          No chats found...
        </h3>
      )}
    </>
  );
};

export default Chats;
