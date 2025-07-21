import React, { useEffect, useRef, useState } from 'react';

const CameraPreview = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream;
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setError('Kamera tidak dapat diakses. Aktifkan kamera untuk mengikuti tes.');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 180,
      height: 135,
      background: '#222',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {error ? (
        <span style={{ color: 'white', padding: 10, textAlign: 'center' }}>{error}</span>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', borderRadius: 8, objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

export default CameraPreview; 