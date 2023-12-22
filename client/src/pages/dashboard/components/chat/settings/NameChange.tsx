import {
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  FormEvent,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setCurrentSetting } from "../../../../../store/features/availableChatsSlice";
import { fetchApi } from "../../../../../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../../utils/api/constants";

const NameChange = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [name, setName] = useState<string | undefined | null>();
  const [finalName, setFinalName] = useState<string | undefined | null>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const changeName = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (name === selected_chat?.name || !name) return;

      setFinalName(name);
    },
    [name, selected_chat]
  );

  useLayoutEffect(() => {
    if (selected_chat) setName(selected_chat.name);
  }, [selected_chat]);

  useEffect(() => {
    if (access_token && finalName && current_user && selected_chat)
      fetchData({
        url: BACKEND_URL + "api/chats/changename",
        method: "PUT",
        data: {
          finalName,
          user: current_user?.username,
          chat_id: selected_chat?.id,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [finalName, access_token, current_user]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            users: selected_chat?.users,
            type: "chat",
          })
        );

        ws.send(
          JSON.stringify({
            id: success.data.message_id,
            content: success.data.message,
            chat_id: selected_chat?.id,
            image: null,
            created_at: new Date(),
            type: "message",
          })
        );

        dispatch(setCurrentSetting(null));
      };
    }

    return () => ws.close();
  }, [success]);

  const closeSetting = useCallback(() => {
    dispatch(setCurrentSetting(null));
  }, []);

  return (
    <div className="max-w-screen min-h-[200px] sm:w-[500px] text-sm sm:text-md sm:aspect-[5/2] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-3 grid grid-rows-[1fr_3.5fr] shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] relative">
      <button
        onClick={() => closeSetting()}
        className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute right-3 top-3"
      >
        <i className="fa fa-close"></i>
      </button>
      <h1 className="font-semibold text-md text-center flex justify-center items-center">
        Modify chat name
      </h1>
      <form onSubmit={(e) => changeName(e)} className=" grid grid-rows-2">
        <div className="form-group p-2 flex justify-center items-center">
          <input
            type="text"
            placeholder="Chat name"
            className="form-control py-2 rounded-xl"
            value={name ? (name as string) : ""}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 p-[13px] gap-4">
          <button
            disabled={name === selected_chat?.name || !name}
            className="rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-stone-100"
          >
            Accept
          </button>
          <button
            type="button"
            className="rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200"
            onClick={() => closeSetting()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default NameChange;
