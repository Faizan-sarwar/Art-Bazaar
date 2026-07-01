import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, VideoOff, Mic, MicOff, Radio,
  Users, Send, X, Loader, AlertCircle,
  StopCircle, Eye, MessageCircle, Wifi
} from 'lucide-react';
import { io } from 'socket.io-client';
import SellerSidebar from './SellerSidebar';
import SellerHeader  from './SellerHeader';

const SOCKET_URL = 'http://localhost:5000';

// ── Isolated timer — re-renders don't affect video ──────────
function LiveTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const label = h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return (
    <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
      {label}
    </span>
  );
}

// ── Stable video element — never re-mounts ──────────────────
const LocalVideo = React.memo(({ camOn, streamRef }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? 'opacity-0' : 'opacity-100'}`}
    />
  );
});

export default function LiveStudio() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [isLive,       setIsLive]       = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [viewerCount,  setViewerCount]  = useState(0);
  const [messages,     setMessages]     = useState([]);
  const [chatInput,    setChatInput]    = useState('');
  const [camOn,        setCamOn]        = useState(true);
  const [micOn,        setMicOn]        = useState(true);
  const [starting,     setStarting]     = useState(false);
  const [error,        setError]        = useState('');

  const socketRef    = useRef(null);
  const streamRef    = useRef(null);
  const peerConnsRef = useRef({});
  const roomId       = useRef(`room-${user.id}-${Date.now()}`);
  const chatEndRef   = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createPeerConnection = useCallback((viewerSocketId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, streamRef.current)
      );
    }
    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          roomId:    roomId.current,
          candidate: e.candidate,
        });
      }
    };
    peerConnsRef.current[viewerSocketId] = pc;
    return pc;
  }, []);

  const startLive = async () => {
    if (!sessionTitle.trim()) { setError('Please enter a session title'); return; }
    setStarting(true);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;

      // Set live FIRST so video element renders
      setIsLive(true);
      await new Promise(r => setTimeout(r, 150));

      const socket = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('start-live', {
          roomId:       roomId.current,
          artistId:     user.id,
          artistName:   user.fullName,
          artistAvatar: user.avatar || '',
          title:        sessionTitle.trim(),
        });
        setStarting(false);
      });

      socket.on('viewer-joined', async ({ viewerName, viewerSocketId }) => {
        setMessages(prev => [...prev, {
          id: Date.now(), system: true,
          text: `👋 ${viewerName} joined`,
        }]);
        try {
          const pc    = createPeerConnection(viewerSocketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { roomId: roomId.current, offer });
        } catch (err) { console.error('Offer error:', err); }
      });

      socket.on('answer', async ({ answer, from }) => {
        const pc = peerConnsRef.current[from];
        if (pc) {
          try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); }
          catch (err) { console.error('Answer error:', err); }
        }
      });

      socket.on('ice-candidate', ({ candidate }) => {
        Object.values(peerConnsRef.current).forEach(async pc => {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch {}
        });
      });

      socket.on('viewer-count', (count) => setViewerCount(count));
      socket.on('live-message', (msg) => {
        setMessages(prev => [...prev, { id: Date.now(), ...msg }]);
      });

    } catch (err) {
      setError('Could not access camera/microphone. Please allow permissions.');
      setIsLive(false);
      setStarting(false);
    }
  };

  const endLive = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    Object.values(peerConnsRef.current).forEach(pc => pc.close());
    peerConnsRef.current = {};
    socketRef.current?.emit('end-live', { roomId: roomId.current });
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsLive(false);
    setViewerCount(0);
    setMessages([]);
    setCamOn(true);
    setMicOn(true);
  }, []);

  useEffect(() => { return () => { if (isLive) endLive(); }; }, []);

  const toggleCam = () => {
    streamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  };

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return;
    socketRef.current.emit('live-message', {
      roomId:     roomId.current,
      senderName: `${user.fullName} 🎨`,
      text:       chatInput.trim(),
    });
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Live Studio"
          subtitle={isLive ? '🔴 Broadcasting Live' : 'Go live and connect with your audience'}
        />

        <main className="p-4 md:p-6">

          {/* ── Pre-live Setup ── */}
          {!isLive && (
            <div className="max-w-lg mx-auto mt-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Header banner */}
                <div className="bg-indigo-600 from-indigo-600 to-purple-600 p-8 text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30">
                    <Radio className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1 bg-indigo-600">Go Live</h2>
                  <p className="text-indigo-200 text-sm">
                    Broadcast your art session in real time
                  </p>
                </div>

                {/* Form */}
                <div className="p-6">
                  <div className="mb-5">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Session Title *
                    </label>
                    <input
                      value={sessionTitle}
                      onChange={e => { setSessionTitle(e.target.value); setError(''); }}
                      placeholder="e.g. Painting a Sunset in Acrylic"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 placeholder-gray-400"
                      onKeyDown={e => e.key === 'Enter' && startLive()}
                    />
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-red-600 text-sm font-semibold">{error}</p>
                    </div>
                  )}

                  <button
                    onClick={startLive}
                    disabled={starting || !sessionTitle.trim()}
                    className="w-full py-3.5 bg-indigo-700   shadow-indigo-200  from-indigo-600 to-purple-600 text-white rounded-xl font-black text-base hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {starting
                      ? <><Loader className="w-5 h-5 animate-spin" /> Starting...</>
                      : <><Radio className="w-5 h-5" /> Start Live Session</>
                    }
                  </button>

                  {/* Features */}
                  <div className="mt-5 grid grid-cols-3 gap-3">
                    {[
                      { icon: '🎥', label: 'HD Video'  },
                      { icon: '🎙️', label: 'Live Audio' },
                      { icon: '💬', label: 'Live Chat'  },
                    ].map(f => (
                      <div key={f.label} className="p-3 bg-indigo-50 rounded-xl text-center">
                        <div className="text-xl mb-1">{f.icon}</div>
                        <p className="text-xs font-bold text-indigo-700">{f.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Live Session ── */}
          {isLive && (
            <div className="grid lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 140px)' }}>

              {/* Left — Video + Controls */}
              <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">

                {/* Video container */}
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex-1 min-h-0">

                  {/* Stable video — never re-renders */}
                  <LocalVideo camOn={camOn} streamRef={streamRef} />

                  {/* Camera off overlay */}
                  {!camOn && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                      <div className="text-center">
                        <VideoOff className="w-14 h-14 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 font-semibold text-sm">Camera is off</p>
                      </div>
                    </div>
                  )}

                  {/* Top-left — LIVE badge + timer */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                    <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                    <LiveTimer />
                  </div>

                  {/* Top-right — viewer count */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-1.5 bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Eye className="w-4 h-4" />
                      {viewerCount} watching
                    </div>
                  </div>
                </div>

                {/* Controls bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-shrink-0">
                  <div className="flex items-center justify-between flex-wrap gap-3">

                    {/* Cam + Mic toggles */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleCam}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                          camOn
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        {camOn ? 'Cam On' : 'Cam Off'}
                      </button>

                      <button
                        onClick={toggleMic}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                          micOn
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        {micOn ? 'Mic On' : 'Mic Off'}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">{viewerCount}</p>
                        <p className="text-xs text-gray-400">Viewers</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-gray-900 text-lg">
                          {messages.filter(m => !m.system).length}
                        </p>
                        <p className="text-xs text-gray-400">Messages</p>
                      </div>
                    </div>

                    {/* End Live */}
                    <button
                      onClick={endLive}
                      className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition shadow-md shadow-red-200"
                    >
                      <StopCircle className="w-4 h-4" />
                      End Live
                    </button>
                  </div>
                </div>
              </div>

              {/* Right — Live Chat */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">

                {/* Chat header */}
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-white" />
                    <h3 className="font-black text-white text-sm">Live Chat</h3>
                    <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {messages.filter(m => !m.system).length}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-10">
                      <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs">Chat will appear here</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id}>
                        {msg.system ? (
                          <p className="text-center text-xs text-gray-400 py-1 bg-gray-50 rounded-lg px-2">
                            {msg.text}
                          </p>
                        ) : (
                          <div>
                            <div className="flex items-baseline gap-1.5 mb-0.5">
                              <span className="text-xs font-black text-indigo-600">{msg.senderName}</span>
                              <span className="text-xs text-gray-400">{msg.time}</span>
                            </div>
                            <p className="text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                              {msg.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="p-3 border-t border-gray-100 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Say something..."
                      className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!chatInput.trim()}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}