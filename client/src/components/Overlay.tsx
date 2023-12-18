import React from "react";
import { useAppSelector } from "../store/store";

const Overlay = () => {
  const current_setting = useAppSelector(
    (state) => state.available_chats.current_setting
  );

  return (
    <>
      {current_setting && (
        <div className="w-screen h-screen bg-white fixed z-10 bg-opacity-50"></div>
      )}
    </>
  );
};

export default Overlay;
