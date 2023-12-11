import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Message } from "../../utils/types";

interface ChatMember {
  id: number | null;
  username: string | null;
  email: string | null;
  image: string | null;
}
export interface Chat {
  id: number | null;
  name: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
  users?: ChatMember[];
  message: number;
  message_created_at: string;
  message_user_id: number;
}

interface ChatState {
  chats: Chat[];
  selected_chat: Chat | undefined;
  messages: Message[] | undefined;
  settings_open: boolean;
  trigger_chat_reload: number;
  trigger_message_reload: number;
}

const initialState: ChatState = {
  chats: [],
  selected_chat: undefined,
  messages: undefined,
  settings_open: false,
  trigger_chat_reload: 0,
  trigger_message_reload: 0,
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
      state.selected_chat = action.payload;
      state.settings_open = false;
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload.sort(
        (a, b) =>
          Number(new Date(a.created_at)) - Number(new Date(b.created_at))
      );
    },

    addMessages: (state, action: PayloadAction<Message>) => {
      if (
        !state.selected_chat ||
        action.payload.chat_id === state.selected_chat?.id
      )
        state.messages?.push(action.payload);
    },

    setLastMessage: (state, action: PayloadAction<any>) => {
      const element = state.chats.find(
        (val) => (val.id = action.payload.chat_id)
      );

      if (!element) return;

      element.message = action.payload.message;
      element.message_created_at = action.payload.created_at;
      element.message_user_id = action.payload.user_id;

      state.chats = [
        element,
        ...state.chats.filter((item) => item.id != action.payload.chat_id),
      ];
    },

    toggleSettings: (state, action: PayloadAction<boolean>) => {
      state.settings_open = action.payload;
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
  addMessages,
  toggleSettings,
  triggerChatReload,
  triggerMessageReload,
  setLastMessage,
} = availableChatsSlice.actions;
