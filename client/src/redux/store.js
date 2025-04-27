import { combineReducers, configureStore } from "@reduxjs/toolkit";
import socketReducer from "./reducers/socket";

const reducers = combineReducers({
  socket: socketReducer,
});

export default configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // don’t warn or deep‑freeze non‑serializable values:
      serializableCheck: false,
      immutableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
  reducer: reducers,
});
