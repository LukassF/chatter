import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import {
  Chat,
  setSelectedChat,
} from "../../../../../store/features/availableChatsSlice";
import { calculateTime } from "../../../../../utils/calculateTime";
import ChatImage from "./ChatImage";

const ChatCard = ({ item }: { item: Chat }) => {
  // console.log(item);
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );

  const determineUser = useCallback(
    (user_id: number, users: any[] | undefined) => {
      if (!users || !user_id) return;
      const index = users.findIndex((item) => item.id == user_id);
      return users[index];
    },
    []
  );

  const hasNotSeen = useCallback(() => {
    return (
      determineUser(current_user?.id!, item.users)?.has_seen !==
        item.last_message_id && selected_chat?.id != item.id
    );
  }, [item]);

  return (
    <div
      onClick={() => dispatch(setSelectedChat(item))}
      className="grid grid-cols-[1fr_7fr] min-h-[30px] justify-center items-center hover:bg-stone-100 cursor-pointer bg-opacity-70 px-2 transition-all py-1"
    >
      <ChatImage item={item} />
      <div className=" p-[7px] grid grid-rows-[1fr_1.1fr]">
        <h4
          className="m-0 p-0 text-[17px]"
          style={{ fontWeight: hasNotSeen() ? 600 : 400 }}
        >
          {item.name}
        </h4>

        <div className="flex items-center truncate max-w-[100%] overflow-hidden">
          <span
            className="text-sm text-stone-500 overflow-hidden truncate  max-w-[60%]"
            style={{
              fontWeight: hasNotSeen() ? 700 : 300,
              color: hasNotSeen() ? "black" : "rgb(120 ,113 ,108)",
            }}
          >
            <span>
              {determineUser(item.message_user_id, item.users)?.id ===
              current_user?.id
                ? "You: "
                : `${
                    determineUser(item.message_user_id, item.users)?.username
                  }: `}
            </span>
            <span>{item.message ? item.message : "Image sent"} </span>
          </span>
          <span className="text-sm text-stone-500 font-light flex items-center">
            <div className="w-[2.5px] aspect-square rounded-full bg-stone-400 mx-1"></div>
            {calculateTime(item.message_created_at)}
          </span>
        </div>
      </div>

      {/* <ul style={{ listStyle: "none", padding: "0px" }}>
              {item.users?.map((user, id: number) => (
                <li
                  style={{ fontSize: "15px", color: "grey" }}
                  key={index + id}
                >
                  {user.username}
                </li>
              ))}
            </ul> */}
    </div>
  );
};

export default ChatCard;
