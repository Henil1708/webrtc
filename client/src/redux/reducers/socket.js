import { RESET_SOCKET, SET_SOCKET } from "../types";

const initialState = {
  socket: null,
};

const socketReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SOCKET:
      return { ...state, socket: action.payload };
    case RESET_SOCKET:
      return { ...state, socket: null };
    default:
      return state;
  }
};
export default socketReducer;
