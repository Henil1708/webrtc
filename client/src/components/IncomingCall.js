import { Phone, PhoneOff } from "lucide-react";

export default function IncomingCall({ caller, onAccept, onDecline }) {
  return (
    <div className="incoming-call-container">
      <div className="incoming-call-content">
        <h2>Incoming Call</h2>

        <div className="caller-avatar-container">
          <div className="avatar-ping"></div>
          <img
            src={caller?.avatar || "/placeholder.svg"}
            alt={caller?.name}
            className="caller-avatar"
          />
        </div>

        <p className="caller-name">{caller?.name}</p>
        <p className="call-status">is calling you...</p>

        <div className="call-actions">
          <button onClick={onDecline} className="decline-call-button">
            <PhoneOff />
          </button>

          <button onClick={onAccept} className="accept-call-button">
            <Phone />
          </button>
        </div>
      </div>
    </div>
  );
}
