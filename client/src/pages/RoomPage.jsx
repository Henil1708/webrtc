import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { setSocket } from "../redux/actions/socketActions";
import { ROOM_SETUP_STATUS } from "../utils/constants";
import RoomLayout from "../layouts/RoomLayout";
import {
  ChevronDown,
  Clipboard,
  DiscIcon,
  LeafyGreen,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import DeviceSelector from "../components/DeviceSelector";
import VideoCall from "../components/VideoCall";
import Calling from "../components/Calling";
import IncomingCall from "../components/IncomingCall";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

const RoomPage = ({ caller, onEndCall }) => {
  const dispatch = useDispatch();
  const roomId = window.location.pathname.split("/").pop();
  const email = localStorage.getItem("email");
  const socket = useSelector((state) => state.socket.socket);
  const remoteVideo = useRef(null);
  const localVideo = useRef(null);

  const [remoteStream, setRemoteStream] = useState(null);

  const [peerConnection, setPeerConnection] = useState(null);
  const peerConnectionRef = useRef(null);
  const [audioMediaDevices, setAudioMediaDevices] = useState([]);
  const [videoMediaDevices, setVideoMediaDevices] = useState([]);
  const [remoteOffer, setRemoteOffer] = useState(null);
  const [mediaPermissions, setMediaPermissions] = useState({
    audio: false,
    video: false,
  });
  const [roomSetupStatus, setRoomSetupStatus] = useState(
    ROOM_SETUP_STATUS.MEDIA_PERMISSION
  );
  const [participants, setParticipants] = useState([]); // new for tracking participants

  // --- Helper functions ---
  const createSocketConnection = useCallback(() => {
    console.log("Trying to connect to socket...");
    const newSocket = io("http://localhost:8001");
    dispatch(setSocket(newSocket));
  }, [dispatch]);

  const handleUserJoined = useCallback((joinedEmail) => {
    console.log(`${joinedEmail} joined the room`);
    setParticipants((prev) => [...prev, joinedEmail]);
  }, []);

  const handleCallEnding = useCallback(() => {
    console.log("Call Ending");
    peerConnectionRef.current.close();
    socket.emit("message", {
      type: "end-call",
      roomId,
    });
    peerConnectionRef.current = null;
    setRoomSetupStatus(ROOM_SETUP_STATUS.ROOM_READY);
  }, [socket, roomId]);

  const handleCandidate = async (candidate) => {
    try {
      if (!peerConnectionRef.current) {
        console.error("no peerconnection");
        return;
      }
      if (!candidate) {
        await peerConnectionRef.current.addIceCandidate(null);
      } else {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleCreatePeerConnectionAndMakeOffer = useCallback(async () => {
    if (peerConnectionRef.current) {
      console.log("Peer Connection already established");
      return;
    }

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("message", {
          type: "candidate",
          candidate: e.candidate.candidate,
          sdpMid: e.candidate.sdpMid,
          sdpMLineIndex: e.candidate.sdpMLineIndex,
          roomId,
        });
      }
    };
    pc.ontrack = (e) => {
      console.log("@@ remote streams", e.streams);
      setRemoteStream(e.streams[0]);
    };
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: { echoCancellation: true },
    });

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    localStream.getTracks().forEach((track) => track.stop());

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    return offer;
  }, [peerConnectionRef, roomId, socket]);

  const disconnectPeerConnection = () => {
    if (peerConnectionRef.current) {
      // Stop and remove tracks (if necessary)
      peerConnectionRef.current.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnectionRef.current.getReceivers().forEach((receiver) => {
        if (receiver.track) {
          receiver.track.stop();
        }
      });

      // Close the peer connection
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleStartCall = useCallback(async () => {
    if (!socket) return;

    const offer = await handleCreatePeerConnectionAndMakeOffer();
    if (offer) {
      socket.emit("message", { type: "request-call", email, roomId, offer });
      setRoomSetupStatus(ROOM_SETUP_STATUS.CALLING);
    }
  }, [socket, email, roomId]);

  const handleCallRequest = useCallback((data) => {
    setRemoteOffer(data.offer);
    setRoomSetupStatus(ROOM_SETUP_STATUS.INCOMING_CALL);
  }, []);

  const handleAcceptCall = useCallback(async () => {
    if (!remoteOffer) return;

    console.log("Incoming call request received");
    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;
    pc.onicecandidate = (e) => {
      const message = {
        type: "candidate",
        candidate: null,
        roomId,
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }
      socket.emit("message", message);
    };
    pc.ontrack = (e) => {
      console.log("@@ remote streams", e.streams);
      setRemoteStream(e.streams[0]);
    };
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: { echoCancellation: true },
    });
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
    localStream.getTracks().forEach((track) => track.stop());
    await pc.setRemoteDescription(remoteOffer);

    const answer = await pc.createAnswer();
    socket.emit("message", { type: "accept-call", email, roomId, answer });
    await pc.setLocalDescription(answer);
    setRoomSetupStatus(ROOM_SETUP_STATUS.ONGOING_CALL);
  }, [email, remoteOffer, roomId, socket]);

  const handleCallAccepted = async (data) => {
    console.log(data);
    if (!peerConnectionRef.current) return;

    await peerConnectionRef.current.setRemoteDescription(data.answer);
    setRoomSetupStatus(ROOM_SETUP_STATUS.ONGOING_CALL);
  };

  const handleCallEnded = (data) => {
    console.log("Call Ending");
    peerConnectionRef.current.close();

    peerConnectionRef.current = null;
    setRoomSetupStatus(ROOM_SETUP_STATUS.ROOM_READY);
  };

  const handleSocketMessages = useCallback(
    (data) => {
      if (!socket) return;

      switch (data.type) {
        case "candidate":
          handleCandidate(data);
          break;
        case "call-request":
          console.log("@@ call request", data);
          handleCallRequest(data);
          break;
        case "accept-call":
          console.log("@@ accept call");
          handleCallAccepted(data);
          break;
        case "end-call":
          handleCallEnded(data);
          break;
        default:
          console.log("Unknown message type:", data);
      }
    },
    [socket, peerConnectionRef]
  );

  const handleSocketDisconnect = () => {
    console.log("@@ socket disconnected");
    // setRoomSetupStatus(ROOM_SETUP_STATUS.ROOM_DISCONNECTED);
  };

  const handleCopyCallInfo = () => {
    navigator.clipboard.writeText(`${window.location.host}?rID=${roomId}`);
  };

  const handleRoomInfo = (roomInfo) => {
    console.log("Connected to room:", roomInfo);
    if (roomInfo?.participants) {
      setParticipants(roomInfo.participants);
    }
  };

  const setupSocketListeners = useCallback(() => {
    if (!socket) return;

    console.log("Socket connected:", socket.id);
    socket.emit("join-room", { roomId, email });

    socket.on("user-joined", handleUserJoined);

    socket.on("room-info", handleRoomInfo);

    socket.on("message", handleSocketMessages);
    socket.on("disconnect", handleSocketDisconnect);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("room-info", handleRoomInfo);
      socket.off("message", handleSocketMessages);
      socket.off("disconnect", handleSocketDisconnect);
    };
  }, [socket, roomId, email, handleUserJoined, handleSocketMessages]);

  const getMediaPermissions = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setMediaPermissions((prev) => ({ ...prev, audio: true }));

      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioMediaDevices(
        devices.filter((device) => device.kind === "audioinput")
      );
      audioStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing audio devices:", error);
      setMediaPermissions((prev) => ({ ...prev, audio: false }));
    }

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setMediaPermissions((prev) => ({ ...prev, video: true }));

      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoMediaDevices(
        devices.filter((device) => device.kind === "videoinput")
      );
      videoStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing video devices:", error);
      setMediaPermissions((prev) => ({ ...prev, video: false }));
    }

    setRoomSetupStatus(ROOM_SETUP_STATUS.ROOM_READY);
  }, []);

  // --- Effects ---
  useEffect(() => {
    if (!socket) {
      createSocketConnection();
    }
  }, [socket, createSocketConnection]);

  useEffect(() => {
    if (socket) {
      const cleanup = setupSocketListeners();
      getMediaPermissions();
      return cleanup;
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      // disconnectPeerConnection();
    };
  }, []);

  useEffect(() => {
    console.log("@@ peerConnection", peerConnectionRef);
  }, [peerConnectionRef]);

  // --- Rendering Logic ---
  const showStartCallButton = participants.length > 1; // Show only if others joined

  return (
    <RoomLayout>
      {roomSetupStatus === ROOM_SETUP_STATUS.MEDIA_PERMISSION && (
        <div className="permission-container">Checking for permissions</div>
      )}

      {roomSetupStatus === ROOM_SETUP_STATUS.ROOM_READY && (
        <div className="idle-container">
          <h1>Video Call App</h1>
          <p>Ready to make a call</p>
          {showStartCallButton ? (
            <button onClick={handleStartCall} className="start-call-button">
              Start a call
            </button>
          ) : (
            <div>
              <button onClick={handleCopyCallInfo} className="copy-call-button">
                <Clipboard /> Copy the link
              </button>
            </div>
          )}
        </div>
      )}
      {roomSetupStatus === ROOM_SETUP_STATUS.INCOMING_CALL && (
        <IncomingCall onAccept={handleAcceptCall} />
      )}
      {roomSetupStatus === ROOM_SETUP_STATUS.ROOM_DISCONNECTED && (
        <div className="idle-container">
          <DiscIcon />
          <h1>Room Disconnected</h1>
          <p>Will be connected shortly</p>
        </div>
      )}
      {roomSetupStatus === ROOM_SETUP_STATUS.ROOM_CONNECTED && (
        <div className="idle-container">
          <LeafyGreen />
          <h1>Room Connected</h1>
          <p>Process will start shortly</p>
        </div>
      )}

      {roomSetupStatus === ROOM_SETUP_STATUS.CALLING && <Calling />}

      {roomSetupStatus === ROOM_SETUP_STATUS.ONGOING_CALL && (
        <VideoCall
          caller={caller}
          videoMediaDevices={videoMediaDevices}
          audioMediaDevices={audioMediaDevices}
          onEndCall={handleCallEnding}
          mediaPermissions={mediaPermissions}
          remoteVideoStream={remoteStream}
          localVideoRef={localVideo}
          peerConnection={peerConnectionRef.current}
        />
      )}
    </RoomLayout>
  );
};

export default RoomPage;
