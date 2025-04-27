import {
  ChevronDown,
  Mic,
  MicOff,
  Monitor,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DeviceSelector from "./DeviceSelector";
import ReactPlayer from "react-player/lazy";

const VideoCall = ({
  caller,
  audioMediaDevices,
  videoMediaDevices,
  onEndCall,
  remoteVideoStream,
}) => {
  const localVideoRef = useRef(null);

  const remoteVideoRef = useRef(null);

  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [showAudioSelector, setShowAudioSelector] = useState(false);
  const [showVideoSelector, setShowVideoSelector] = useState(false);

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  const toggleAudioSelector = () => {
    setShowAudioSelector(!showAudioSelector);
    if (showVideoSelector) setShowVideoSelector(false);
  };

  const toggleVideoSelector = () => {
    setShowVideoSelector(!showVideoSelector);
    if (showAudioSelector) setShowAudioSelector(false);
  };

  const selectAudioDevice = useCallback((deviceId) => {
    setSelectedAudioDevice(deviceId);
    setShowAudioSelector(false);
  }, []);

  const selectVideoDevice = useCallback((deviceId) => {
    setSelectedVideoDevice(deviceId);
    setShowVideoSelector(false);
  }, []);

  useEffect(() => {
    if (!remoteVideoRef.current.srcObject && remoteVideoStream) {
      remoteVideoRef.current.srcObject = remoteVideoStream;
    }
  }, [remoteVideoStream, remoteVideoRef]);

  return (
    <div className="video-call-container">
      <div className="video-frame">
        {/* Main video (remote user or screen share) */}
        <div className="main-video">
          {isScreenSharing ? (
            <div className="screen-sharing-view">
              <div className="screen-sharing-content">
                <Monitor className="screen-icon" />
                <p>Screen sharing active</p>
              </div>
            </div>
          ) : isVideoOn ? (
            <div className="remote-video-on">
              <video ref={remoteVideoRef} autoPlay playsinline />
            </div>
          ) : (
            <div className="remote-video-off">
              <div className="video-off-content">
                <VideoOff className="video-off-icon" />
                <p>{caller?.name} has turned off their camera</p>
              </div>
            </div>
          )}
        </div>

        {/* Self view (picture-in-picture) */}
        <div className="self-view">
          {isVideoOn ? (
            <div className="self-video-on">
              <video ref={localVideoRef} playsInline autoPlay muted />
            </div>
          ) : (
            <div className="self-video-off">
              <VideoOff className="self-video-off-icon" />
            </div>
          )}
        </div>

        {/* Status indicators */}
        <div className="status-indicators">
          {!isMicOn && (
            <div className="status-indicator mic-off">
              <MicOff className="status-icon" />
              Muted
            </div>
          )}
          {!isVideoOn && (
            <div className="status-indicator video-off">
              <VideoOff className="status-icon" />
              Camera off
            </div>
          )}
          {isScreenSharing && (
            <div className="status-indicator screen-sharing">
              <Monitor className="status-icon" />
              Sharing screen
            </div>
          )}
        </div>

        {/* Call info */}
        <div className="call-info">{caller?.name}</div>
      </div>

      {/* Call controls */}
      <div className="call-controls">
        <div className="control-group">
          <button
            onClick={toggleMic}
            className={`control-button ${
              isMicOn ? "control-active" : "control-inactive"
            }`}
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </button>
          <button
            onClick={toggleAudioSelector}
            className="device-selector-button"
            aria-label="Select microphone"
          >
            <ChevronDown />
          </button>

          {showAudioSelector && (
            <DeviceSelector
              devices={audioMediaDevices}
              selectedDevice={selectedAudioDevice}
              onSelect={selectAudioDevice}
              position="top"
            />
          )}
        </div>

        <div className="control-group">
          <button
            onClick={toggleVideo}
            className={`control-button ${
              isVideoOn ? "control-active" : "control-inactive"
            }`}
          >
            {isVideoOn ? <Video /> : <VideoOff />}
          </button>
          <button
            onClick={toggleVideoSelector}
            className="device-selector-button"
            aria-label="Select camera"
          >
            <ChevronDown />
          </button>

          {showVideoSelector && (
            <DeviceSelector
              devices={videoMediaDevices}
              selectedDevice={selectedVideoDevice}
              onSelect={selectVideoDevice}
              position="top"
            />
          )}
        </div>

        <button
          onClick={toggleScreenShare}
          className={`control-button ${
            isScreenSharing ? "screen-active" : "control-active"
          }`}
        >
          <Monitor />
        </button>

        <button onClick={onEndCall} className="end-call-button">
          <PhoneOff />
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
