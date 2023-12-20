import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export enum Settings {
  name = "name",
  image = "image",
  users = "users",
}

interface SettingsState {
  settings_open: boolean;
  current_setting: Settings | null;
}

const initialState: SettingsState = {
  settings_open: false,
  current_setting: null,
};

export const tokenSlice = createSlice({
  name: "tokens",
  initialState,
  reducers: {
    toggleSettings: (state) => {
      state.settings_open = !state.settings_open;
    },
    setCurrentSetting: (state, action: PayloadAction<Settings | null>) => {
      state.current_setting = action.payload;
    },
  },
});

export default tokenSlice.reducer;
export const { toggleSettings, setCurrentSetting } = tokenSlice.actions;
