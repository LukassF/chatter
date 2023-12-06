import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit/react";

export interface Person {
  id: number;
  name: string;
}

interface PersonState {
  persons: Person[];
}

const initialState: PersonState = { persons: [] };

export const fetchContent = createAsyncThunk("fetch", async () => {
  const data = await fetch("https://random-data-api.com/api/v2/beers");
  const res = await data.json();

  return res;
});

export const personSlice = createSlice({
  name: "person",
  initialState,
  reducers: {
    addPerson: (state, action: PayloadAction<{ name: string }>) => {
      state.persons.push({
        id: state.persons.length,
        name: action.payload.name,
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchContent.fulfilled, (state, action) => {
      console.log(action.payload);
    });
  },
});

export default personSlice.reducer;
export const { addPerson } = personSlice.actions;
