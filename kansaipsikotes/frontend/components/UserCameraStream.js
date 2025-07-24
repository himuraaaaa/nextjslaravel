import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'honest-eagerness-production.up.railway.app';
const SNAPSHOT_INTERVAL_MS = 3 * 60 * 1000; // 3 menit

function UserCameraStream({ attemptId, questionIndex, questionId, userAnswer, ...props }) {
  const videoRef = useRef();
  const socketRef = useRef();
  const peerConnections = useRef({});
  const snapshotIntervalRef = useRef();
  const [mediaError, setMediaError] = useState('');

  useEffect(() => {
    let localStream;
    socketRef.current = io(SIGNALING_SERVER_URL);
    socketRef.current.emit('join', { userId: props.userId, role: 'user' });
    socketRef.current.emit('get-online-users');
    socketRef.current.on('online-users', (users) => {
      Object.entries(users).forEach(([socketId, { userId: adminId, role }]) => {
        if (role === 'admin') {
          if (!peerConnections.current[socketId]) {
            createPeerConnection(socketId, localStream);
          }
        }
      });
    });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(s => {
        localStream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      })
      .catch(err => {
        setMediaError('Akses kamera & mikrofon wajib diizinkan untuk mengikuti ujian. Silakan refresh halaman dan izinkan akses.');
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

    // Mulai interval snapshot
    snapshotIntervalRef.current = setInterval(() => {
      handleSnapshot();
    }, SNAPSHOT_INTERVAL_MS);

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
      socketRef.current.disconnect();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (snapshotIntervalRef.current) {
        clearInterval(snapshotIntervalRef.current);
      }
    };
    // eslint-disable-next-line
  }, [attemptId, questionIndex, questionId, userAnswer]);

  useEffect(() => {
    if (!socketRef.current) return;
    // Listen mute/unmute event dari admin
    socketRef.current.on('mute', () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }
      // Pastikan semua peer connection juga mute
      Object.values(peerConnections.current).forEach(pc => {
        pc.getSenders().forEach(sender => {
          if (sender.track && sender.track.kind === 'audio') {
            sender.track.enabled = false;
          }
        });
      });
    });
    socketRef.current.on('unmute', () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getAudioTracks().forEach(track => {
          track.enabled = true;
        });
      }
      // Pastikan semua peer connection juga unmute
      Object.values(peerConnections.current).forEach(pc => {
        pc.getSenders().forEach(sender => {
          if (sender.track && sender.track.kind === 'audio') {
            sender.track.enabled = true;
          }
        });
      });
    });
    // Cleanup
    return () => {
      socketRef.current.off('mute');
      socketRef.current.off('unmute');
    };
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

  // Ambil snapshot dari video webcam dan upload ke backend
  const handleSnapshot = async () => {
    if (!videoRef.current || !attemptId || mediaError) return;
    try {
      // Buat canvas sementara
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 320;
      canvas.height = videoRef.current.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      // Kirim ke backend
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch('https://nextjslaravel-production.up.railway.app/api/upload-snapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          image: dataUrl,
          attempt_id: attemptId,
          question_index: questionIndex,
          question_id: questionId,
          user_answer: userAnswer
        })
      });
      if (response.ok) {
        const res = await response.json();
      } else {
        const errRes = await response.text();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {mediaError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '32px 24px',
            maxWidth: 400,
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: 18,
            color: '#b91c1c',
          }}>
            {mediaError}
          </div>
        </div>
      )}
      {!mediaError && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, width: 180, height: 135, background: '#222', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }}
            {...props}
          />
        </div>
      )}
    </>
  );
}

export default UserCameraStream; 