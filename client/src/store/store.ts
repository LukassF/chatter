import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./features/currentUserSlice";
import { availableChatsSlice } from "./features/availableChatsSlice";
import { tokenSlice } from "./features/tokensSlice";
import { messSlice } from "./features/messageSlice";

export const store = configureStore({
  reducer: combineReducers({
    current_user: userSlice.reducer,
    available_chats: availableChatsSlice.reducer,
    tokens: tokenSlice.reducer,
    messages: messSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
