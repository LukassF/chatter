import { useDeferredValue, useEffect, useState } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";
import { useAppSelector } from "../store/store";

const FoundUsersList = ({
  input,
  setUsers,
}: {
  input?: string;
  setUsers: any;
}) => {
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const deferredInput = useDeferredValue(input || "");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  useEffect(() => {
    if (access_token)
      fetchData({
        url: BACKEND_URL + "api/users/getusers?input=" + deferredInput,
        method: "GET",
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [deferredInput]);

  const addUser = (item: any) => {
    setUsers((prev: any) =>
      !prev.find((user: any) => user.id === item.id)
        ? [...prev, item]
        : [...prev]
    );
  };

  //   useEffect(() => {
  //     console.log(data);
  //   }, [data]);

  return (
    <div>
      {data
        ? data.data.map((item: any, index: number) => (
            <div
              style={{ margin: 20, backgroundColor: "rgb(230,200,230)" }}
              key={index}
              onClick={() => addUser(item)}
            >
              {item.username}
            </div>
          ))
        : "No users"}
    </div>
  );
};

export default FoundUsersList;
