import { useCallback, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { setCurrentSetting } from "../../../../../store/features/availableChatsSlice";
import FoundUsersList from "../../../../../components/FoundUsersList";
import { User } from "../../../../../store/features/currentUserSlice";
import { ChatMember } from "../../../../../utils/types";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../../utils/api/constants";
import { fetchApi } from "../../../../../utils/api/fetchApi";

const AddUsers = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [input, setInput] = useState<string | undefined>();
  const [selected_users, setSelectedUsers] = useState<ChatMember[]>([]);
  const [final_users, setFinalUsers] = useState<number[] | undefined>(
    undefined
  );
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const closeSetting = useCallback(() => {
    dispatch(setCurrentSetting(null));
  }, []);

  const deselectUser = useCallback(
    (user: User) => {
      if (user)
        setSelectedUsers((prev) => prev.filter((val) => val.id != user.id));
    },
    [selected_users]
  );

  const commitData = () => {
    if (!selected_chat || !selected_chat.users) return;
    const users = [...selected_chat.users, ...selected_users];
    const ids = users.map((val) => val.id!);
    setFinalUsers(ids);
  };

  useEffect(() => {
    if (access_token && final_users && current_user)
      fetchData({
        url: BACKEND_URL + "api/chats/manageusers",
        method: "PUT",
        data: {
          users: final_users,
          added: selected_users.map((val) => ({
            id: val.id,
            name: val.username,
          })),
          user: current_user?.username,
          chat_id: selected_chat?.id,
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
            users: selected_chat?.users?.concat(selected_users),
            type: "chat",
          })
        );

        success.data.messages &&
          success.data.messages.forEach(
            (mess: { id: number; message: string }) => {
              ws.send(
                JSON.stringify({
                  id: mess.id,
                  content: mess.message,
                  chat_id: selected_chat?.id,
                  image: null,
                  created_at: new Date(),
                  type: "message",
                })
              );
            }
          );

        dispatch(setCurrentSetting(null));
      };
    }

    return () => ws.close();
  }, [success]);

  return (
    <div className="w-[500px] h-screen bg-white rounded-xl p-3 gap-2 shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] relative my-14 top-14">
      <button
        onClick={() => closeSetting()}
        className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute right-3 top-3"
      >
        <i className="fa fa-close"></i>
      </button>

      <div className="w-full h-full grid grid-rows-[1fr_1.5fr_3fr_8fr_1.5fr]">
        <h1 className="font-semibold text-md text-center flex justify-center items-center">
          Add users
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
        <div className=" max-w-full flex gap-1 p-2 overflow-x-auto">
          {selected_users && selected_users.length > 0 ? (
            selected_users.map((user, index) => (
              <div
                key={index}
                className="h-full w-[70px]  p-1 grid grid-rows-[1fr_0.7fr] items-center"
              >
                <div className="flex justify-center items-center w-full relative">
                  <button
                    onClick={() => deselectUser(user)}
                    className="absolute right-0 top-0 bg-blue-100 text-blue-600 hover:bg-blue-200 w-[18px] aspect-square text-[12px] flex justify-center rounded-full items-center"
                  >
                    <i className="fa fa-close"></i>
                  </button>
                  <div className="w-[75%] aspect-square  rounded-full overflow-hidden">
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
                <div className="truncate text-xs text-muted font-light text-center">
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
          />
        </div>

        <div className="grid grid-cols-2 p-[8px] gap-4">
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

export default AddUsers;
AddUsers;
