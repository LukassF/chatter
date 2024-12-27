const NoChatSelected = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-3">
      <img
        className="w-[100px]"
        src="https://cdn-icons-png.flaticon.com/512/8699/8699638.png"
        alt="no-chat-selected-image"
      />
      <span className="text-xl font-bold">No chat selected</span>
    </div>
  );
};

export default NoChatSelected;
