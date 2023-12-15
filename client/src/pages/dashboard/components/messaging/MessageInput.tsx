import { useCallback, FormEvent, useState, useEffect, useRef } from "react";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../utils/api/constants";
import {
  addMessages,
  pushToTop,
  setLastMessage,
  triggerChatReload,
} from "../../../../store/features/availableChatsSlice";
import { toBase64 } from "../../../../utils/api/toBase64";

const MessageInput = () => {
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const dispatch = useAppDispatch();

  //

  const [payload, setPayload] = useState<Record<string, any>>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  //

  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  //

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = (event.target as any).message.value;
    const image = (event.target as any).image.files[0] as File;
    let base64: string | ArrayBuffer | null = null;
    if (image) base64 = await toBase64(image);

    if (!message && !image) return console.log("Message cannot be empty");
    if (!current_user) return console.log("Error getting current user");
    if (!selected_chat) return console.log("Error getting current chat");

    setPayload({
      message,
      user_id: current_user?.id,
      chat_id: selected_chat?.id,
      image: base64,
    });
  };

  useEffect(() => {
    if (access_token && payload)
      fetchData({
        url: BACKEND_URL + "api/messages/send",
        method: "POST",
        data: payload,
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [payload, access_token]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    // ws.onmessage = (msg) => {
    //   const data = typeof msg.data == "string" && JSON.parse(msg.data);

    //   if (data.type == "message") {
    //     dispatch(addMessages(data));
    //     dispatch(triggerChatReload());
    //     // dispatch(
    //     //   setLastMessage({
    //     //     user_id: data.user_id,
    //     //     chat_id: data.chat_id,
    //     //     created_at: data.created_at,
    //     //     message: data.content,
    //     //   })
    //     // );
    //     // dispatch(pushToTop(data.chat_id));
    //   }
    // };
    if (success) {
      if (inputRef.current) inputRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            id: Math.random(),
            content: payload?.message,
            user_id: payload?.user_id,
            chat_id: payload?.chat_id,
            image: payload?.image,
            created_at: new Date(),
            type: "message",
          })
        );
      };
    }

    return () => ws.close();
  }, [success]);

  return (
    <>
      <form onSubmit={sendMessage} autoComplete="off">
        <input
          type="text"
          placeholder="your message"
          name="message"
          ref={inputRef}
        ></input>
        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          name="image"
        ></input>
        <button type="button" onClick={() => fileRef.current?.click()}>
          <i className="fa fa-image"></i>
        </button>
        {/* EMOJI PICKER */}
        <button>send</button>
      </form>
    </>
  );
};

export default MessageInput;
