import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { BACKEND_URL } from "../../../../utils/api/constants";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { deleteTokens } from "../../../../store/features/tokensSlice";
import ProfilePopover from "./ProfilePopover";
import toast from "react-hot-toast";

const Aside = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const refresh_token = useAppSelector((state) => state.tokens.refresh_token);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const [popover, setPopover] = useState<boolean>(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [_, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const logout = useCallback(() => {
    fetchData({
      url: BACKEND_URL + "auth/logout",
      method: "POST",
      data: {
        refresh_token,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    dispatch(deleteTokens());
    window.location.reload();
  }, []);

  const togglePopover = useCallback(() => {
    setPopover((prev) => !prev);
  }, [popover]);

  useEffect(() => {
    if (success) toast.success("Log out successfull");
  }, [success]);

  useEffect(() => {
    if (error) toast.error("Something went wrong");
  }, [error]);

  return (
    <aside
      className={`py-3 px-2 sm:flex flex-col justify-between min-w-[65px] h-screen overflow-y-auto ${
        selected_chat ? "hidden" : "flex"
      }`}
    >
      {popover && <ProfilePopover setPopover={setPopover} />}
      <ul className="min-h-[200px] list-style-none flex flex-col items-stretch justify-stretch gap-1  [&>*]:flex [&>*]:justify-center [&>*]:items-center [&>*]:p-1 [&>*]:text-md [&>*]:cursor-pointer [&>*]:rounded-md [&>*]:h-10 [&>*]:text-stone-500 [&>*]:font-light">
        <li className="hover:bg-gray-100">
          <i className="far fa-message"></i>
        </li>
        <li className="hover:bg-gray-100">
          <i className="fa fa-people-group"></i>
        </li>
        <li className="hover:bg-gray-100">
          <i className="fas fa-tasks"></i>
        </li>
        <li className="hover:bg-gray-100">
          <i className="fa fa-trash"></i>
        </li>
      </ul>

      <div className="flex flex-col items-stretch justify-center gap-2 min-h-[100px]">
        {current_user && (
          <div
            className="flex justify-center items-center"
            onClick={() => togglePopover()}
          >
            <div className="max-w-[40px] relative rounded-full aspect-square overflow-hidden cursor-pointer hover:shadow-md">
              <img
                className="w-full h-full object-cover"
                src={
                  current_user.image
                    ? current_user.image
                    : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                }
                alt="profile-image"
              />
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="hover:bg-gray-100 flex justify-center items-center p-1 text-md cursor-pointer rounded-md h-10 text-stone-500 font-light"
        >
          <i className="fa fa-sign-out"></i>
        </button>
      </div>
    </aside>
  );
};

export default Aside;
