import { useCallback, useState, useEffect } from "react";
import { Chat, ChatMember } from "../utils/types";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  Settings,
  setCurrentSetting,
} from "../store/features/availableChatsSlice";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../utils/api/constants";
import Swal from "sweetalert2";

const UsersList = ({ chat }: { chat: Chat | undefined }) => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);

  const [user_to_remove, setUserToRemove] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [final_users, setFinalUsers] = useState<number[] | undefined>(
    undefined
  );

  const [success, setSuccess] = useState<any>(null);
  const [__, setError] = useState<any>(null);
  const [_, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const removeUser = useCallback(
    (user: ChatMember) => {
      if (
        !selected_chat ||
        !selected_chat.users ||
        selected_chat.users.length === 0
      )
        return;

      Swal.fire({
        title: "Are you sure?",
        text: `User ${user.username} will be removed`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "I'm sure!",
      }).then((res) => {
        if (!res.isConfirmed) return;

        let result = { id: user.id!, name: user.username! };
        let final = selected_chat
          ?.users!.filter((user) => user.id != result.id)
          .map((item) => item.id!);

        setUserToRemove(result);
        setFinalUsers(final);
      });
    },
    [selected_chat]
  );

  useEffect(() => {
    if (access_token && final_users && current_user)
      fetchData({
        url: BACKEND_URL + "api/chats/manageusers",
        method: "PUT",
        data: {
          users: final_users,
          removed: [user_to_remove],
          user: current_user?.username,
          chat_id: selected_chat?.id,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [access_token, current_user, final_users]);

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
    <div className="pb-2">
      <ul className="w-full flex flex-col items-stretch p-2 gap-1">
        {chat &&
          chat.users!.map((user: ChatMember, index: number) => (
            <li
              key={index}
              className="rounded-md cursor-default hover:bg-stone-100 grid grid-cols-[1fr_3fr_1fr] xs:grid-cols-[1fr_6fr_1fr] sm:grid-cols-[1fr_2.8fr_0.8fr] min-h-[20px]"
            >
              <div className="p-[5px] min-w-[50px]">
                <div className="aspect-square rounded-full w-[35px] ">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      user.image
                        ? user.image
                        : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                    }
                    alt="profile image"
                  />
                </div>
              </div>
              <div className=" flex flex-col items-start justify-center p-[5px]">
                <h3 className="font-medium text-md truncate w-full">
                  {user.username}
                </h3>
                <p className="font-light text-xs text-muted truncate w-full">
                  {user.email}
                </p>
              </div>
              <div className="flex justify-center items-center">
                {chat.users?.length! > 2 && user.id != current_user?.id && (
                  <button
                    onClick={() => removeUser(user)}
                    className="flex justify-center items-center w-2/3 aspect-square rounded-full hover:bg-stone-200"
                  >
                    <i className="fa fa-close text-xs"></i>
                  </button>
                )}
              </div>
            </li>
          ))}
      </ul>
      <button
        onClick={() => dispatch(setCurrentSetting(Settings.users))}
        className=" text-sm rounded-md hover:bg-stone-100 w-full py-2 px-3 text-left flex justify-start items-center gap-2"
      >
        <div className="px-2 aspect-square rounded-full bg-stone-200 flex justify-center items-center">
          <i className="fa fa-add text-sm"></i>
        </div>{" "}
        Add
      </button>
    </div>
  );
};

export default UsersList;
