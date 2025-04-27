import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setSocket } from "../redux/actions/socketActions";
import { io } from "socket.io-client";

const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rID = searchParams.get("rID");
  const [email, setEmail] = React.useState("");
  const [roomName, setRoomName] = React.useState(rID || "");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const createSocketConnection = () => {
    // Simulate socket connection
    const socket = io("http://localhost:8001");
    dispatch(setSocket(socket));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !roomName) {
      alert("Please fill in all fields");
      return;
    }
    // Store email in local storage
    localStorage.setItem("email", email);
    localStorage.setItem("roomId", roomName);
    // Redirect to the video call page
    createSocketConnection();
    navigate(`/room/${roomName}`);
  };

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <img src="images/webrtc-logo.png" alt="logo" className="logo" />
        <p className="title">Welcome to Video Calling app</p>
        <p className="description">
          This is a simple React application with video calling feature
          developed by Henil Mehta.
        </p>
        <form className="homepage-form" onSubmit={handleSubmit}>
          <input
            placeholder="Enter your email"
            type="email"
            name="email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Enter room name"
            type="text"
            name="roomName"
            required
            disabled={rID}
            defaultValue={rID}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            type="submit"
            className="homepage-button"
            disabled={email === "" || roomName === ""}
          >
            Join Video Call
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
