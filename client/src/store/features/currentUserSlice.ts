import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit/react";
import axios from "axios";
import { BACKEND_URL } from "../../utils/api/constants";
import { store } from "../store";
import { jwtDecode } from "jwt-decode";

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

export const fetchUser = createAsyncThunk("fetch_user", async (user: User) => {
  // if (!user.image) return;

  const state = store.getState();
  let access_token_st = state.tokens.access_token;
  const refresh_token = state.tokens.refresh_token;

  if (!access_token_st) throw new Error("No token");

  let decoded_token = jwtDecode(access_token_st);
  if (decoded_token.exp! * 1000 < new Date().getTime()) {
    try {
      const { data } = await axios.post(BACKEND_URL + "auth/refresh", {
        refresh_token,
      });

      access_token_st = data.access_token;

      window.localStorage.setItem(
        "access_token",
        JSON.stringify(data.access_token)
      );
    } catch (err) {
      // console.log(err);
      window.localStorage.removeItem("access_token");
      window.localStorage.removeItem("refresh_token");
    }
  }

  try {
    const data = await axios.get(
      BACKEND_URL + "api/users/getuser",

      {
        headers: { Authorization: "Bearer " + access_token_st },
      }
    );

    return data.data;
  } catch (err) {
    return err;
  }
});

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
      fetchUser.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.user = action.payload;
      }
    );

    builder.addCase(fetchUser.rejected, (state) => {
      state.user = null;
    });
  },
});

export default userSlice.reducer;
export const { setCurrentUser } = userSlice.actions;
