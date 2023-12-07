import { useState, useEffect } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  Chat,
  addChats,
  setChats,
} from "../store/features/availableChatsSlice";

const Chats = () => {
  const dispatch = useAppDispatch();
  const available_chats = useAppSelector(
    (state) => state.available_chats.chats
  );
  const access_token = useAppSelector((state) => state.tokens.access_token);

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  useEffect(() => {
    if (access_token)
      fetchData({
        url: BACKEND_URL + "api/chats/getchats",
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [access_token]);

  useEffect(() => {
    if (data && !error) dispatch(addChats(data.data));
    if (error) dispatch(setChats([]));
  }, [data, error]);

  return (
    <>
      <h2>Available chats</h2>
      {available_chats ? (
        available_chats.map((item: Chat, index: number) => (
          <div key={index}>
            {item.name}
            <ul>
              {item.users?.map((user, id: number) => (
                <li key={index + id}>{user.username}</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <div>No chats yet</div>
      )}
    </>
  );
};

export default Chats;
