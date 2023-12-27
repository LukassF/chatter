import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface TokenState {
  access_token: string | undefined;
  refresh_token: string | undefined;
}

const initialState: TokenState = {
  access_token:
    window.localStorage.getItem("access_token") != "undefined"
      ? JSON.parse(window.localStorage.getItem("access_token")!)
      : undefined,
  refresh_token:
    window.localStorage.getItem("refresh_token") != "undefined"
      ? JSON.parse(window.localStorage.getItem("refresh_token")!)
      : undefined,
};

// export const fetchContent = createAsyncThunk("fetch", async () => {
//   const data = await fetch("https://random-data-api.com/api/v2/beers");
//   const res = await data.json();

//   return res;
// });

export const tokenSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.access_token = action.payload;
      window.localStorage.setItem(
        "access_token",
        JSON.stringify(state.access_token)
      );
    },
    setRefreshToken: (state, action: PayloadAction<string>) => {
      state.refresh_token = action.payload;
      window.localStorage.setItem(
        "refresh_token",
        JSON.stringify(state.refresh_token)
      );
    },
    deleteTokens: (state) => {
      state.access_token = undefined;
      state.refresh_token = undefined;
      window.localStorage.removeItem("refresh_token");
      window.localStorage.removeItem("access_token");
    },
  },
});

export default tokenSlice.reducer;
export const { setAccessToken, setRefreshToken, deleteTokens } =
  tokenSlice.actions;
