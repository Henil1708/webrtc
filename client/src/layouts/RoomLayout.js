import React from "react";
import { setSocket } from "../redux/actions/socketActions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const RoomLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("email");
    localStorage.removeItem("roomId");
    navigate("/");
    dispatch(setSocket(null));
  };

  return (
    <main className=" main-container">
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>

      {children}
    </main>
  );
};

export default RoomLayout;
