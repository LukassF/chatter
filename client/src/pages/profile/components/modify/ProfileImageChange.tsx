import {
  useState,
  useRef,
  useCallback,
  ChangeEvent,
  FormEvent,
  useEffect,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { fetchApi } from "../../../../utils/api/fetchApi";
import { toBase64 } from "../../../../utils/api/toBase64";
import { setCurrentSetting } from "../../../../store/features/availableChatsSlice";
import { BACKEND_URL } from "../../../../utils/api/constants";
import { RotatingLines } from "react-loader-spinner";
import toast from "react-hot-toast";

const ProfileImageChange = () => {
  const dispatch = useAppDispatch();
  //   const selected_chat = useAppSelector(
  //     (state) => state.available_chats.selected_chat
  //   );
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const current_user = useAppSelector((state) => state.current_user.user);

  const imageRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null | undefined>(
    current_user?.image
  );
  const [finalImage, setFinalImage] = useState<string | null | undefined>();
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const convertImage = useCallback(async (e: ChangeEvent) => {
    const image = (e.target as any).files[0];

    const base64 = await toBase64(image);

    setImage(base64 as string);
  }, []);

  const changeImage = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (image != current_user?.image) setFinalImage(image);
    },
    [image]
  );

  const closeSetting = useCallback(() => {
    dispatch(setCurrentSetting(null));
  }, []);

  useEffect(() => {
    if (access_token && finalImage && current_user)
      fetchData({
        url: BACKEND_URL + "api/users/change_profile_image",
        method: "PUT",
        data: {
          finalImage,
          user_id: current_user?.id,
        },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [access_token, finalImage, current_user]);

  useEffect(() => {
    if (success) window.location.reload();
  }, [success]);

  useEffect(() => {
    if (error) toast.error("Something went wrong");
  }, [error]);

  return (
    <div className="max-w-screen min-h-[200px] sm:w-[500px] text-sm sm:text-md sm:aspect-[5/2] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-3 gap-2 grid xs:grid-cols-[1fr_2fr] shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] relative">
      <button
        onClick={() => closeSetting()}
        className="w-[30px] aspect-square rounded-full bg-blue-100 hover:bg-blue-200 text-blue-500 flex justify-center items-center absolute right-3 top-3"
      >
        <i className="fa fa-close"></i>
      </button>

      <div className=" flex justify-center items-center p-1">
        <div className="max-w-[150px] w-full aspect-square rounded-full overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={
              image
                ? image
                : "https://edge.sitecorecloud.io/afmic-3e9239cf/media/project/amfam/public/agent-websites/nophotoavailable.svg?iar=0"
            }
            alt="chat-image"
          />
        </div>
      </div>
      <div className=" grid grid-rows-[1fr_3.5fr]">
        <span className="font-semibold text-md text-center flex justify-center items-center">
          Change profile image
        </span>
        <form onSubmit={(e) => changeImage(e)} className=" grid grid-rows-2">
          <div className="form-group p-[11px] grid">
            <input
              type="file"
              ref={imageRef}
              className="hidden"
              onChange={(e) => convertImage(e)}
            />
            <button
              className="bg-blue-50 rounded-md hover:bg-blue-100 text-blue-600"
              type="button"
              onClick={() => imageRef.current && imageRef.current.click()}
            >
              Select image
            </button>
          </div>

          <div className="grid grid-cols-2 p-[13px] gap-4">
            <button
              disabled={image === current_user?.image || loading}
              className="rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-stone-100 py-2"
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
              className="py-2 rounded-md bg-stone-100 flex justify-center items-center hover:bg-stone-200"
              onClick={() => closeSetting()}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileImageChange;
