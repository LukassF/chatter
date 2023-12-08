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
  users?: ChatMember[];
}

interface ChatState {
  chats: Chat[];
  selected_chat: Chat | undefined;
  messages: Message[] | undefined;
}

const initialState: ChatState = {
  chats: [],
  selected_chat: undefined,
  messages: undefined,
};

export const availableChatsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    addChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = state.chats.filter(
        (item) => !action.payload.find((val) => val.id == item.id)
      );
      state.chats = [...state.chats, ...action.payload];
    },

    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },

    setSelectedChat: (state, action: PayloadAction<Chat>) => {
      state.selected_chat = action.payload;
    },

    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    addMessages: (state, action: PayloadAction<Message>) => {
      state.messages?.push(action.payload);
    },
  },
});

export default availableChatsSlice.reducer;
export const { addChats, setChats, setSelectedChat, setMessages, addMessages } =
  availableChatsSlice.actions;
