import { useCallback } from "react";
import { Chat } from "../../../../../store/features/availableChatsSlice";
import { useAppSelector } from "../../../../../store/store";

const ChatImage = ({ item }: { item: Chat }) => {
  const current_user = useAppSelector((state) => state.current_user.user);

  const gridLayout = useCallback(() => {
    if (!current_user) return;

    const num_users = item.users?.filter(
      (item) => item.id != current_user?.id
    ).length;

    if (!num_users) return;

    if (num_users == 1) return "";
    else if (num_users == 2) return "grid-cols-2";
    else if (num_users >= 3) return "grid-cols-2 grid-rows-2";
  }, [item, current_user]);

  return (
    <div className="overflow-hidden  relative rounded-full m-1 w-[47px] aspect-square">
      {item.image && <img src={item.image} alt="chat-image" />}
      {!item.image && (
        <div
          className={`h-full w-full grid divide-x-[1px] divide-y-[1px] ${gridLayout()}`}
        >
          {item.users
            ?.filter((item) => item.id != current_user?.id)
            .map((user, index) => (
              <img
                key={index}
                src={
                  user.image
                    ? user.image
                    : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                }
                alt="profile-image"
                className={`w-full h-full object-cover ${
                  index == 2 &&
                  item.users?.filter((item) => item.id != current_user?.id)
                    .length == 3 &&
                  "col-span-2"
                }`}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default ChatImage;
