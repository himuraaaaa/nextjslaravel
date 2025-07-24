import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const SIGNALING_SERVER_URL = 'http://localhost:3001';
const API_BASE = 'http://localhost:8000/api';

// Nonaktifkan fitur chat user
const UserChatBox = () => null;

export default UserChatBox; 