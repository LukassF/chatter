import { FormEvent, useState, useEffect, useRef } from "react";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../utils/api/constants";

import { toBase64 } from "../../../../utils/api/toBase64";
import { RotatingLines } from "react-loader-spinner";

const MessageInput = () => {
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const dispatch = useAppDispatch();
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );

  //

  const [image, setImage] = useState<File | null>(null);
  const [base64, setBase64] = useState<string | ArrayBuffer | null>(null);
  const [payload, setPayload] = useState<Record<string, any>>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  //

  useEffect(() => {
    if (image && image instanceof File) {
      (async () => {
        let base64: string | ArrayBuffer | null = null;
        if (image) base64 = await toBase64(image);

        setBase64(base64);
      })();
    }
  }, [image]);

  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  //

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const message = (event.target as any).message.value;
    // const image = (event.target as any).image.files[0] as File;
    // let base64: string | ArrayBuffer | null = null;
    // if (image) base64 = await toBase64(image);

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
    if (!success) return;

    if (success && success.data.message_id) {
      setImage(null);
      setBase64(null);
      if (inputRef.current) inputRef.current.value = "";
      if (fileRef.current) fileRef.current.value = "";
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            id: success.data.message_id,
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
      {base64 && !loading && (
        <div className="bg-stone-100 rounded-lg mx-3 h-20 md:h-28 w-3/4 md:w-1/2 absolute bottom-16 z-0 flex justify-start items-center p-[8px]">
          <div className="h-full relative p-[8px]">
            <div className="h-full aspect-square rounded-md overflow-hidden">
              <img
                src={base64 as string}
                alt="selected-image"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => {
                setBase64(null);
                setImage(null);
              }}
              className="w-[20px] hover:bg-blue-300 absolute right-0 top-0 aspect-square rounded-full bg-blue-200 text-blue-600 flex items-center justify-center text-xs"
            >
              <i className="fa fa-close"></i>
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={sendMessage}
        autoComplete="off"
        className={`h-full z-2 relative grid grid-cols-[6fr_1fr_1fr] xs:grid-cols-[8fr_1fr_1fr] md:grid-cols-[10fr_1fr_1fr] ${
          settings_open
            ? "lg:grid-cols-[13fr_1fr_1fr]"
            : "lg:grid-cols-[18fr_1fr_1fr]"
        } gap-2 px-2 py-1 justify-center items-center`}
      >
        <input
          disabled={loading}
          readOnly={loading}
          className="disabled:opacity-50 disabled:cursor-not-allowed disabled:select-none text-xs sm:text-md rounded-xl xs:rounded-full h-2/3 px-3 border-2 border-stone-200 bg-stone-100 outline-none"
          type="text"
          placeholder="Your message"
          name="message"
          ref={inputRef}
        ></input>

        <input
          type="file"
          ref={fileRef}
          style={{ display: "none" }}
          name="image"
          onChange={(e) => setImage(e.target?.files ? e.target.files[0] : null)}
        ></input>
        <button
          disabled={loading}
          type="button"
          className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 h-3/4 text-blue-600 max-h-[40px] xs:max-h-[45px] rounded-full aspect-square flex justify-center items-center"
          onClick={() => fileRef.current?.click()}
        >
          <i className="fa fa-image"></i>
        </button>
        {/* EMOJI PICKER */}
        <button
          disabled={loading}
          className="disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 text-blue-600 h-3/4  max-h-[40px] xs:max-h-[45px] rounded-full aspect-square flex justify-center items-center"
        >
          {!loading ? (
            <i className="fa fa-paper-plane"></i>
          ) : (
            <RotatingLines
              strokeColor="blue"
              strokeWidth="5"
              animationDuration="0.75"
              width="16"
              visible={true}
            />
          )}
        </button>
      </form>
    </>
  );
};

export default MessageInput;
