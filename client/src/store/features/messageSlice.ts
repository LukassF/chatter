import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";

interface MessageState {
  image_fs: boolean;
  image: string | undefined;
}

const initialState: MessageState = {
  image_fs: false,
  image: undefined,
};

// export const fetchContent = createAsyncThunk("fetch", async () => {
//   const data = await fetch("https://random-data-api.com/api/v2/beers");
//   const res = await data.json();

//   return res;
// });

export const messSlice = createSlice({
  name: "mess",
  initialState,
  reducers: {
    toggleFS: (state, action: PayloadAction<boolean>) => {
      state.image_fs = action.payload;
    },
    setImage: (state, action: PayloadAction<string | undefined>) => {
      state.image = action.payload;
    },
  },
});

export default messSlice.reducer;
export const { toggleFS, setImage } = messSlice.actions;
