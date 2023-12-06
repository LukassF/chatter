import { useCallback, useState, useEffect } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";
import { useAppDispatch, useAppSelector } from "../store/store";
import { addChats } from "../store/features/availableChatsSlice";

const Chats = () => {
  const dispatch = useAppDispatch();
  const available_chats = useAppSelector(
    (state) => state.available_chats.chats
  );

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  useEffect(() => {
    fetchData({
      url: BACKEND_URL + "api/getchats",
      method: "GET",
      headers: {
        Authorization:
          "Bearer " + JSON.parse(window.localStorage.getItem("access_token")!),
      },
    });
  }, []);

  useEffect(() => {
    if (data) dispatch(addChats(data.data));
  }, [data]);

  return (
    <>
      <h2>Available chats</h2>
      {available_chats ? (
        available_chats.map((item: any, index: number) => (
          <div key={index}>{item.name}</div>
        ))
      ) : (
        <div>No chats yet</div>
      )}
    </>
  );
};

export default Chats;
