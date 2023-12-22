import { useDeferredValue, useEffect, useState } from "react";
import { fetchApi } from "../utils/api/fetchApi";
import { BACKEND_URL } from "../utils/api/constants";
import { useAppSelector } from "../store/store";
import { User } from "../store/features/currentUserSlice";
import { ChatMember } from "../utils/types";
import { RotatingLines } from "react-loader-spinner";

const FoundUsersList = ({
  input,
  setUsers,
  users,
  type,
}: {
  input?: string;
  setUsers: any;
  users: ChatMember[];
  type: string;
}) => {
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
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
        : [...prev.filter((val: User) => val.id !== item.id)]
    );
  };

  return (
    <div className="grid grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr] h-full w-full gap-1 py-1">
      {loading ? (
        <div className="w-full flex justify-center mt-3">
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="40"
            visible={true}
          />
        </div>
      ) : data ? (
        data.data
          .filter((val: ChatMember) =>
            selected_chat && type === "modify"
              ? !selected_chat?.users?.find((user) => user.id == val.id)
              : val
          )
          .map((item: any, index: number) => (
            <div
              className="cursor-pointer hover:bg-stone-100 rounded-md flex p-2 items-center justify-start gap-2"
              key={index}
              onClick={() => addUser(item)}
            >
              <div className="max-h-[30px] h-full aspect-square rounded-full">
                <img
                  className="h-full w-full object-cover"
                  src={
                    item.image
                      ? item.image
                      : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                  }
                  alt="profile-images"
                />
              </div>
              <span className="font-medium text-md">{item.username}</span>

              <input
                type="radio"
                className="ms-auto cursor-pointer"
                checked={
                  type === "modify"
                    ? !!users
                        .concat(selected_chat?.users!)
                        .find((val) => val.id == item.id)
                    : !!users.find((val) => val.id == item.id)
                }
                onChange={() => {}}
              />
            </div>
          ))
      ) : (
        <div className="self-center w-full text-center text-sm text-muted">
          No users found
        </div>
      )}
    </div>
  );
};

export default FoundUsersList;
