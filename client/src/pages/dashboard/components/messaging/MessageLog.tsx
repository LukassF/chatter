import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../utils/api/constants";
import {
  addManyMessages,
  setLastSeenMessage,
  setMessages,
  setSelectedChat,
} from "../../../../store/features/availableChatsSlice";
import IndividualMessage from "./Message";
import MessagesSkeleton from "../chat/loaders/MessagesSkeleton";
import { RotatingLines } from "react-loader-spinner";

const MessageLog = () => {
  //helper to reload last selected chat
  const [lastSelected, setLastSelected] = useState<number>(0);

  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.available_chats.messages);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );

  //helper to prevent from refetching data when selecting the same chat
  const init_selected_chat = useMemo(() => selected_chat?.id, [lastSelected]);
  const available_chats = useAppSelector(
    (state) => state.available_chats.chats
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [msg_res, setMsgRes] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = fetchApi(setMsgRes, setError, setLoading);
  const [range, setRange] = useState<number[]>([0, 19]);
  const [scrollPos, setScrollPos] = useState<number>(0);

  const sentinel = useRef<HTMLDivElement>(null);
  const scrollCont = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  let options = {
    root: scrollCont.current,
    margin: "10px",
  };

  //callback to handle intersection observer intersection event
  const handleIntersection = ([entry]: IntersectionObserverEntry[]) => {
    if (entry.isIntersecting && !loading && msg_res.data.length > 0) {
      console.log("hey");
      setRange((prev) => [prev[0] + 20, prev[1] + 20]);
    }
  };

  //setting up intersection observer
  useLayoutEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, options);
    if (sentinel.current) observer.observe(sentinel.current as Element);

    return () => observer.unobserve(sentinel.current as Element);
  }, [sentinel, options]);

  //saving scroll position
  const recordScrollPos = () => {
    const node = scrollCont.current;
    if (node) setScrollPos(node.scrollHeight - node.scrollTop);
  };

  //restoring saved scroll position
  const restoreScrollPos = () => {
    if (scrollCont.current)
      scrollCont.current.scrollTop =
        scrollCont.current.scrollHeight - scrollPos;
  };

  //fetching data on payload change
  useEffect(() => {
    recordScrollPos();
    if (access_token && !loading && range && selected_chat)
      fetchData({
        url:
          BACKEND_URL +
          `api/messages/getall?chat_id=${selected_chat.id}&start=${range[0]}&end=${range[1]}`,
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [range, access_token]);

  //dispatching a redux store action to set messages based on the incoming payload
  useEffect(() => {
    if (msg_res && !error) {
      dispatch(addManyMessages(msg_res.data));
    }
    if (error) dispatch(setMessages([]));
  }, [msg_res]);

  //closing a chat if it is no longer available
  useEffect(() => {
    if (!selected_chat?.users?.find((item) => item.id == current_user?.id))
      dispatch(setSelectedChat(undefined));
  }, [available_chats, selected_chat]);

  //reseting all options on chat change
  useEffect(() => {
    if (selected_chat?.id == init_selected_chat) return;
    dispatch(setMessages([]));
    setRange([0, 19]);
    setScrollPos(0);
    setLastSelected((prev) => prev + 1);
  }, [selected_chat]);

  //restoring scroll position and setting last message on messages change
  useEffect(() => {
    // console.log(messages![messages?.length! - 1]);
    if (messages && messages.length > 0)
      dispatch(setLastSeenMessage(messages[messages.length - 1]?.id));
    restoreScrollPos();
  }, [messages]);

  //scrolling to the end of the messages when new message is received
  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onmessage = (msg) => {
      const message = typeof msg.data == "string" && JSON.parse(msg.data);

      if (message && message.type == "message")
        messageEndRef.current?.scrollIntoView();
    };

    return () => ws.close();
  }, []);

  useEffect(() => console.log(selected_chat), [selected_chat]);

  return (
    <div
      ref={scrollCont}
      // -----------
      className="h-full w-full overflow-auto"
    >
      <div className="flex flex-col gap-1">
        <div ref={sentinel}></div>
        {loading && (!messages || messages?.length === 0) && (
          <MessagesSkeleton />
        )}
        {loading && messages?.length! > 0 && (
          <div className="w-full flex justify-center mt-3">
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="26"
              visible={true}
            />
          </div>
        )}
        {messages && messages.length > 0 ? (
          messages.map((item, index) => (
            <IndividualMessage
              item={item}
              prev={messages[index - 1] ? messages[index - 1] : null}
              next={messages[index + 1] ? messages[index + 1] : null}
              chat_users={selected_chat?.users!}
              key={index}
            />
          ))
        ) : error ? (
          <div>Timeout error occured, please try again</div>
        ) : (
          !loading && <p>No messages yet</p>
        )}
      </div>
      <div ref={messageEndRef}></div>
    </div>
  );
};

export default MessageLog;
