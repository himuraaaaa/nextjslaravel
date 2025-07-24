import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'honest-eagerness-production.up.railway.app';
const SNAPSHOT_UPLOAD_URL = 'nextjslaravel-production.up.railway.app/api/upload-snapshot'; // Ganti jika endpoint berbeda

const USERS_PER_PAGE = 20;

const AdminCameraMonitor = () => {
  const [peers, setPeers] = useState({}); // { socketId: { stream, userId } }
  const [onlineUsers, setOnlineUsers] = useState({});
  const [muteStatus, setMuteStatus] = useState({}); // { socketId: true/false }
  const [search, setSearch] = useState('');
  const [modalUser, setModalUser] = useState(null); // { socketId, stream, userId }
  const [currentPage, setCurrentPage] = useState(1);
  const socketRef = useRef();
  const peerConnections = useRef({});
  const [snapshotStatus, setSnapshotStatus] = useState({}); // { socketId: 'success'|'error'|'' }
  const prevPagePeers = useRef([]);

  // Pagination logic
  const filteredPeersArr = Object.entries(peers).filter(([_socketId, { userId }]) =>
    userId && String(userId).toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPeersArr.length / USERS_PER_PAGE);
  const paginatedPeers = filteredPeersArr.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );
  const paginatedSocketIds = paginatedPeers.map(([socketId]) => socketId);

  // Disconnect peer connection for users not in current page
  useEffect(() => {
    // Disconnect peers not in paginatedSocketIds
    prevPagePeers.current.forEach(socketId => {
      if (!paginatedSocketIds.includes(socketId) && peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
        setPeers(prev => {
          const copy = { ...prev };
          if (copy[socketId]) delete copy[socketId].stream;
          return copy;
        });
      }
    });
    prevPagePeers.current = paginatedSocketIds;
    // eslint-disable-next-line
  }, [currentPage, search]);

  useEffect(() => {
    socketRef.current = io(SIGNALING_SERVER_URL);
    socketRef.current.emit('join', { userId: 'admin', role: 'admin' });
    socketRef.current.emit('get-online-users');

    socketRef.current.on('online-users', (users) => {
      setOnlineUsers(users);
      setPeers(prev => {
        const updated = { ...prev };
        Object.entries(users).forEach(([socketId, { userId, role }]) => {
          if (role === 'user') {
            updated[socketId] = { ...updated[socketId], userId };
            // Only create peer connection if in current page
            if (
              paginatedSocketIds.includes(socketId) &&
              !peerConnections.current[socketId]
            ) {
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
        if (
          paginatedSocketIds.includes(socketId) &&
          !peerConnections.current[socketId]
        ) {
          createPeerConnection(socketId);
        }
      }
    });

    socketRef.current.on('signal', async ({ from, data }) => {
      // Only handle signal if peer is in current page
      if (!paginatedSocketIds.includes(from)) return;
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
  }, [currentPage, search]);

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

  function handleMuteToggle(socketId) {
    const isMuted = muteStatus[socketId];
    if (isMuted) {
      socketRef.current.emit('unmute-user', { to: socketId });
    } else {
      socketRef.current.emit('mute-user', { to: socketId });
    }
    setMuteStatus(prev => ({ ...prev, [socketId]: !isMuted }));
  }

  // Fungsi snapshot manual
  const handleSnapshot = async (socketId, stream, userId) => {
    setSnapshotStatus(prev => ({ ...prev, [socketId]: 'loading' }));
    try {
      // Ambil frame dari video
      const videoElem = document.getElementById(`video-${socketId}`);
      if (!videoElem) throw new Error('Video not found');
      const canvas = document.createElement('canvas');
      canvas.width = videoElem.videoWidth || 320;
      canvas.height = videoElem.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');

      // Download ke PC admin
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${userId || socketId}_snapshot_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Upload ke backend
      // TODO: Ganti attemptId dengan id attempt user yang benar jika tersedia
      const attemptId = peers[socketId]?.attemptId; // <-- HARUS diganti dengan id attempt user yang sedang dimonitor
      if (!attemptId) {
        setSnapshotStatus(prev => ({ ...prev, [socketId]: 'success' }));
        return; // Hanya download jika tidak ada attemptId
      }
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(SNAPSHOT_UPLOAD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          image: dataUrl,
          attempt_id: attemptId
        })
      });
      if (response.ok) {
        setSnapshotStatus(prev => ({ ...prev, [socketId]: 'success' }));
      } else {
        setSnapshotStatus(prev => ({ ...prev, [socketId]: 'error' }));
      }
    } catch (err) {
      setSnapshotStatus(prev => ({ ...prev, [socketId]: 'error' }));
    }
    setTimeout(() => setSnapshotStatus(prev => ({ ...prev, [socketId]: '' })), 2000);
  };

  // Untuk scalable: hanya render thumbnail (snapshot) dan info user, klik untuk modal live stream
  // const filteredPeers = Object.entries(peers).filter(([_socketId, { userId }]) =>
  //   userId && userId.toLowerCase().includes(search.toLowerCase())
  // );

  return (
    <div>
      <div className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Cari user..."
          className="border rounded-lg px-5 py-3 w-full max-w-md text-lg focus:ring-2 focus:ring-[#001F5A] focus:border-[#001F5A] text-gray-800"
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
        />
        <span className="ml-6 text-lg font-semibold text-[#001F5A]">{filteredPeersArr.length} user online</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedPeers.map(([socketId, { stream, userId }]) => (
          <div key={socketId} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center w-full">
            <div
              className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center border"
              onClick={() => setModalUser({ socketId, stream, userId })}
              title="Klik untuk lihat live stream"
              style={{ cursor: 'pointer' }}
            >
              {stream ? (
                <video
                  id={`video-${socketId}`}
                  ref={video => {
                    if (video && stream) video.srcObject = stream;
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <span className="text-gray-400 text-base">No Stream</span>
              )}
            </div>
            <div className="w-full text-center font-semibold text-[#001F5A] text-base truncate mb-2 break-all">{userId || 'Unknown user'}</div>
            <div className="flex w-full gap-2 justify-center">
              <button
                className={`flex-1 py-1 rounded font-medium text-xs text-white ${muteStatus[socketId] ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={() => handleMuteToggle(socketId)}
              >
                {muteStatus[socketId] ? 'Unmute' : 'Mute'}
              </button>
              <button
                className="flex-1 py-1 rounded font-medium text-xs text-white bg-blue-600 hover:bg-blue-700"
                onClick={() => handleSnapshot(socketId, stream, userId)}
                disabled={!stream || snapshotStatus[socketId] === 'loading'}
              >
                {snapshotStatus[socketId] === 'loading' ? '...' : 'Snapshot'}
              </button>
            </div>
            {snapshotStatus[socketId] === 'success' && (
              <div className="text-green-600 text-xs mt-1">Snapshot berhasil!</div>
            )}
            {snapshotStatus[socketId] === 'error' && (
              <div className="text-red-600 text-xs mt-1">Gagal snapshot</div>
            )}
          </div>
        ))}
        {paginatedPeers.length === 0 && <div className="col-span-full text-center text-[#001F5A] font-semibold text-lg">Tidak ada user online.</div>}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-l-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border border-gray-300 ${currentPage === i + 1 ? 'bg-blue-600 text-white font-bold' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-r-lg border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      )}
      {/* Modal untuk live stream besar */}
      {modalUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 relative max-w-lg w-full flex flex-col items-center">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setModalUser(null)}
            >
              &times;
            </button>
            <div className="w-full flex flex-col items-center">
              <div className="w-full h-64 bg-gray-200 rounded mb-4 flex items-center justify-center">
                {modalUser.stream ? (
                  <video
                    ref={video => {
                      if (video && modalUser.stream) video.srcObject = modalUser.stream;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
                    autoPlay
                    controls
                  />
                ) : (
                  <span className="text-gray-400 text-base">No Stream</span>
                )}
              </div>
              <div className="w-full text-center font-semibold text-[#001F5A] text-base truncate mb-2 break-all">{modalUser.userId || 'Unknown user'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCameraMonitor; 