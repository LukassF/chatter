import React from "react";
import { useAppSelector } from "../store/store";
import { Settings } from "../store/features/availableChatsSlice";
import NameChange from "../pages/dashboard/components/chat/settings/NameChange";
import ImageChange from "../pages/dashboard/components/chat/settings/ImageChange";
import AddUsers from "../pages/dashboard/components/chat/settings/AddUsers";
import CreateChat from "../pages/dashboard/components/chat/create/CreateChat";

const Overlay = () => {
  const current_setting = useAppSelector(
    (state) => state.available_chats.current_setting
  );

  return (
    <>
      {current_setting && (
        <div className="w-screen h-screen bg-white fixed z-[100] bg-opacity-50 overflow-auto px-3 sm:px-10 py-8 sm:py-20">
          {current_setting === Settings.name && <NameChange />}
          {current_setting === Settings.image && <ImageChange />}
          {current_setting === Settings.users && <AddUsers />}

          {current_setting === Settings.create && <CreateChat />}
        </div>
      )}
    </>
  );
};

export default Overlay;
