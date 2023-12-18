import React from "react";

const NoChatSelected = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <img
        className="w-[100px]"
        src="https://cdn-icons-png.flaticon.com/512/8699/8699638.png"
        alt="no-chat-selected-image"
      />
      <h1 className="text-xl font-bold">No chat selected</h1>
    </div>
  );
};

export default NoChatSelected;
