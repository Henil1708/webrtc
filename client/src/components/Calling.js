import { PhoneCall } from "lucide-react";
import React from "react";

const Calling = ({ caller }) => {
  return (
    <div className="incoming-call-container">
      <div className="incoming-call-content">
        <div className="caller-avatar-container">
          <div className="avatar-ping"></div>
          <PhoneCall />
        </div>
        <h2>You are Calling...</h2>

        {/* <p className="caller-name">{}</p> */}
        {/* <p className="call-status">you are calling...</p> */}
      </div>
    </div>
  );
};

export default Calling;
