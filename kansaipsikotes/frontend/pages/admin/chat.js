import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/router';

const SIGNALING_SERVER_URL = 'http://localhost:3001';
const API_BASE = 'http://localhost:8000/api';

// Nonaktifkan fitur chat admin
export default function AdminChatPage() {
  return <div className="flex items-center justify-center min-h-screen text-2xl text-gray-400">Fitur chat dinonaktifkan</div>;
} 