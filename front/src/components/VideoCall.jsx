import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const VideoCall = ({
  currentUser,
  recipientUser,
  onEndCall,
  incomingOffer,
}) => {
  const [callStatus, setCallStatus] = useState(
    incomingOffer ? "incoming" : "idle"
  );
  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socketRef.current.emit("register", currentUser);
    console.log("VideoCall socket registered with username:", currentUser);

    // Set up socket event listeners
    socketRef.current.on("call_incoming", handleIncomingCall);
    socketRef.current.on("call_accepted", handleCallAccepted);
    socketRef.current.on("call_ice_candidate", handleNewICECandidate);
    socketRef.current.on("call_ended", handleCallEnded);

    // Initialize media
    initializeMedia();

    // If there's an incoming offer, process it
    if (incomingOffer) {
      processIncomingOffer(incomingOffer);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      endCall(true);
    };
  }, [currentUser]);

  // Initialize video streams when component mounts
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // If this is an incoming call, prepare the peer connection
      if (incomingOffer) {
        await setupPeerConnection(stream);
      }

      // If we're initiating the call, startCall will be triggered by button
      if (callStatus === "calling") {
        startCall(stream);
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert(
        "Failed to access camera and microphone. Please check permissions."
      );
      onEndCall();
    }
  };

  const setupPeerConnection = async (stream) => {
    const peerConnection = new RTCPeerConnection(configuration);
    peerConnectionRef.current = peerConnection;

    stream
      .getTracks()
      .forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("call_ice_candidate", {
          to: recipientUser,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return peerConnection;
  };

  // Process the incoming offer if component was initialized with one
  const processIncomingOffer = async (offer) => {
    try {
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      socketRef.current.emit("call_accepted", {
        to: recipientUser,
        answer: answer,
      });

      setCallStatus("active");
    } catch (error) {
      console.error("Error processing incoming offer:", error);
      endCall();
    }
  };

  const startCall = async () => {
    try {
      setCallStatus("calling");

      // If we already have a local stream, use it
      const stream =
        localStream ||
        (await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        }));

      if (!localStream) {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      const peerConnection = await setupPeerConnection(stream);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit("call_user", {
        to: recipientUser,
        from: currentUser,
        offer: offer,
      });
    } catch (error) {
      console.error("Error starting call:", error);
      endCall();
    }
  };

  const handleIncomingCall = async ({ from, offer }) => {
    try {
      if (from !== recipientUser) return;

      setCallStatus("incoming");

      // If we already have a local stream, use it
      const stream =
        localStream ||
        (await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        }));

      if (!localStream) {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }

      const peerConnection = await setupPeerConnection(stream);

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketRef.current.emit("call_accepted", {
        to: from,
        answer: answer,
      });

      setCallStatus("active");
    } catch (error) {
      console.error("Error handling incoming call:", error);
      endCall();
    }
  };

  const handleCallAccepted = async ({ answer }) => {
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      setCallStatus("active");
    } catch (error) {
      console.error("Error handling call acceptance:", error);
      endCall();
    }
  };

  const handleNewICECandidate = ({ candidate }) => {
    try {
      if (!peerConnectionRef.current || !candidate) return;
      peerConnectionRef.current
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((err) => console.error("Error adding ICE candidate:", err));
    } catch (error) {
      console.error("Error processing ICE candidate:", error);
    }
  };

  const handleCallEnded = () => {
    endCall();
  };

  const acceptCall = () => {
    // This is handled in the incoming call flow
    setCallStatus("active");
  };

  const endCall = (silent = false) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);

    if (!silent && (callStatus === "active" || callStatus === "calling")) {
      socketRef.current?.emit("call_end", { to: recipientUser });
    }

    setCallStatus("idle");

    if (onEndCall) onEndCall();
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="absolute inset-0 bg-black">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              {callStatus === "calling"
                ? "Calling..."
                : callStatus === "incoming"
                ? "Incoming call..."
                : "Waiting for connection..."}
            </div>
          )}
        </div>

        {/* Local Video */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-1/4 h-1/4 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-8">
        {callStatus === "idle" && (
          <button
            onClick={startCall}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4"
          >
            Start Call
          </button>
        )}

        {callStatus === "incoming" && (
          <>
            <button
              onClick={acceptCall}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4"
            >
              Accept
            </button>
            <button
              onClick={endCall}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4"
            >
              Decline
            </button>
          </>
        )}

        {(callStatus === "active" || callStatus === "calling") && (
          <button
            onClick={() => endCall()}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;
