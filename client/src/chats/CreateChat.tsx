import { useState, useCallback, useEffect } from "react";
import FoundUsersList from "./FoundUsersList";
import { useAppDispatch, useAppSelector } from "../store/store";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL, WEBSOCKET_URL } from "../utils/api/constants";
import { addChats } from "../store/features/availableChatsSlice";
import { User } from "../store/features/currentUserSlice";

const CreateChat = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);

  //
  const [input, setInput] = useState<string>();
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [payload, setPayload] = useState<Record<string, any>>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const createChat = useCallback(() => {
    if (!selectedUsers || selectedUsers.length === 0)
      return console.log("Select at least one user");

    if (!name) return console.log("Your chat has to have a name");

    const users = selectedUsers.map((item) => item.id);
    users.push(current_user?.id);

    setPayload({ name, users });
  }, [selectedUsers, name]);

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

    ws.onmessage = (msg) => {
      const data = typeof msg.data == "string" && JSON.parse(msg.data);
      if (
        data.users &&
        data.users.length > 1 &&
        data.name &&
        data.users.find((val: User) => val.id === current_user?.id)
      )
        dispatch(addChats([data]));
    };
    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            id: Math.random(),
            name: payload?.name,
            users: [...selectedUsers, current_user],
            image: null,
            created_at: new Date(),
          })
        );
      };
    }

    return () => ws.close();
  }, [success]);

  return (
    <>
      <h2>Create chat</h2>
      <h4>Find users</h4>
      <input
        type="text"
        placeholder="find"
        onChange={(e) => setInput(e.target.value)}
      />
      <input
        type="text"
        placeholder="name"
        onChange={(e) => setName(e.target.value)}
      />
      <FoundUsersList input={input} setUsers={setSelectedUsers} />
      {selectedUsers &&
        selectedUsers.map((item: any, index: number) => (
          <div key={index}>{item.username}</div>
        ))}

      <button onClick={createChat}>Create</button>
    </>
  );
};

export default CreateChat;
