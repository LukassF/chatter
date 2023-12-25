import {
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  FormEvent,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { BACKEND_URL } from "../../../../utils/api/constants";
import { setCurrentSetting } from "../../../../store/features/availableChatsSlice";

const UsernameChange = () => {
  const dispatch = useAppDispatch();
  //   const selected_chat = useAppSelector(
  //     (state) => state.available_chats.selected_chat
  //   );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [name, setName] = useState<string | undefined | null>();
  const [finalName, setFinalName] = useState<string | undefined | null>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const changeName = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (name === current_user?.username || !name) return;

      setFinalName(name);
    },
    [name, current_user]
  );

  useLayoutEffect(() => {
    if (current_user) setName(current_user.username);
  }, [current_user]);

  useEffect(() => {
    if (access_token && finalName && current_user)
      fetchData({
        url: BACKEND_URL + "api/users/changeusername",
        method: "PUT",
        data: {
          finalName,
          user_id: current_user?.id,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [finalName, access_token, current_user]);

  useEffect(() => {
    if (success) window.location.reload();
  }, [success]);

  const closeSetting = useCallback(() => {
    dispatch(setCurrentSetting(null));
  }, []);

  return (
    <div className="max-w-screen min-h-[200px] sm:w-[500px] text-sm sm:text-md sm:aspect-[5/2] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-3 grid grid-rows-[1fr_3.5fr] shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] relative">
      <button
        onClick={() => closeSetting()}
        className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute right-3 top-3"
      >
        <i className="fa fa-close"></i>
      </button>
      <h1 className="font-semibold text-md text-center flex justify-center items-center">
        Change username
      </h1>
      <form onSubmit={(e) => changeName(e)} className=" grid grid-rows-2">
        <div className="form-group p-2 flex justify-center items-center">
          <input
            type="text"
            placeholder="Username"
            className="form-control py-2 rounded-xl"
            value={name ? (name as string) : ""}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 p-[13px] gap-4">
          <button
            disabled={name === current_user?.username || !name}
            className="rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-stone-100"
          >
            Accept
          </button>
          <button
            type="button"
            className="rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200"
            onClick={() => closeSetting()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsernameChange;
