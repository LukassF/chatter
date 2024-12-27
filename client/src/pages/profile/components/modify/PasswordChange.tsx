import { useState, useEffect, useCallback, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { BACKEND_URL } from "../../../../utils/api/constants";
import { setCurrentSetting } from "../../../../store/features/availableChatsSlice";
import { RotatingLines } from "react-loader-spinner";
import toast from "react-hot-toast";

const PasswordChange = () => {
  const dispatch = useAppDispatch();

  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const [password, setPassword] = useState<string | undefined | null>();
  const [repeated_password, setRepeatedPassword] = useState<
    string | undefined | null
  >();
  const [finalPassword, setFinalPassword] = useState<
    string | undefined | null
  >();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const [first_type, setFirstType] = useState<boolean>(false);
  const [repeated_type, setRepeatedType] = useState<boolean>(false);

  const changeName = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!password || password != repeated_password || password.length < 6)
        return;

      setFinalPassword(password);
    },
    [password, repeated_password, current_user]
  );

  useEffect(() => {
    if (access_token && finalPassword && current_user)
      fetchData({
        url: BACKEND_URL + "api/users/change_password",
        method: "PUT",
        data: {
          finalPassword,
          user_id: current_user?.id,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [finalPassword, access_token, current_user]);

  useEffect(() => {
    if (success) window.location.reload();
  }, [success]);

  useEffect(() => {
    if (error) toast.error("Something went wrong");
  }, [error]);

  const closeSetting = useCallback(() => {
    dispatch(setCurrentSetting(null));
  }, []);

  return (
    <div className="max-w-screen min-h-[270px] sm:w-[620px] text-sm sm:text-md sm:aspect-[5/2] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-3 grid-rows-[1fr_4fr] shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] relative">
      <button
        onClick={() => closeSetting()}
        className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute right-3 top-3"
      >
        <i className="fa fa-close"></i>
      </button>
      <div>
        <span className="font-semibold text-md text-center flex justify-center items-center">
          Change password
        </span>
        <p className="text-muted text-[10px] sm:text-xs text-center mt-3 sm:mt-0">
          New password has to be at least 6 characters long
        </p>
      </div>
      <form
        onSubmit={(e) => changeName(e)}
        className=" grid grid-rows-[2fr_1.5fr]"
      >
        <div className="form-group p-2 flex justify-center items-center relative">
          <input
            type={first_type ? "text" : "password"}
            placeholder="New password"
            className="form-control py-2 rounded-xl"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setFirstType((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px] rounded-full  aspect-square hover:bg-stone-100 flex justify-center items-center"
          >
            <i className="fa fa-eye  text-muted"></i>
          </button>
        </div>
        <div className="form-group p-2 flex justify-center items-center relative">
          <input
            type={repeated_type ? "text" : "password"}
            placeholder="Repeat password"
            className="form-control py-2 rounded-xl"
            onChange={(e) => setRepeatedPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setRepeatedType((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-[30px] rounded-full  aspect-square hover:bg-stone-100 flex justify-center items-center"
          >
            <i className="fa fa-eye  text-muted"></i>
          </button>
        </div>

        <div className="grid grid-cols-2 p-[13px] gap-4 min-h-[60px]">
          <button
            disabled={
              !password || password != repeated_password || password.length < 6
            }
            className="rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-stone-100"
          >
            {!loading ? (
              "Accept"
            ) : (
              <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="16"
                visible={true}
              />
            )}
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

export default PasswordChange;
