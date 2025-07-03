import React, { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'http://localhost:3001';

const UserCameraStream = ({ userId }) => {
  const videoRef = useRef();
  const socketRef = useRef();
  const peerConnections = useRef({});

  useEffect(() => {
    let localStream;
    socketRef.current = io(SIGNALING_SERVER_URL);
    socketRef.current.emit('join', { userId, role: 'user' });

    // Minta daftar user online saat user join
    socketRef.current.emit('get-online-users');

    // Terima daftar user online
    socketRef.current.on('online-users', (users) => {
      Object.entries(users).forEach(([socketId, { userId: adminId, role }]) => {
        if (role === 'admin') {
          if (!peerConnections.current[socketId]) {
            createPeerConnection(socketId, localStream);
          }
        }
      });
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        localStream = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      });

    socketRef.current.on('user-joined', ({ userId: adminId, socketId, role }) => {
      if (role === 'admin') {
        createPeerConnection(socketId, localStream);
      }
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      let pc = peerConnections.current[from];
      if (!pc) {
        pc = createPeerConnection(from, localStream);
      }
      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === 'answer') {
          // done
        }
      } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      socketRef.current.disconnect();
      if (localStream) localStream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  function createPeerConnection(socketId, localStream) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnections.current[socketId] = pc;
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('signal', { to: socketId, data: { candidate: event.candidate } });
      }
    };
    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit('signal', { to: socketId, data: { sdp: pc.localDescription } });
    };
    return pc;
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 180, height: 135, background: '#222', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }}
      />
    </div>
  );
};

export default UserCameraStream; 