import { PayloadAction, createSlice } from "@reduxjs/toolkit";

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
}

const initialState: ChatState = {
  chats: [],
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
  },
});

export default availableChatsSlice.reducer;
export const { addChats, setChats } = availableChatsSlice.actions;
