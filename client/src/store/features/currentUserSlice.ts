import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit/react";
import axios from "axios";
import { BACKEND_URL } from "../../utils/api/constants";
import { store } from "../store";

export interface User {
  id: number | null;
  username: string | null;
  email: string | null;
  image: string | null;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: { id: null, username: null, email: null, image: null },
};

export const fetchImage = createAsyncThunk(
  "fetch_image",
  async (user: User) => {
    console.log(user);

    if (!user.image) return;
    const state = store.getState();
    const access_token = state.tokens.access_token;

    try {
      const data = await axios.get(
        BACKEND_URL + "api/users/getimage",

        {
          headers: { Authorization: "Bearer " + access_token },
        }
      );

      return data.data;
    } catch (err) {
      return err;
    }
  }
);

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchImage.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.user = action.payload;
        console.log(state.user);
      }
    );
  },
});

export default userSlice.reducer;
export const { setCurrentUser } = userSlice.actions;
