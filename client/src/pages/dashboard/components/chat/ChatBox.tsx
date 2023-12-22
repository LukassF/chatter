import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  setMessages,
  setSelectedChat,
  toggleSettings,
} from "../../../../store/features/availableChatsSlice";
import ChatImage from "./individual/ChatImage";
import MessageInput from "../messaging/MessageInput";
import MessageLog from "../messaging/MessageLog";

const ChatBox: FC = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );

  return (
    <section className="w-full h-screen grid grid-rows-[1fr_10fr_1fr] xs:grid-rows-[1fr_8fr_1fr] relative">
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
          <h4 className="m-0 p-0">{selected_chat?.name}</h4>
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
        <MessageLog />
      </article>
      <footer className="bg-white min-h-[60px]">
        <MessageInput />
      </footer>
    </section>
  );
};

export default ChatBox;
