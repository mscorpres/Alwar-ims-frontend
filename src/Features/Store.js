import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice/loginSlice";
import dashboard from "./dasboardSlice";

export const Store = configureStore({
  reducer: {
    login: login,
    dashboard: dashboard,
  },
});
