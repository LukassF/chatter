import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import { toggleSettings } from "../../../../../store/features/availableChatsSlice";
import {
  ALLOWED_TYPES,
  BACKEND_URL,
  WEBSOCKET_URL,
} from "../../../../../utils/api/constants";
import { fetchApi } from "../../../../../utils/api/fetchApi";
import FoundUsersList from "../../../../../components/FoundUsersList";
import { User } from "../../../../../store/features/currentUserSlice";
import { toBase64 } from "../../../../../utils/api/toBase64";
import Swal from "sweetalert2";

const ChatSettings = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [initSelectedUsers, setInitSelectedUsers] = useState<
    User[] | undefined
  >(selected_chat?.users);

  const [selectedUsers, setSelectedUsers] = useState<User[] | undefined>(
    selected_chat?.users
  );
  const [input, setInput] = useState<string>();
  const [payload, setPayload] = useState<Record<any, any>>();
  const [perform_delete, setPerformDelete] = useState<boolean>(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);
  const fileInput = useRef<HTMLInputElement>(null);

  const users_changed = useMemo(() => {
    if (
      (!initSelectedUsers && !selectedUsers) ||
      initSelectedUsers?.length !== selectedUsers?.length
    )
      return true;

    const difference = selectedUsers?.filter((item) =>
      initSelectedUsers?.find((user) => user.id === item.id)
    );
    if (
      difference?.length === selectedUsers?.length &&
      difference?.length === initSelectedUsers?.length
    )
      return false;
    return true;
  }, [initSelectedUsers, selectedUsers]);

  const removed_users = useMemo(() => {
    const removed = initSelectedUsers?.filter(
      (user) => !selectedUsers?.find((val) => val.id == user.id)
    );

    return removed?.map((item) => ({
      content: `User ${item.username} has been removed by ${current_user?.username}`,
      chat_id: selected_chat?.id,
    }));
  }, [initSelectedUsers, selectedUsers]);

  const added_users = useMemo(() => {
    const added = selectedUsers?.filter(
      (user) => !initSelectedUsers?.find((val) => val.id == user.id)
    );
    return added?.map((item) => ({
      content: `User ${item.username} has been added by ${current_user?.username}`,
      chat_id: selected_chat?.id,
    }));
  }, [initSelectedUsers, selectedUsers]);

  const changeData = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const name = (e.target as any).name.value;
      const image = (e.target as any).image.files[0] as File;
      let message;

      if (!name && !image && !users_changed) return;

      if (image || name)
        message = {
          content: "Chat has been modified by " + current_user?.username,
          chat_id: selected_chat?.id,
        };

      let base64;
      if (image) {
        const extension = image.type.split("/")[1];
        if (!ALLOWED_TYPES.includes(extension))
          return console.log("File type not supported");

        base64 = await toBase64(image);
      }

      let users;
      if (selectedUsers)
        users = selectedUsers.map((item) => item.id?.toString());

      setPayload({
        chat_id: selected_chat?.id,
        message,
        base64,
        name,
        users,
        added_users,
        removed_users,
      });
    },
    [selected_chat, selectedUsers]
  );

  const leaveChat = useCallback(() => {
    let confirmed: boolean | undefined;
    if (selected_chat?.users && selected_chat.users.length <= 2)
      confirmed = confirm("Be careful, if you leave the chat will be deleted!");

    if (!confirmed && confirmed != undefined) return;

    setSelectedUsers((prev) =>
      prev?.filter((item) => item.id != current_user?.id)
    );

    let users = selectedUsers
      ?.filter((item) => item.id != current_user?.id)
      .map((user) => user.id?.toString());

    if (users && users.length > 1)
      setPayload({
        chat_id: selected_chat?.id,
        message: {
          content: "User " + current_user?.username + " has left the chat",
          chat_id: selected_chat?.id,
        },
        base64: "",
        name: "",
        users,
        added_users: [],
        removed_users: [],
      });
    else setPerformDelete(true);
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
        url: BACKEND_URL + "api/chats/modify",
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

    // ws.onmessage = (msg) => {
    //   const data = typeof msg.data == "string" && JSON.parse(msg.data);

    //   if (
    //     data.type === "chat" &&
    //     data.users.find((val: User) => val.id === current_user?.id)
    //   )
    //     dispatch(triggerChatReload());
    // };
    if (success) {
      ws.onopen = () => {
        let messages = [
          payload?.message,
          ...payload?.added_users!,
          ...payload?.removed_users!,
        ];
        messages = messages.filter((val) => val);
        messages = messages.map((val) => val.content);
        console.log(messages);

        ws.send(
          JSON.stringify({
            users: initSelectedUsers,
            type: "chat",
          })
        );

        messages.forEach((message) => {
          ws.send(
            JSON.stringify({
              id: Math.random(),
              content: message,
              chat_id: selected_chat?.id,
              image: null,
              created_at: new Date(),
              type: "message",
            })
          );
        });
      };
      setInitSelectedUsers(selectedUsers);
    }

    return () => ws.close();
  }, [success]);

  return (
    <section className="flex flex-col overflow-auto h-full p-2 justify-between gap-4">
      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold text-center mt-2">
          Chat {selected_chat?.name} settings
        </h2>

        <div className="flex flex-col gap-1 items-stretch [&>*]:text-left [&>*]:px-3 [&>*]:py-2 [&>*]:rounded-md">
          <button className="hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm">
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="fa fa-pencil"></i>
            </div>
            Change chat name
          </button>

          <button className="hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm">
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="fa fa-image"></i>
            </div>
            Select image
          </button>
          <button className="hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm">
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="far fa-address-book"></i>
            </div>
            Manage users
          </button>
          <button
            onClick={() => leaveChat()}
            className="hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
          >
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="fa fa-sign-out"></i>
            </div>
            Leave chat
          </button>
          <button
            onClick={() => deleteChat()}
            className="hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
          >
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="far fa-window-close"></i>
            </div>
            Delete chat
          </button>
        </div>
      </div>
      {/* <form
        onSubmit={changeData}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <input
          type="file"
          placeholder="image"
          name="image"
          ref={fileInput}
          style={{ display: "none" }}
        ></input>
        <button type="button" onClick={() => fileInput.current?.click()}>
          Select image
        </button>
        <input type="text" placeholder="name" name="name"></input>
        <button>Submit</button>
      </form>

      {selectedUsers &&
        selectedUsers.map((item, index) => (
          <div key={index}>
            {item.username}
            {current_user?.id != item.id && selectedUsers.length > 2 && (
              <span
                onClick={() =>
                  setSelectedUsers((prev) =>
                    prev?.filter((user) => user.id != item.id)
                  )
                }
              >
                X
              </span>
            )}
          </div>
        ))}

      <input
        type="text"
        placeholder="find"
        onChange={(e) => setInput(e.target.value)}
      ></input>
      <FoundUsersList setUsers={setSelectedUsers} input={input} /> */}
      <footer className="text-sm xs:text-md text-center font-light mb-3">
        2023 Chatter ©
      </footer>
    </section>
  );
};

export default ChatSettings;
