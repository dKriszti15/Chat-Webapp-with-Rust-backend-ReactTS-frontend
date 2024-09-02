import { decode } from "jsonwebtoken";
import { createSlice, configureStore } from '@reduxjs/toolkit'

export function getUserFromToken(token: string) {
  let user = decode(token)

  return user;
} 



const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: ""
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
    }
  }
})

export const { setToken } = userSlice.actions

export const userStore = configureStore({
  reducer: userSlice.reducer
})

export function isLoggedIn(token: string): boolean {
  let user = decode(token) as {
    admin: boolean;
  };

  return user != null;
}

export function isAdmin(token: string): boolean {
  let user = decode(token) as {
    admin: boolean;
  };

  if (user == null) {
    return false;
  }

  return user.admin;
}