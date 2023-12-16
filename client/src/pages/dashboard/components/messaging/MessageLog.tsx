import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { BACKEND_URL } from "../../../../utils/api/constants";
import {
  addManyMessages,
  setLastSeenMessage,
  setMessages,
  setSelectedChat,
  toggleSettings,
} from "../../../../store/features/availableChatsSlice";

const MessageLog = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.available_chats.messages);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const available_chats = useAppSelector(
    (state) => state.available_chats.chats
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [msg_res, setMsgRes] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setMsgRes, setError, setLoading);
  const [range, setRange] = useState<number[]>([0, 19]);
  const [scrollPos, setScrollPos] = useState<number>(0);

  const sentinel = useRef<HTMLDivElement>(null);
  const scrollCont = useRef<HTMLDivElement>(null);

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
    if (access_token)
      fetchData({
        url:
          BACKEND_URL +
          `api/messages/getall?chat_id=${selected_chat?.id}&start=${range[0]}&end=${range[1]}`,
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
    if (!available_chats.find((item) => item.id == selected_chat?.id))
      dispatch(setSelectedChat(undefined));
  }, [available_chats, selected_chat]);

  //reseting all options on chat change
  useEffect(() => {
    dispatch(setMessages([]));
    setRange([0, 19]);
    setScrollPos(0);
  }, [selected_chat]);

  //restoring scroll position and setting last message on messages change
  useEffect(() => {
    if (messages && messages.length > 0)
      dispatch(setLastSeenMessage(messages[messages.length - 1]?.id));
    restoreScrollPos();
  }, [messages]);

  return (
    <>
      <span style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0 }}>{selected_chat?.name}</h4>
        <span
          style={{ cursor: "pointer" }}
          onClick={() => dispatch(toggleSettings(true))}
        >
          settings
        </span>
        <button
          onClick={() => setRange((prev) => [prev[0] + 20, prev[1] + 20])}
        >
          more
        </button>
      </span>
      <div
        ref={scrollCont}
        // -----------
        style={{
          background: "lightgrey",
          width: "270px",
          height: "320px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <div ref={sentinel}></div>
          {loading && <div>Loading...</div>}
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
                {item.image && (
                  <div
                    style={{
                      height: "70px",
                      width: "90px",
                      position: "relative",
                    }}
                  >
                    <img
                      src={item.image}
                      alt="message_image"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
                {item.content}
              </div>
            ))
          ) : error ? (
            <div>Timeout error occured, please try again</div>
          ) : (
            !loading && <p>No messages yet</p>
          )}
        </div>
      </div>
    </>
  );
};

export default MessageLog;
