import { PayloadAction, createSlice } from "@reduxjs/toolkit";
// import { createAsyncThunk } from "@reduxjs/toolkit/react";

export interface User {
  id: number | null;
  username: string | null;
  email: string | null;
}

interface UserState {
  user: User | null;
}

const initialState: UserState = {
  user: { id: null, username: null, email: null },
};

// export const fetchContent = createAsyncThunk("fetch", async () => {
//   const data = await fetch("https://random-data-api.com/api/v2/beers");
//   const res = await data.json();

//   return res;
// });

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      console.log(action.payload);
    },
  },
});

export default userSlice.reducer;
export const { setCurrentUser } = userSlice.actions;
