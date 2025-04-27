import { Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";

import "./global.css";
import "./index.css";
import "./App.css";

import { useEffect } from "react";
import RoomPage from "./pages/RoomPage";

function App() {
  const userEmail = localStorage.getItem("email");
  const roomId = localStorage.getItem("roomId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail && window.location.pathname.includes("/room")) {
      navigate("/");
    } else if (userEmail && roomId && window.location.pathname === "/") {
      navigate(`/room/${roomId}`);
    }
  }, [navigate, userEmail, roomId]);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomName" element={<RoomPage />} />
        <Route path="*" element={<>404 Page not Found</>} />
      </Routes>
    </div>
  );
}

export default App;
