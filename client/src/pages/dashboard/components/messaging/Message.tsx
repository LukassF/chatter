import React, { useCallback, useMemo } from "react";
import { Message } from "../../../../utils/types";
import { useAppSelector } from "../../../../store/store";
import { ChatMember } from "../../../../store/features/availableChatsSlice";

const IndividualMessage = ({
  item,
  prev,
  next,
  chat_users,
}: {
  item: Message;
  prev: Message | null;
  next: Message | null;
  chat_users: ChatMember[];
}) => {
  // console.log(item);
  const messages = useAppSelector((state) => state.available_chats.messages);
  const current_user = useAppSelector((state) => state.current_user.user);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );

  const deltaTimePrev = useMemo(() => {
    if (!prev) return 11;
    else {
      let delta_minutes =
        (Number(new Date(item.created_at)) -
          Number(new Date(prev.created_at))) /
        1000 /
        60;

      return delta_minutes;
    }
  }, [prev, item]);

  const deltaTimeNext = useMemo(() => {
    if (!next) return 0;
    else {
      let delta_minutes =
        (Number(new Date(next.created_at)) -
          Number(new Date(item.created_at))) /
        1000 /
        60;

      return delta_minutes;
    }
  }, [item, next]);

  const isMine = useCallback(
    (item: any) => {
      return item && current_user?.id === item["user_id"];
    },
    [current_user]
  );

  //message shape according to position
  const elStyle = useMemo(() => {
    const first_message =
      !prev || prev.user_id !== item.user_id || deltaTimePrev > 10;
    const last_message =
      !next || next.user_id !== item.user_id || deltaTimeNext > 10;

    const first_message_with_image = first_message && item.image ? true : false;

    const middle_message =
      !first_message && !last_message && !first_message_with_image;

    const standalone = !!(first_message && last_message && !item.image);
    const standalone_with_image = !!(
      first_message &&
      last_message &&
      item.image
    );

    if (standalone) return "rounded-2xl";
    else if (last_message || standalone_with_image)
      return `rounded-2xl ${isMine(item) ? "rounded-tr-sm" : "rounded-tl-sm"}`;
    else if (first_message_with_image || middle_message)
      return `rounded-sm  ${isMine(item) ? "rounded-s-2xl" : "rounded-e-2xl"}`;
    else if (first_message)
      return `rounded-2xl ${isMine(item) ? "rounded-br-sm" : "rounded-bl-sm"}`;
  }, [item, next, prev]);

  const determineUser = useMemo(() => {
    return chat_users.find((val) => val.id === item.user_id);
  }, [item, chat_users]);

  return (
    <>
      {/* Delta time dividor for far apart messages */}
      {deltaTimePrev > 10 && (
        <div className="self-center text-xs text-stone-500 my-3">
          {new Date(item.created_at).toDateString().slice(0, -4)}{" "}
          {new Date(item.created_at).getHours()}:
          {new Date(item.created_at).getMinutes().toString().padStart(2, "0")}
        </div>
      )}

      {!isMine(item) &&
        item.user_id &&
        (!prev || prev?.user_id != item.user_id || deltaTimePrev > 10) && (
          <div className="text-[12px] text-stone-400 ml-14">
            {determineUser?.username}
          </div>
        )}

      <div
        style={{
          alignSelf: item.user_id
            ? isMine(item)
              ? "flex-end"
              : "flex-start"
            : "center",
          fontSize: !item.user_id ? "10px" : "15px",
          color: !item.user_id ? "grey" : "",
        }}
        className={`flex flex-row gap-2 items-end relative ${
          isMine(item) ? "pr-3" : "pl-3"
        } max-w-[60%]`}
      >
        {!isMine(item) && item.user_id && (
          <div
            className={`rounded-full w-[27px] aspect-square overflow-hidden ${
              !next || next.user_id != item.user_id || deltaTimeNext > 10
                ? "opacity-100"
                : " opacity-0"
            }`}
          >
            <img
              className="w-full h-full object-cover"
              src={
                determineUser?.image
                  ? determineUser.image
                  : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
              }
              alt="profile-image"
            />
          </div>
        )}
        {/* Message image */}
        <div
          className={`flex flex-col ${
            isMine(item) ? "items-end" : "items-start"
          } `}
        >
          {item.image && (
            <div
              className={`h-[130px] w-[200px] relative mb-1  overflow-hidden rounded-lg`}
            >
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

          {/* Message content */}
          {item.content && (
            <div
              className={`${
                item.user_id
                  ? isMine(item)
                    ? "bg-blue-500 text-white text-right "
                    : "bg-stone-200 text-left "
                  : ""
              } py-1 px-3 w-auto ${elStyle}`}
            >
              {item.content}
            </div>
          )}
        </div>
      </div>
      {chat_users.find((val) => val.has_seen === item.id) && (
        <div
          className={`${
            isMine(item) ? "pr-5 self-end" : "pl-14 self-start"
          } flex gap-[1.5px]`}
        >
          {chat_users.map((user, index) => {
            if (user.has_seen === item.id)
              return (
                <div
                  key={index}
                  className="w-[12px] aspect-square rounded-full overflow-hidden"
                >
                  <img
                    className="w-full h-full object-cover"
                    src={
                      user.image
                        ? user.image
                        : "https://img.freepik.com/premium-photo/natural-marble-pattern-background_1258-22160.jpg"
                    }
                    alt="profile-image"
                  />
                </div>
              );
          })}
        </div>
      )}
    </>
  );
};

export default IndividualMessage;
