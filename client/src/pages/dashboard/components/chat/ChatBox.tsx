import { FC, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { toggleSettings } from "../../../../store/features/availableChatsSlice";
import ChatImage from "./individual/ChatImage";
import MessageInput from "../messaging/MessageInput";
import MessageLog from "../messaging/MessageLog";

const ChatBox: FC = () => {
  const dispatch = useAppDispatch();
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const current_user = useAppSelector((state) => state.current_user.user);

  return (
    <section className="w-full h-screen grid grid-rows-[minmax(0,1fr)_minmax(0,8fr)_minmax(0,1fr)]">
      <header className="flex bg-white justify-between items-center px-2 shadow-sm relative">
        <div className="flex items-center gap-2 h-full relative">
          <ChatImage item={selected_chat!} selected={true} />
          <h4 className="m-0 p-0">{selected_chat?.name}</h4>
        </div>
        <button
          className="cursor-pointer text-lg text-blue-600 w-8 rounded-full me-2 aspect-square hover:bg-stone-100 transition-all flex items-center justify-center"
          onClick={() => dispatch(toggleSettings(true))}
        >
          <i className="fa fa-ellipsis"></i>
        </button>
      </header>
      <article>
        <MessageLog />
      </article>
      {/* <MessageLog />
              <MessageInput /> */}
      <footer className="bg-white">
        <MessageInput />
      </footer>
    </section>
  );
};

export default ChatBox;
