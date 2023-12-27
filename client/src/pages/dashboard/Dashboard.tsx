import { FC, useEffect, useLayoutEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";

import Chats from "./components/chat/Chats";

import ChatSettings from "./components/chat/settings/ChatSettings";

import { BACKEND_URL, WEBSOCKET_URL } from "../../utils/api/constants";
import { fetchUser } from "../../store/features/currentUserSlice";
import { decodeToken } from "../../utils/decodeToken";
import { fetchApi } from "../../utils/api/fetchApi";

import Aside from "./components/other/Aside";

import ChatBox from "./components/chat/ChatBox";
import NoChatSelected from "./components/chat/loaders/NoChatSelected";
import {
  Settings,
  setCurrentSetting,
} from "../../store/features/availableChatsSlice";

const Dashboard: FC = () => {
  const dispatch = useAppDispatch();
  const current_user = useAppSelector((state) => state.current_user.user);
  const access_token = useAppSelector((state) => state.tokens.access_token);
  const selected_chat = useAppSelector(
    (state) => state.available_chats.selected_chat
  );
  const settings_open = useAppSelector(
    (state) => state.available_chats.settings_open
  );
  const messages = useAppSelector((state) => state.available_chats.messages);

  const [success, setSuccess] = useState<any>(null);
  const [__, setError] = useState<any>(null);
  const [_, setLoading] = useState<boolean>(true);
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
    <main
      className={`grid ${
        selected_chat ? "grid-cols-[1fr]" : "grid-cols-[1fr_16fr]"
      } sm:grid-cols-[1fr_16fr] divide-x-2 overflow-hidden h-screen`}
    >
      <Aside />
      <section
        className={`grid grid-cols-[1fr] sm:grid-cols-[1fr_1.8fr] ${
          settings_open
            ? "lg:grid-cols-[1.1fr_2fr_1fr]"
            : "lg:grid-cols-[1.1fr_3fr]"
        } sm:divide-x-2`}
      >
        <article
          className={`py-3 sm:grid grid-rows-[1fr_6fr] sm:grid-rows-[1fr_4fr] gap-2 h-screen ${
            selected_chat ? "hidden" : "grid"
          }`}
        >
          <div className="flex flex-col gap-2 justify-evenly min-h-[100px]">
            <div className="flex justify-between items-center px-4">
              <h1 className="text-xl sm:text-2xl font-bold">Chats</h1>
              <button
                onClick={() => dispatch(setCurrentSetting(Settings.create))}
                className="p-[8px] sm:p-[10px]  text-blue-400 border-[1.5px] border-blue-400 hover:text-blue-600 hover:border-blue-600  rounded-full aspect-square text-xs sm:text-sm flex justify-center items-center opacity-70"
              >
                <i className="fa fa-add"></i>
              </button>
            </div>

            <div className="px-3">
              <input
                onChange={(e) => setChatSearch(e.target.value)}
                type="text"
                placeholder="&#xf002; Search"
                className="form-control py-2 rounded-full text-xs sm:text-sm"
                style={{
                  fontFamily: "'Helvetica', FontAwesome, sans-serif",
                  fontStyle: "normal",
                }}
              />
            </div>
          </div>

          {current_user && <Chats search={chatsearch} />}
        </article>
        <article>{selected_chat ? <ChatBox /> : <NoChatSelected />}</article>
        <article
          className={`min-w-[300px] lg:min-w-[auto] h-screen z-10 lg:max-h-screen overflow-hidden lg:relative sm:absolute relative bg-white right-0 top-0 transition-transform ${
            settings_open ? "sm:translate-x-0" : "hidden sm:translate-x-full"
          }`}
        >
          {settings_open && <ChatSettings />}
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
