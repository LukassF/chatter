import React from "react";
import { useAppSelector } from "../store/store";
import { Settings } from "../store/features/availableChatsSlice";
import NameChange from "../pages/dashboard/components/chat/settings/NameChange";
import ImageChange from "../pages/dashboard/components/chat/settings/ImageChange";
import AddUsers from "../pages/dashboard/components/chat/settings/AddUsers";

const Overlay = () => {
  const current_setting = useAppSelector(
    (state) => state.available_chats.current_setting
  );

  return (
    <>
      {current_setting && (
        <div className="w-screen h-screen bg-white fixed z-10 bg-opacity-50 flex justify-center items-center overflow-auto">
          {current_setting === Settings.name && <NameChange />}
          {current_setting === Settings.image && <ImageChange />}
          {current_setting === Settings.users && <AddUsers />}
        </div>
      )}
    </>
  );
};

export default Overlay;
