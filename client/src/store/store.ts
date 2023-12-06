import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./features/currentUserSlice";
import { availableChatsSlice } from "./features/availableChatsSlice";

export const store = configureStore({
  reducer: combineReducers({
    current_user: userSlice.reducer,
    available_chats: availableChatsSlice.reducer,
  }),
});

export const useAppDispatch: () => typeof store.dispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector;
