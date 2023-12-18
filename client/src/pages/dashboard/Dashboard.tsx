import { FC, useEffect, useLayoutEffect, useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import ModifyProfile from "../profile/components/modify/ModifyProfile";
import CreateChat from "./components/chat/create/CreateChat";
import Chats from "./components/chat/Chats";
import MessageLog from "./components/messaging/MessageLog";
import ChatSettings from "./components/chat/settings/ChatSettings";
import MessageInput from "./components/messaging/MessageInput";
import { BACKEND_URL, WEBSOCKET_URL } from "../../utils/api/constants";
import { fetchUser } from "../../store/features/currentUserSlice";
import { decodeToken } from "../../utils/decodeToken";
import { fetchApi } from "../../utils/api/fetchApi";
import { deleteTokens } from "../../store/features/tokensSlice";
import Aside from "./components/other/Aside";
import AvailableChatsSkeleton from "./components/chat/loaders/AvailableChatsSkeleton";
import ChatBox from "./components/chat/ChatBox";
import NoChatSelected from "./components/chat/loaders/NoChatSelected";

const Dashboard: FC = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const refresh_token = useAppSelector((state) => state.tokens.refresh_token);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );
  const messages = useAppSelector((state) => state.available_chats.messages);

  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchData = fetchApi(setSuccess, setError, setLoading);

  const [chatsearch, setChatSearch] = useState<string | null>("");

  useLayoutEffect(() => {
    const user = decodeToken(access_token);
    if (user) dispatch(fetchUser(user));
  }, []);

  useEffect(() => {
    if (
      access_token &&
      current_user &&
      current_user.id &&
      selected_chat &&
      selected_chat.id &&
      messages &&
      messages.length > 0
    )
      fetchData({
        url: BACKEND_URL + "api/chats/toggleseen/" + current_user.id,
        method: "PATCH",
        data: { chat_id: selected_chat.id },
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });
  }, [selected_chat, access_token, current_user, messages]);

  useEffect(() => {
    const ws = new WebSocket(WEBSOCKET_URL);

    if (success) {
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            users: selected_chat?.users,
            user_id: current_user?.id,
            chat_id: selected_chat?.id,
            last_msg_id:
              messages && messages.length > 0
                ? messages[messages?.length - 1].id
                : null,
            type: "hasseen",
          })
        );
      };
    }

    return () => ws.close();
  }, [success]);

  return (
    <main className="grid grid-cols-[1fr_14fr] divide-x-2 overflow-hidden h-screen">
      <Aside />
      <section
        className={`grid grid-cols-[1fr_1.8fr] ${
          settings_open
            ? "lg:grid-cols-[1.2fr_2fr_0.9fr]"
            : "lg:grid-cols-[1.2fr_2.9fr]"
        } divide-x-2`}
      >
        <article className=" py-3 grid grid-rows-[minmax(0,1fr)_minmax(0,4fr)] gap-2 h-screen">
          <div className="flex flex-col gap-2 justify-evenly">
            <div className="flex justify-between items-center px-4">
              <h1 className="text-2xl font-bold">Chats</h1>
              <button className=" p-[10px]  text-blue-400 border-[1.5px] border-blue-400 hover:text-blue-600 hover:border-blue-600  rounded-full aspect-square text-sm flex justify-center items-center opacity-70">
                <i className="fa fa-add"></i>
              </button>
            </div>

            <div className="px-3">
              <input
                onChange={(e) => setChatSearch(e.target.value)}
                type="text"
                placeholder="&#xf002; Search"
                className="form-control py-2 rounded-full text-sm"
                style={{
                  fontFamily: "'Helvetica', FontAwesome, sans-serif",
                  fontStyle: "normal",
                }}
              />
            </div>

            {/* <hr className="mx-3"></hr> */}
          </div>

          {current_user && <Chats search={chatsearch} />}
        </article>
        <article>{selected_chat ? <ChatBox /> : <NoChatSelected />}</article>
        <article className="max-h-screen overflow-hidden">
          {settings_open && <ChatSettings />}
          {/* {current_user?.id && (
            <div>
              {current_user?.username}
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  src={
                    current_user.image
                      ? current_user.image
                      : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                  }
                  alt=""
                />
              </div>
            </div>
          )}
          <hr></hr>
          {current_user && <CreateChat />}
          {selected_chat && (
            <div style={{ display: "flex" }}>
              <div>
                <MessageLog />
                <MessageInput />
              </div>
              {settings_open && <ChatSettings />}
            </div>
          )}
          {current_user && <Chats />} */}
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
