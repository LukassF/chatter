import { useCallback, useMemo } from "react";
import { ChatMember, Message } from "../../../../utils/types";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { setImage, toggleFS } from "../../../../store/features/messageSlice";

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
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);

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
      return `rounded-2xl ${isMine(item) ? "rounded-tr-md" : "rounded-tl-md"}`;
    else if (first_message_with_image || middle_message)
      return `rounded-md  ${isMine(item) ? "rounded-s-2xl" : "rounded-e-2xl"}`;
    else if (first_message)
      return `rounded-2xl ${isMine(item) ? "rounded-br-md" : "rounded-bl-md"}`;
  }, [item, next, prev]);

  const determineUser = useMemo(() => {
    return chat_users.find((val) => val.id === item.user_id);
  }, [item, chat_users]);

  return (
    <>
      {/* Delta time dividor for far apart messages */}
      {deltaTimePrev > 10 && (
        <div className="self-center text-[11px] sm:text-xs text-stone-500 my-3">
          {new Date(item.created_at).toDateString().slice(0, -4)}
          {" - "}
          {new Date(item.created_at).getHours()}:
          {new Date(item.created_at).getMinutes().toString().padStart(2, "0")}
        </div>
      )}

      {!isMine(item) &&
        item.user_id &&
        (!prev || prev?.user_id != item.user_id || deltaTimePrev > 10) && (
          <div className=" text-[10px] xs:text-[12px] text-stone-400 ml-14">
            {determineUser?.username || "Chatter user"}
          </div>
        )}

      <div
        style={{
          alignSelf: item.user_id
            ? isMine(item)
              ? "flex-end"
              : "flex-start"
            : "center",
          color: !item.user_id ? "grey" : "",
        }}
        className={`grid gap-2 items-end relative ${
          isMine(item)
            ? "pr-3 grid-cols-1 "
            : item.user_id
            ? "pl-3 grid-cols-[minmax(0,27px)_minmax(0,10fr)]"
            : ""
        } ${
          !item.user_id
            ? "text-[8px] sm:text-[10px]"
            : "text-[12px] sm:text-[15px]"
        } max-w-[55%]`}
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
              onClick={() => {
                dispatch(toggleFS(true));
                dispatch(setImage(item.image ? item.image : undefined));
              }}
              className=" w-[200px] aspect-[20/13] max-w-full relative mb-1  overflow-hidden rounded-lg group bg-white cursor-pointer "
            >
              <img
                src={item.image}
                alt="message_image"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                className="group-hover:scale-105 transition-all duration-500"
              />
            </div>
          )}

          {/* Message content */}
          {item.content && (
            <div
              className={` ${
                item.user_id
                  ? isMine(item)
                    ? "bg-blue-500 text-white "
                    : "bg-stone-200 "
                  : ""
              } py-[6px] px-3 w-auto ${elStyle}`}
            >
              {item.content}
            </div>
          )}
        </div>
      </div>
      {chat_users.find((val) => val.has_seen === item.id) && item.user_id && (
        <div
          className={`${
            isMine(item) ? "pr-5 self-end" : "pl-14 self-start"
          } flex gap-[1.5px]`}
        >
          {chat_users
            .filter((user) => user.id != current_user?.id)
            .map((user, index) => {
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
