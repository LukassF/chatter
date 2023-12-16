import { FC, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../store/store";
import {
  Chat,
  setSelectedChat,
} from "../../../../../store/features/availableChatsSlice";

const ChatCard = ({ item }: { item: Chat }) => {
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

  return (
    <div
      onClick={() => dispatch(setSelectedChat(item))}
      // style={{
      //   display: "flex",
      //   background:
      //     determineUser(current_user?.id!, item.users)?.has_seen !==
      //       item.last_message_id && selected_chat?.id != item.id
      //       ? "grey"
      //       : "transparent",
      // }}
      className="grid grid-cols-[1fr_7fr] min-h-[30px] justify-center items-center hover:bg-stone-100 cursor-pointer bg-opacity-70 px-2 transition-all"
    >
      <div className="overflow-hidden bg-gray-200 relative rounded-full m-1 w-[50px] aspect-square">
        <img
          className="w-full h-full object-cover"
          src={
            item.image
              ? item.image
              : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
          }
          alt=""
        />
      </div>
      <div className=" p-[7px] grid grid-rows-[1fr_1.1fr]">
        <h4 className="m-0 p-0 text-lg">{item.name}</h4>
        {item.message && (
          <div className="text-sm text-stone-500">
            {determineUser(item.message_user_id, item.users)?.id ===
            current_user?.id
              ? "You"
              : determineUser(item.message_user_id, item.users)?.username}
            :{item.message}
          </div>
        )}
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
