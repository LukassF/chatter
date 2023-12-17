import React from "react";
import { Message } from "../../../../utils/types";
import { useAppSelector } from "../../../../store/store";

const IndividualMessage = ({ item }: { item: Message }) => {
  const current_user = useAppSelector((state) => state.current_user.user);

  return (
    <div
      style={{
        alignSelf: item.user_id
          ? current_user?.id === item.user_id
            ? "flex-end"
            : "flex-start"
          : "center",
        fontSize: !item.user_id ? "10px" : "15px",
      }}
      className={`${
        item.user_id
          ? current_user?.id === item.user_id
            ? "bg-blue-500 text-white text-right pl-3 pr-2"
            : "bg-stone-200 text-left pr-3 pl-2"
          : ""
      } py-1 ${!item.image ? "rounded-xl" : "rounded-lg"}`}
    >
      {item.image && (
        <div className="h-[90px] w-[120px] relative mb-2">
          <img
            src={item.image}
            alt="message_image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}
      {item.content}
    </div>
  );
};

export default IndividualMessage;
