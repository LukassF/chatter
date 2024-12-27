import { FC, useMemo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  setMessages,
  setSelectedChat,
  toggleSettings,
} from "../../../../store/features/availableChatsSlice";
import ChatImage from "./individual/ChatImage";
import MessageInput from "../messaging/MessageInput";
import MessageLog from "../messaging/MessageLog";
import { setImage, toggleFS } from "../../../../store/features/messageSlice";

const ChatBox: FC = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );
  const current_user = useAppSelector((state) => state.current_user.user);
  const image_fs = useAppSelector((state) => state.messages.image_fs);
  const selected_image = useAppSelector((state) => state.messages.image);

  const [loading, setLoading] = useState<boolean>(false);

  const alternateName = useMemo(() => {
    const names = selected_chat?.users
      ?.filter((user) => user.id != current_user?.id)
      .map((val) => val.username)
      .join(", ");
    return names;
  }, [selected_chat]);

  useEffect(() => {
    dispatch(toggleFS(false));
    dispatch(setImage(undefined));
  }, [selected_chat]);

  return (
    <section className="w-full h-screen grid grid-rows-[1fr_10fr_1fr] xs:grid-rows-[1fr_8fr_1fr] relative">
      {image_fs && (
        <div className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-75 z-[40] py-20 px-3">
          <button
            onClick={() => {
              dispatch(toggleFS(false));
              dispatch(setImage(undefined));
            }}
            className="absolute left-3 top-3 w-[40px] aspect-square flex justify-center items-center bg-stone-100 hover:bg-stone-200 rounded-full text-lg text-stone-600"
          >
            <i className="fa fa-close"></i>
          </button>
          <img
            src={selected_image}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )}
      <header className="flex bg-white justify-between items-center px-2 shadow-sm relative min-h-[60px]">
        <div className="flex items-center gap-2 h-full relative">
          <button
            onClick={() => {
              dispatch(setSelectedChat(undefined));
              dispatch(setMessages([]));
            }}
            className="hover:bg-stone-100 sm:hidden w-[40px] aspect-square flex justify-center items-center rounded-full"
          >
            <i className="fa fa-arrow-left"></i>
          </button>
          <ChatImage item={selected_chat!} selected={true} />
          <span className="m-0 p-0">
            {selected_chat?.name && selected_chat?.name != '""'
              ? selected_chat?.name
              : alternateName}
          </span>
        </div>
        <button
          className="cursor-pointer text-lg  w-10 rounded-full me-2 aspect-square hover:bg-stone-100 transition-all flex items-center justify-center"
          onClick={() => dispatch(toggleSettings())}
        >
          <div
            className={`w-[60%] h-[60%] rounded-full flex items-center justify-center ${
              settings_open ? "text-white bg-blue-600" : "text-blue-600"
            }`}
          >
            <i className="fa fa-ellipsis"></i>
          </div>
        </button>
      </header>
      <article>
        <MessageLog parent_loading={loading} />
      </article>
      <footer className="bg-white min-h-[60px]">
        <MessageInput setParentLoading={setLoading} />
      </footer>
    </section>
  );
};

export default ChatBox;
