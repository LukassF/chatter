import { useState, useCallback, useEffect, useRef, FormEvent } from "react";
import FoundUsersList from "./FoundUsersList";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../utils/api/constants";
import {
  addChats,
  triggerChatReload,
} from "../store/features/availableChatsSlice";
import { User } from "../store/features/currentUserSlice";
import { toBase64 } from "../utils/api/toBase64";

const CreateChat = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);

  //
  const fileInput = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState<string>();
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [payload, setPayload] = useState<Record<string, any>>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const createChat = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const name = (e.target as any).name.value;
      const image = (e.target as any).image.files[0] as File;

      if (!selectedUsers || selectedUsers.length === 0)
        return console.log("Select at least one user");

      if (!name) return console.log("Your chat has to have a name");

      let base64;
      if (image) base64 = await toBase64(image);

      const users = selectedUsers.map((item) => item.id);
      users.push(current_user?.id);

      setPayload({ name, users, base64 });
    },
    [selectedUsers]
  );

  useEffect(() => {
    if (access_token && payload)
      fetchData({
        url: BACKEND_URL + "api/chats/createchat",
        method: "POST",
        data: payload,
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [payload]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            users: [...selectedUsers, current_user],
            type: "chat",
          })
        );
      };
    }

    return () => ws.close();
  }, [success]);

  return (
    <>
      <h2>Create chat</h2>
      <form onSubmit={createChat}>
        <h4>Find users</h4>
        <input
          type="text"
          placeholder="find"
          onChange={(e) => setInput(e.target.value)}
        />
        <input type="text" placeholder="name" name="name" />
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
        <FoundUsersList input={input} setUsers={setSelectedUsers} />
        {selectedUsers &&
          selectedUsers.map((item: any, index: number) => (
            <div key={index}>{item.username}</div>
          ))}

        <button>Create</button>
      </form>
    </>
  );
};

export default CreateChat;
