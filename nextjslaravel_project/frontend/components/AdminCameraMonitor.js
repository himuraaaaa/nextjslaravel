import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'http://localhost:3001';

const AdminCameraMonitor = () => {
  const [peers, setPeers] = useState({}); // { socketId: { stream, userId } }
  const [onlineUsers, setOnlineUsers] = useState({});
  const socketRef = useRef();
  const peerConnections = useRef({});

  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);
    socketRef.current.emit('join', { userId: 'admin', role: 'admin' });

    // Minta daftar user online saat admin join
    socketRef.current.emit('get-online-users');

    // Terima daftar user online
    socketRef.current.on('online-users', (users) => {
      setOnlineUsers(users);
      setPeers(prev => {
        const updated = { ...prev };
        Object.entries(users).forEach(([socketId, { userId, role }]) => {
          if (role === 'user') {
            updated[socketId] = { ...updated[socketId], userId };
            if (!peerConnections.current[socketId]) {
              createPeerConnection(socketId);
            }
          }
        });
        return updated;
      });
    });

    socketRef.current.on('user-joined', ({ userId, socketId, role }) => {
      if (role === 'user') {
        setPeers(prev => ({ ...prev, [socketId]: { ...prev[socketId], userId } }));
        if (!peerConnections.current[socketId]) {
          createPeerConnection(socketId);
        }
      }
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      let pc = peerConnections.current[from];
      if (!pc) {
        pc = createPeerConnection(from);
      }
      if (data.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        if (data.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit('signal', { to: from, data: { sdp: pc.localDescription } });
        }
      } else if (data.candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    socketRef.current.on('user-left', ({ socketId }) => {
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
        setPeers(prev => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });
      }
    });

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  function createPeerConnection(socketId) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnections.current[socketId] = pc;

    pc.ontrack = (event) => {
      setPeers(prev => {
        const userId = prev[socketId]?.userId || onlineUsers[socketId]?.userId || 'Unknown user';
        return {
          ...prev,
          [socketId]: { ...prev[socketId], stream: event.streams[0], userId }
        };
      });
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit('signal', { to: socketId, data: { candidate: event.candidate } });
      }
    };
    return pc;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {Object.entries(peers).map(([socketId, { stream }]) => (
        <div key={socketId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <video
            autoPlay
            playsInline
            ref={video => {
              if (video && stream) video.srcObject = stream;
            }}
            style={{ width: 240, height: 180, background: '#222', borderRadius: 8 }}
          />
          <div style={{ marginTop: 8, color: '#333', fontSize: 14, wordBreak: 'break-all', textAlign: 'center' }}>
            {peers[socketId]?.userId || onlineUsers[socketId]?.userId || 'Unknown user'}
          </div>
        </div>
      ))}
      {Object.keys(peers).length === 0 && <div>Tidak ada user online.</div>}
    </div>
  );
};

export default AdminCameraMonitor; 