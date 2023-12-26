import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  Settings,
  setCurrentSetting,
} from "../../../../store/features/availableChatsSlice";

const ProfilePopover = ({
  setPopover,
}: {
  setPopover: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  return (
    <div className="w-screen h-screen xs:w-[300px] overflow-y-auto xs:h-[450px] xs:max-h-[92vh] xs:rounded-xl shadow-[2px_2px_35px_12px_rgba(0,0,0,0.12)] bg-white fixed left-0 xs:left-[7vw]  bottom-0 xs:my-[7vh] z-[100] p-2  ">
      <button
        onClick={() => setPopover(false)}
        className="absolute left-2 top-2 w-[25px] aspect-square hover:bg-blue-200 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center"
      >
        <i className="fa fa-close text-xs"></i>
      </button>

      <div className="flex flex-col mt-3">
        <div className="py-3 flex flex-col justify-center items-center">
          <div className="h-[70px] aspect-square rounded-full overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src={
                current_user?.image
                  ? current_user.image
                  : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
              }
              alt=""
            />
          </div>
          <h2 className="font-semibold text-lg mt-2">
            {current_user?.username}
          </h2>
          <p className="font-light text-stone-500 text-sm -mt-1">
            {current_user?.email}
          </p>
        </div>
        <hr></hr>

        <div className="flex flex-col gap-1 items-stretch [&>*]:text-left  [&>*]:rounded-md py-2">
          <button
            onClick={() => dispatch(setCurrentSetting(Settings.username))}
            className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
          >
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="fa fa-pencil"></i>
            </div>
            Change name
          </button>

          <button
            onClick={() => dispatch(setCurrentSetting(Settings.user_image))}
            className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
          >
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="fa fa-image"></i>
            </div>
            Change profile image
          </button>

          <button
            onClick={() => dispatch(setCurrentSetting(Settings.password))}
            className="min-h-[50px] px-3 py-2 hover:bg-stone-100 flex justify-start items-center gap-2 font-light text-sm"
          >
            <div className="h-full min-h-[30px] aspect-square bg-blue-100 text-xs rounded-full flex justify-center items-center text-blue-500 ">
              <i className="far fa-address-book"></i>
            </div>
            Change password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopover;
