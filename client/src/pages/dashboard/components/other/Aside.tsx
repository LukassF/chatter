import { useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { BACKEND_URL } from "../../../../utils/api/constants";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { deleteTokens } from "../../../../store/features/tokensSlice";
import { Link } from "react-router-dom";

const Aside = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const refresh_token = useAppSelector((state) => state.tokens.refresh_token);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
  return (
    <aside className="py-3 px-2 flex flex-col justify-between">
      <ul className="list-style-none flex flex-col items-stretch justify-stretch gap-1  [&>*]:flex [&>*]:justify-center [&>*]:items-center [&>*]:p-3 [&>*]:text-xl [&>*]:cursor-pointer [&>*]:rounded-md [&>*]:h-14 [&>*]:text-stone-500 [&>*]:font-light">
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

      <div className="flex flex-col items-stretch justify-center gap-2">
        {current_user && (
          <Link to="/profile" className="flex justify-center items-center">
            <div className="max-w-[40px] relative rounded-full aspect-square overflow-hidden cursor-pointer hover:shadow-md">
              <img
                className="w-full h-full object-cover"
                src={
                  current_user.image
                    ? current_user.image
                    : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                }
                alt="profile-image"
              />
            </div>
          </Link>
        )}
        <button
          onClick={logout}
          className="hover:bg-gray-100 flex justify-center items-center p-3 text-xl cursor-pointer rounded-md h-14 text-stone-500 font-light"
        >
          <i className="fa fa-sign-out"></i>
        </button>
      </div>
    </aside>
  );
};

export default Aside;
