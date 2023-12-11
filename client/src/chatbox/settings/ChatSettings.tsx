import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  deleteFromChats,
  modifyChat,
  toggleSettings,
  triggerChatReload,
} from "../../store/features/availableChatsSlice";
import {
  ALLOWED_TYPES,
  BACKEND_URL,
  WEBSOCKET_URL,
} from "../../utils/api/constants";
import { fetchApi } from "../../utils/api/fetchApi";
import FoundUsersList from "../../chats/FoundUsersList";
import { User } from "../../store/features/currentUserSlice";
import { toBase64 } from "../../utils/api/toBase64";

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

  const changeData = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const name = (e.target as any).name.value;
      const image = (e.target as any).image.files[0] as File;

      if (!name && !image && users_changed) return;

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
        base64,
        name,
        users,
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
      setPayload({ id: selected_chat?.id, base64: "", name: "", users });
    else setPerformDelete(true);
  }, [selected_chat, current_user]);

  const deleteChat = useCallback(() => {
    let confirmed = confirm(
      "Are you sure? ALl content in this chat will be lost."
    );

    if (confirmed) setPerformDelete(true);
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

    ws.onmessage = (msg) => {
      const data = typeof msg.data == "string" && JSON.parse(msg.data);

      if (
        data.type === "chat" &&
        data.users.find((val: User) => val.id === current_user?.id)
      )
        dispatch(triggerChatReload());
    };
    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            users: initSelectedUsers,
            type: "chat",
          })
        );
      };
    }
    return () => ws.close();
  }, [success]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h4>
        Settings
        <span
          style={{ marginLeft: "20px" }}
          onClick={() => dispatch(toggleSettings(false))}
        >
          X
        </span>
      </h4>
      <button onClick={() => leaveChat()}>Leave chat</button>
      <button onClick={() => deleteChat()}>Delete chat</button>

      <hr></hr>
      <form
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
      <FoundUsersList setUsers={setSelectedUsers} input={input} />
    </div>
  );
};

export default ChatSettings;
