import { SET_SOCKET } from "../types";

export const setSocket = (socket) => (dispatch) => {
  dispatch({
    type: SET_SOCKET,
    payload: socket,
  });
};
