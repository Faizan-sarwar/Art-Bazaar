import React, { useState, useEffect, useRef } from 'react';
import {
  Video, Send, X, Loader, AlertCircle,
  Radio, Eye, MessageCircle, Wifi, WifiOff
} from 'lucide-react';
import { io } from 'socket.io-client';
import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';

const SOCKET_URL = 'http://localhost:5000';

export default function BuyerLiveSessions() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [sessions,      setSessions]      = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [chatInput,     setChatInput]     = useState('');
  const [connected,     setConnected]     = useState(false);
  const [joining,       setJoining]       = useState(false);
  const [error,         setError]         = useState('');
  const [hasStream,     setHasStream]     = useState(false);

  const socketRef        = useRef(null);
  const peerConnRef      = useRef(null);
  const chatEndRef       = useRef(null);
  const remoteVideoRef   = useRef(null);
  const activeRoomRef    = useRef(null); // ✅ stable ref for roomId
  const artistSocketRef  = useRef(null); // ✅ stable ref for artist socket id

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Single socket connection on mount ────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports:       ['websocket', 'polling'], // ✅ fallback to polling
      reconnection:     true,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('✅ Socket connected:', socket.id);
      socket.emit('get-sessions');
    });

    socket.on('disconnect', (reason) => {
      setConnected(false);
      console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });

    socket.on('sessions-updated', (list) => {
      setSessions(list || []);
    });

    // ✅ Receive offer from artist — use refs not state
    socket.on('offer', async ({ offer, from }) => {
      console.log('📨 Received offer from:', from);
      artistSocketRef.current = from;
      try {
        const pc = peerConnRef.current;
        if (!pc) {
          console.error('No peer connection available');
          return;
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // ✅ Use ref for roomId — state would be stale
        socket.emit('answer', {
          roomId: activeRoomRef.current,
          answer,
          to:     from,
        });
        console.log('📤 Answer sent to:', from);
      } catch (err) {
        console.error('Offer handling error:', err);
      }
    });

    // ✅ ICE candidates
    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnRef.current && candidate) {
          await peerConnRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error('ICE candidate error:', err);
      }
    });

    socket.on('live-message', (msg) => {
      setMessages(prev => [...prev, { id: Date.now(), ...msg }]);
    });

    socket.on('session-ended', () => {
      setMessages(prev => [...prev, {
        id: Date.now(), system: true,
        text: '🔴 The artist has ended the live session.',
      }]);
      setActiveSession(null);
      setHasStream(false);
      activeRoomRef.current = null;
      artistSocketRef.current = null;
      if (peerConnRef.current) {
        peerConnRef.current.close();
        peerConnRef.current = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on('viewer-count', (count) => {
      setActiveSession(prev => prev ? { ...prev, viewerCount: count } : prev);
    });

    return () => {
      socket.disconnect();
    };
  }, []); // ✅ Only runs once — single socket connection

  // ── Create peer connection ───────────────────────────────
  const createPeerConnection = (roomId) => {
    // Close existing if any
    if (peerConnRef.current) {
      peerConnRef.current.close();
      peerConnRef.current = null;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302'  },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
    });

    // ✅ When stream arrives assign directly to video ref
    pc.ontrack = (e) => {
      console.log('🎥 Remote track received:', e.track.kind);
      if (e.streams && e.streams[0]) {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0];
        }
        setHasStream(true);
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          roomId,
          candidate: e.candidate,
          to:        artistSocketRef.current,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 Peer connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setHasStream(true);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE state:', pc.iceConnectionState);
    };

    peerConnRef.current = pc;
    return pc;
  };

  // ── Join session ─────────────────────────────────────────
  const joinSession = async (session) => {
    setJoining(true);
    setError('');
    setMessages([]);
    setHasStream(false);

    try {
      // ✅ Store roomId in ref immediately
      activeRoomRef.current = session.roomId;

      // Create peer connection
      createPeerConnection(session.roomId);

      // Set active session state
      setActiveSession(session);

      // Tell server we're joining
      socketRef.current.emit('join-live', {
        roomId:     session.roomId,
        viewerName: user.fullName || 'Viewer',
      });

      setMessages([{
        id: Date.now(), system: true,
        text: `✅ Joined ${session.artistName}'s live session! Stream loading...`,
      }]);

      console.log('📡 Joined room:', session.roomId);

    } catch (err) {
      setError('Failed to join: ' + err.message);
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  // ── Leave session ────────────────────────────────────────
  const leaveSession = () => {
    if (peerConnRef.current) {
      peerConnRef.current.close();
      peerConnRef.current = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    activeRoomRef.current   = null;
    artistSocketRef.current = null;
    setActiveSession(null);
    setMessages([]);
    setHasStream(false);
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !socketRef.current || !activeRoomRef.current) return;
    socketRef.current.emit('live-message', {
      roomId:     activeRoomRef.current,
      senderName: user.fullName || 'Viewer',
      text:       chatInput.trim(),
    });
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 min-w-0">
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Live Sessions"
          subtitle={
            activeSession
              ? `Watching ${activeSession.artistName}`
              : `${sessions.length} live now`
          }
        />

        <main className="p-4 md:p-6">

          {/* Connection pill */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 border ${
            connected
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {connected
              ? <><Wifi className="w-3.5 h-3.5" /> Connected</>
              : <><WifiOff className="w-3.5 h-3.5" /> Reconnecting...</>
            }
          </div>

          {/* ── Watching ── */}
          {activeSession ? (
            <div className="grid lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 180px)' }}>

              {/* Video */}
              <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
                <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex-1 min-h-0">

                  {/* ✅ Direct ref — never re-renders */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />

                  {/* Connecting overlay */}
                  {!hasStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                      <div className="text-center">
                        <Loader className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
                        <p className="text-white font-semibold text-sm">Connecting to stream...</p>
                        <p className="text-gray-400 text-xs mt-1">
                          If this takes too long, the artist may need to restart the stream
                        </p>
                      </div>
                    </div>
                  )}

                  {/* LIVE badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  {/* Viewer count */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-1.5 bg-black/60 text-white text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Eye className="w-4 h-4" />
                      {activeSession.viewerCount || 0} watching
                    </div>
                  </div>
                </div>

                {/* Info + leave */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-black text-gray-900">{activeSession.title}</h3>
                    <p className="text-sm text-gray-500">by {activeSession.artistName}</p>
                  </div>
                  <button
                    onClick={leaveSession}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm hover:bg-red-100 transition"
                  >
                    <X className="w-4 h-4" /> Leave
                  </button>
                </div>
              </div>

              {/* Chat */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-white" />
                    <h3 className="font-black text-white text-sm">Live Chat</h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.map(msg => (
                    <div key={msg.id}>
                      {msg.system ? (
                        <p className="text-center text-xs text-gray-400 py-1 bg-gray-50 rounded-lg px-2">
                          {msg.text}
                        </p>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-1.5 mb-0.5">
                            <span className="text-xs font-black text-purple-600">{msg.senderName}</span>
                            <span className="text-xs text-gray-400">{msg.time}</span>
                          </div>
                          <p className="text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2">
                            {msg.text}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-3 border-t border-gray-100 flex-shrink-0">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      placeholder="Say something..."
                      className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-gray-400"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!chatInput.trim()}
                      className="p-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            /* Sessions list */
            sessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center max-w-lg mx-auto mt-8">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Radio className="w-12 h-12 text-indigo-400" />
                </div>
                <h3 className="font-black text-gray-900 text-xl mb-2">No Live Sessions Right Now</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Sessions appear here instantly when an artist starts broadcasting.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <span className="flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-black px-3 py-1.5 rounded-full border border-red-200">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    {sessions.length} LIVE NOW
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map(session => (
                    <div key={session.roomId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                      <div className="relative h-44 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white mx-auto mb-2">
                            {session.artistName?.[0]?.toUpperCase() || '?'}
                          </div>
                          <p className="text-white/80 text-xs font-semibold">{session.artistName}</p>
                        </div>
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          LIVE
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          {session.viewerCount || 0}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-black text-gray-900 text-sm mb-1 line-clamp-2">{session.title}</h3>
                        <p className="text-xs text-gray-400 mb-4">by {session.artistName}</p>
                        <button
                          onClick={() => joinSession(session)}
                          disabled={joining}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200 disabled:opacity-50"
                        >
                          {joining
                            ? <><Loader className="w-4 h-4 animate-spin" /> Joining...</>
                            : <><Video className="w-4 h-4" /> Watch Live</>
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {error && (
            <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 font-semibold text-sm z-50">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}