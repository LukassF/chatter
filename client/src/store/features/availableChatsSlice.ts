import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Chat, Message } from "../../utils/types";

export enum Settings {
  name = "name",
  image = "image",
  users = "users",
}

interface ChatState {
  chats: Chat[];
  selected_chat: Chat | undefined;
  messages: Message[] | undefined;
  settings_open: boolean;
  trigger_chat_reload: number;
  trigger_message_reload: number;
  last_seen_message: number | null | undefined;
  current_setting: Settings | null;
}

const initialState: ChatState = {
  chats: [],
  selected_chat: undefined,
  messages: [],
  settings_open: false,
  trigger_chat_reload: 0,
  trigger_message_reload: 0,
  last_seen_message: null,
  current_setting: null,
};

export const availableChatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    triggerChatReload: (state) => {
      state.trigger_chat_reload += 1;
    },
    triggerMessageReload: (state) => {
      state.trigger_message_reload += 1;
    },
    addChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = state.chats.filter(
        (item) => !action.payload.find((val) => val.id == item.id)
      );
      state.chats = [...action.payload, ...state.chats];
    },

    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload.sort(
        (a, b) =>
          Number(new Date(b.updated_at)) - Number(new Date(a.updated_at))
      );
    },
    setCurrentSetting: (state, action: PayloadAction<Settings | null>) => {
      state.current_setting = action.payload;
    },

    pushToTop: (state, action: PayloadAction<number>) => {
      const chat_id = action.payload;

      const chat = state.chats.find((val) => val.id == chat_id);

      if (!chat) return;

      state.chats = [chat, ...state.chats.filter((val) => val.id != chat_id)];
    },

    modifyChat: (state, action: PayloadAction<Record<any, any>>) => {
      const index = state.chats.findIndex(
        (chat: Chat) => chat.id == action.payload.id
      );
      if (action.payload.chat.name)
        state.chats[index].name = action.payload.chat.name;

      if (action.payload.chat.image)
        state.chats[index].image = action.payload.chat.image;

      if (action.payload.chat.users)
        state.chats[index].users = action.payload.chat.users;
    },

    deleteFromChats: (state, action: PayloadAction<any>) => {
      console.log(action.payload, state.chats);
      state.chats = state.chats.filter((chat) => chat.id != action.payload);
    },

    setSelectedChat: (state, action: PayloadAction<Chat | undefined>) => {
      // console.log(action.payload);
      // if (action.payload?.id == state.selected_chat?.id) return;
      state.selected_chat = action.payload;
      // state.settings_open = false;
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload.sort(
        (a, b) =>
          Number(new Date(a.created_at)) - Number(new Date(b.created_at))
      );
    },

    addManyMessages: (state, action: PayloadAction<Message[]>) => {
      let messages;
      if (state.selected_chat)
        messages = action.payload
          .sort(
            (a, b) =>
              Number(new Date(a.created_at)) - Number(new Date(b.created_at))
          )
          .filter(
            (item) =>
              item.chat_id === state.selected_chat?.id &&
              !state.messages?.find((message) => message.id === item.id)
          );

      state.messages?.unshift(...messages!);
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      if (
        !state.selected_chat ||
        action.payload.chat_id === state.selected_chat?.id
      )
        state.messages?.push(action.payload);
    },

    setLastMessage: (state, action: PayloadAction<any>) => {
      // console.log(action.payload);
      const element = state.chats.find(
        (val) => val.id === action.payload.chat_id
      );

      if (!element) return;

      element.message = action.payload.content;
      element.message_created_at = action.payload.created_at;
      element.message_user_id = action.payload.user_id;
      element.last_message_id = action.payload.id;

      state.chats = [
        element,
        ...state.chats.filter((item) => item.id != action.payload.chat_id),
      ];
    },

    setLastSeenMessage: (
      state,
      action: PayloadAction<number | undefined | null>
    ) => {
      state.last_seen_message = action.payload;
    },

    toggleSettings: (state) => {
      console.log("hmm");
      state.settings_open = !state.settings_open;
    },

    setUserHasSeen: (state, action: PayloadAction<any>) => {
      const { user_id, chat_id, last_msg_id } = action.payload;
      if (!chat_id || !user_id) return;

      const chat_idx = state.chats.findIndex((chat) => chat.id == chat_id);

      let chat = state.chats[chat_idx];

      if (!chat.users) return;

      let user_idx = chat.users?.findIndex((user) => user.id == user_id);

      let user = chat.users[user_idx];
      if (!user) return;

      user.has_seen = last_msg_id;

      chat.users[user_idx] = user;
      state.chats[chat_idx] = chat;
    },
  },
});

export default availableChatsSlice.reducer;
export const {
  addChats,
  setChats,
  pushToTop,
  modifyChat,
  deleteFromChats,
  setSelectedChat,
  setMessages,
  addMessage,
  addManyMessages,
  toggleSettings,
  triggerChatReload,
  triggerMessageReload,
  setLastMessage,
  setLastSeenMessage,
  setUserHasSeen,
  setCurrentSetting,
} = availableChatsSlice.actions;
