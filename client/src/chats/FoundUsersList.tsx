import { useDeferredValue, useEffect, useState } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";

const FoundUsersList = ({ input }: { input?: string }) => {
  const deferredInput = useDeferredValue(input || "");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setData, setError, setLoading);

  useEffect(() => {
    fetchData({
      url: BACKEND_URL + "api/users?input=" + deferredInput,
      method: "GET",
      headers: {
        Authorization:
          "Bearer " + JSON.parse(window.localStorage.getItem("access_token")!),
      },
    });
  }, [deferredInput]);

  //   useEffect(() => {
  //     console.log(data);
  //   }, [data]);

  return (
    <div>
      {data
        ? data.data.map((item: any, index: number) => (
            <div key={index}>{item.username}</div>
          ))
        : "No users"}
    </div>
  );
};

export default FoundUsersList;
