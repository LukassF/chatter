import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import {
  Settings,
  setCurrentSetting,
  toggleSettings,
} from "../../../../../store/features/availableChatsSlice";
import { BACKEND_URL, WEBSOCKET_URL } from "../../../../../utils/api/constants";
import { fetchApi } from "../../../../../utils/api/fetchApi";

import Swal from "sweetalert2";

import UsersList from "../../../../../components/UsersList";
import toast from "react-hot-toast";

const ChatSettings = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [collapse, setCollapse] = useState<boolean>(false);
  const [payload, setPayload] = useState<Record<any, any>>();
  const [perform_delete, setPerformDelete] = useState<boolean>(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [_, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const leaveChat = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action is irreversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "I'm sure!",
    }).then((result) => {
      if (!result.isConfirmed) return;
      if (!selected_chat || selected_chat.users?.length === 0 || !current_user)
        return;

      const users = selected_chat
        ?.users!.filter((val) => val.id != current_user?.id)
        .map((item) => item.id);

      setPayload({
        users,
        removed: [{ id: current_user?.id, name: current_user?.username }],
        user: current_user?.username,
        chat_id: selected_chat?.id,
      });
    });
  }, [selected_chat, current_user]);

  const deleteChat = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "All content in this chat will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "I'm sure!",
    }).then((result) => {
      if (result.isConfirmed) setPerformDelete(true);
    });
  }, []);

  useEffect(() => {
    if (access_token && payload)
      fetchData({
        url: BACKEND_URL + "api/chats/manageusers",
        method: "PUT",
        data: payload,
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [payload, access_token]);

  useEffect(() => {
    if (perform_delete && access_token)
      fetchData({
        url: BACKEND_URL + "api/chats/delete",
        method: "DELETE",
        data: { chat_id: selected_chat?.id },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [perform_delete, access_token]);

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

  useEffect(() => {
    if (error) toast.error("Something went wrong");
  }, [error]);

  return (
    <>
      <section className="overflow-auto h-full py-5 sm:py-3 px-2 justify-between gap-4 relative">
        <button
          onClick={() => dispatch(toggleSettings())}
          className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute left-3 top-3 lg:hidden"
        >
          <i className="fa fa-close"></i>
        </button>
        <div className="flex flex-col gap-3 h-auto">
          <div className="flex justify-center">
            <div className="min-h-[100px] aspect-square bg-stone-100 rounded-full flex justify-center items-center text-4xl text-blue-600">
              <i className="fa fa-cogs"></i>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-center mt-2">
            Chat settings
          </h2>

          <div className="flex flex-col gap-1 items-stretch [&>*]:text-left  [&>*]:rounded-md ">
            <button
              onClick={() => dispatch(setCurrentSetting(Settings.name))}
              className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
            >
              <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
                <i className="fa fa-pencil"></i>
              </div>
              Change chat name
            </button>

            <button
              onClick={() => dispatch(setCurrentSetting(Settings.image))}
              className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
            >
              <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
                <i className="fa fa-image"></i>
              </div>
              Select image
            </button>

            <button
              onClick={() => setCollapse((prev: boolean) => !prev)}
              className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
            >
              <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
                <i className="far fa-address-book"></i>
              </div>
              Manage users
            </button>
            <div
              className={`${
                collapse ? "h-auto" : "h-[0px]"
              } transition-all duration-500 px-2`}
            >
              <UsersList chat={selected_chat} />
            </div>
            <button
              onClick={() => leaveChat()}
              className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
            >
              <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
                <i className="fa fa-sign-out"></i>
              </div>
              Leave chat
            </button>
            <button
              onClick={() => deleteChat()}
              className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
            >
              <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
                <i className="far fa-window-close"></i>
              </div>
              Delete chat
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ChatSettings;
