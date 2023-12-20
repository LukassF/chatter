import React from "react";
import { Chat, ChatMember } from "../utils/types";
import { useAppDispatch, useAppSelector } from "../store/store";
import {
  Settings,
  setCurrentSetting,
} from "../store/features/availableChatsSlice";

const UsersList = ({ chat }: { chat: Chat | undefined }) => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);

  return (
    <div className="pb-2 border-y-[1.5px]">
      <ul className="w-full flex flex-col items-stretch p-2 gap-1">
        {chat &&
          chat.users!.map((user: ChatMember, index: number) => (
            <li
              key={index}
              className="rounded-md cursor-default hover:bg-stone-100 grid grid-cols-[1fr_3fr_1fr] min-h-[20px]"
            >
              <div className="p-[5px]">
                <div className="w-full aspect-square rounded-full min-w-[35px] ">
                  <img
                    className="w-full h-full object-cover"
                    src={
                      user.image
                        ? user.image
                        : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                    }
                    alt="profile image"
                  />
                </div>
              </div>
              <div className=" flex flex-col items-start justify-center p-[5px]">
                <h3 className="font-medium text-md">{user.username}</h3>
                <p className="font-light text-xs text-muted">{user.email}</p>
              </div>
              <div className="flex justify-center items-center">
                {chat.users?.length! > 2 && user.id != current_user?.id && (
                  <button className="flex justify-center items-center w-2/3 aspect-square rounded-full hover:bg-stone-200">
                    <i className="fa fa-close"></i>
                  </button>
                )}
              </div>
            </li>
          ))}
      </ul>
      <button
        onClick={() => dispatch(setCurrentSetting(Settings.users))}
        className=" text-sm rounded-md hover:bg-stone-100 w-full py-2 px-3 text-left flex justify-start items-center gap-2"
      >
        <div className="px-2 aspect-square rounded-full bg-stone-200 flex justify-center items-center">
          <i className="fa fa-add text-sm"></i>
        </div>{" "}
        Add
      </button>
    </div>
  );
};

export default UsersList;
