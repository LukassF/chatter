import { useState, useCallback, useEffect, useRef, FormEvent } from "react";
import FoundUsersList from "../../../../../components/FoundUsersList";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { fetchApi } from "../../../../../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../../utils/api/constants";
import {
  addChats,
  setCurrentSetting,
  triggerChatReload,
} from "../../../../../store/features/availableChatsSlice";
import { User } from "../../../../../store/features/currentUserSlice";
import { toBase64 } from "../../../../../utils/api/toBase64";
import { ChatMember } from "../../../../../utils/types";

const CreateChat = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );

  const [input, setInput] = useState<string | undefined>();
  const [selected_users, setSelectedUsers] = useState<ChatMember[]>([]);
  const [final_users, setFinalUsers] = useState<number[] | undefined>(
    undefined
  );
  const [chat_name, setChatName] = useState<string | null>();

  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const deselectUser = useCallback(
    (user: User) => {
      if (user)
        setSelectedUsers((prev) => prev.filter((val) => val.id != user.id));
    },
    [selected_users]
  );

  const commitData = () => {
    const users = [current_user!, ...selected_users];
    setChatName(users.map((item) => item.username).join(", "));
    const ids = users.map((val) => val.id!);
    setFinalUsers(ids);
  };

  useEffect(() => {
    if (access_token && final_users && current_user)
      fetchData({
        url: BACKEND_URL + "api/chats/createchat",
        method: "POST",
        data: {
          name: chat_name,
          users: final_users,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [access_token, final_users, current_user]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            users: [current_user, ...selected_users],
            type: "chat",
          })
        );

        // let messages = success.data.messages.map(
        //   (mess: { id: number; message: string }) => ({
        //     id: mess.id,
        //     content: mess.message,
        //     chat_id: selected_chat?.id,
        //     image: null,
        //     created_at: new Date(),
        //   })
        // );

        // ws.send(
        //   JSON.stringify({
        //     messages,
        //     type: "message",
        //   })
        // );

        dispatch(setCurrentSetting(null));
      };
    }

    return () => ws.close();
  }, [success]);

  const closeSetting = useCallback(() => {
    dispatch(setCurrentSetting(null));
  }, []);

  return (
    <div className="max-w-[95vw] w-[500px] sm:aspect-[4/5]  bg-white rounded-xl p-3 gap-2 shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] relative left-1/2 -translate-x-1/2">
      <button
        onClick={() => closeSetting()}
        className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute right-3 top-3"
      >
        <i className="fa fa-close"></i>
      </button>

      <div className="w-full h-full grid grid-rows-[1fr_1.7fr_3fr_8fr_1.5fr]">
        <h1 className="font-semibold text-md text-center flex justify-center items-center">
          Create chat
        </h1>
        <div className=" flex justify-center items-center">
          <input
            type="text"
            className="form-control py-2 rounded-full text-sm mx-2"
            placeholder="&#xf002; Search"
            style={{
              fontFamily: "'Helvetica', FontAwesome, sans-serif",
              fontStyle: "normal",
            }}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="w-full flex justify-start gap-1 p-2 overflow-x-auto">
          {selected_users && selected_users.length > 0 ? (
            selected_users.map((user, index) => (
              <div
                key={index}
                className="h-full  min-w-[70px]  p-1 flex flex-col justify-center "
              >
                <div className="flex justify-center items-center w-full relative">
                  <button
                    onClick={() => deselectUser(user)}
                    className="absolute right-0 top-0 bg-blue-100 text-blue-600 hover:bg-blue-200 w-[18px] aspect-square text-[12px] flex justify-center rounded-full items-center"
                  >
                    <i className="fa fa-close"></i>
                  </button>
                  <div className="w-[75%] max-w-[50px] aspect-square  rounded-full overflow-hidden">
                    <img
                      className="h-full w-full object-cover"
                      src={
                        user.image
                          ? user.image
                          : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                      }
                      alt="profile-images"
                    />
                  </div>
                </div>
                <div className=" py-1  truncate text-xs text-muted font-light text-center">
                  {user.username}
                </div>
              </div>
            ))
          ) : (
            <div className="self-center w-full text-center text-sm text-muted">
              No users selected
            </div>
          )}
        </div>
        <div>
          <FoundUsersList
            input={input}
            setUsers={setSelectedUsers}
            users={selected_users}
            type="create"
          />
        </div>

        <div className="grid grid-cols-2 p-[8px] sm:gap-4 gap-2">
          <button
            onClick={() => commitData()}
            disabled={selected_users.length === 0}
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
      </div>
    </div>
  );
};

export default CreateChat;
