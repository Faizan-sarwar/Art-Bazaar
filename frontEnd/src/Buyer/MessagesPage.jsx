import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Send, Search, Check, CheckCheck, Loader,
  MessageCircle, Paperclip, X, CreditCard,
  Shield, ChevronLeft, Image
} from 'lucide-react';

import BuyerSidebar from './BuyerSidebar';
import BuyerHeader  from './BuyerHeader';
import { messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const BASE_URL = 'http://localhost:5000';

const PAYMENT_TEMPLATES = [
  { label: '💳 Request Payment Details', text: 'Please share your EasyPaisa/bank account details so I can send the payment.' },
  { label: '✅ Payment Sent',            text: 'I have sent the payment. Screenshot attached. Please confirm.' },
  { label: '❓ Order Status',            text: 'Hi! Could you please update me on the status of my order?' },
  { label: '📦 Delivery Query',          text: 'When can I expect my artwork to be delivered?' },
];

export default function MessagesPage() {
  const location = useLocation();

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv,  setSelectedConv]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [messageInput,  setMessageInput]  = useState('');
  const [loadingConvs,  setLoadingConvs]  = useState(true);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [sending,       setSending]       = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [imageFile,     setImageFile]     = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [sendingProof,  setSendingProof]  = useState(false);

  const messagesEndRef = useRef(null);
  const pollRef        = useRef(null);
  const fileInputRef   = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Load conversations ──────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const data = await messageAPI.getConversations();
      return data.conversations || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    const convs = await loadConversations();
    setConversations(convs);
  }, [loadConversations]);

  // ── FIX: depend on location.state so it re-runs on navigation ──
  useEffect(() => {
    const init = async () => {
      setLoadingConvs(true);
      try {
        const data  = await messageAPI.getConversations();
        const convs = data.conversations || [];
        setConversations(convs);

        const targetId = location.state?.conversationId;
        if (!targetId) return;

        // Try to find in loaded list first
        let target = convs.find(c => c._id === targetId);

        // If not found yet (just created), retry once after short delay
        if (!target) {
          await new Promise(r => setTimeout(r, 800));
          const fresh      = await messageAPI.getConversations();
          const freshConvs = fresh.conversations || [];
          setConversations(freshConvs);
          target = freshConvs.find(c => c._id === targetId);
        }

        if (target) setSelectedConv(target);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConvs(false);
      }
    };

    init();
  }, [location.state?.conversationId]); // ← FIX: was [] now depends on conversationId

  // ── Load messages + poll when conversation selected ─────────
  useEffect(() => {
    if (!selectedConv) return;

    const load = async () => {
      setLoadingMsgs(true);
      try {
        const data = await messageAPI.getMessages(selectedConv._id);
        setMessages(data.messages || []);
        refreshConversations();
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMsgs(false);
      }
    };

    load();

    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await messageAPI.getMessages(selectedConv._id);
        setMessages(data.messages || []);
        refreshConversations();
      } catch {}
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, [selectedConv?._id]); // ← correct, only re-run when conversation changes

  // ── Scroll to bottom ────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send text or image ──────────────────────────────────────
  const handleSend = async () => {
    if ((!messageInput.trim() && !imageFile) || !selectedConv || sending) return;

    setSending(true);
    const text = messageInput.trim();
    setMessageInput('');

    const optimistic = {
      _id:         'temp-' + Date.now(),
      senderRole:  'buyer',
      senderName:  user.fullName,
      text,
      image:       imageFile ? URL.createObjectURL(imageFile) : '',
      messageType: imageFile ? 'image' : 'text',
      read:        false,
      createdAt:   new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setImagePreview(null);

    try {
      if (imageFile) {
        await messageAPI.sendImage(selectedConv._id, imageFile, 'image', text);
        setImageFile(null);
      } else {
        await messageAPI.send(selectedConv._id, text);
      }
      const data = await messageAPI.getMessages(selectedConv._id);
      setMessages(data.messages || []);
      refreshConversations();
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  };

  // ── Send payment proof ──────────────────────────────────────
  const handleSendPaymentProof = async () => {
    if (!imageFile || !selectedConv) return;
    setSendingProof(true);
    try {
      await messageAPI.sendImage(selectedConv._id, imageFile, 'payment_proof', '💳 Payment Proof');
      setImageFile(null);
      setImagePreview(null);
      const data = await messageAPI.getMessages(selectedConv._id);
      setMessages(data.messages || []);
      refreshConversations();
    } catch (err) {
      alert('Failed to send: ' + err.message);
    } finally {
      setSendingProof(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const formatTime = (d) => {
    const date = new Date(d), now = new Date(), diff = now - date;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const filteredConvs = conversations.filter(c =>
    (c.sellerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Avatar ──────────────────────────────────────────────────
  const Avatar = ({ name, avatar, size = 'w-11 h-11', online = false }) => {
    const url = avatar ? getImageUrl(avatar) : null;
    return (
      <div className={`${size} rounded-full overflow-hidden flex-shrink-0 relative`}>
        {url && (
          <img src={url} alt={name} className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        )}
        <div className={`w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 ${url ? 'hidden' : 'flex'} items-center justify-center text-white font-black text-sm absolute inset-0`}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0" style={{ height: '100vh' }}>
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Messages"
          subtitle={`${conversations.filter(c => c.buyerUnread > 0).length} unread`}
        />

        <div className="flex-1 flex overflow-hidden">

          {/* ── Conversations Sidebar ── */}
          <div className={`${selectedConv ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 bg-white border-r border-gray-100 flex-col flex-shrink-0 shadow-sm`}>

            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-white text-sm">Conversations</h2>
                {conversations.filter(c => c.buyerUnread > 0).length > 0 && (
                  <span className="bg-white/30 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    {conversations.filter(c => c.buyerUnread > 0).length} new
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search artists..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/20 border border-white/30 rounded-xl text-sm outline-none text-white placeholder-white/60 focus:bg-white/30 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Loader className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-xs">Loading conversations...</p>
                  </div>
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-purple-300" />
                  </div>
                  <p className="text-gray-700 text-sm font-bold">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                    Go to an artwork page and click "Chat" to start a conversation with an artist
                  </p>
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-purple-50/50 transition-all border-b border-gray-50 text-left ${
                      selectedConv?._id === conv._id
                        ? 'bg-purple-50 border-l-4 border-l-purple-500'
                        : ''
                    }`}
                  >
                    <Avatar name={conv.sellerName} avatar={conv.sellerAvatar} online />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-sm truncate ${conv.buyerUnread > 0 ? 'font-black text-gray-900' : 'font-semibold text-gray-800'}`}>
                          {conv.sellerName}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${conv.buyerUnread > 0 ? 'text-gray-700 font-semibold' : 'text-gray-500'}`}>
                        {conv.lastMessage || 'Say hello! 👋'}
                      </p>
                      {conv.buyerUnread > 0 && (
                        <div className="flex justify-end mt-1">
                          <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black shadow-md shadow-purple-200">
                            {conv.buyerUnread > 9 ? '9+' : conv.buyerUnread}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Chat Area ── */}
          <div className={`${selectedConv ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>

            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="text-center max-w-sm px-4">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-2">Your Messages</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Select a conversation from the left, or go to an artwork and click <strong>"Chat"</strong> to message an artist.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <Avatar name={selectedConv.sellerName} avatar={selectedConv.sellerAvatar} size="w-10 h-10" online />
                    <div>
                      <h2 className="font-black text-gray-900 text-sm">{selectedConv.sellerName}</h2>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <p className="text-xs text-green-600 font-semibold">Artist</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 rounded-xl border border-purple-100">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs text-purple-700 font-semibold">Secure Chat</span>
                  </div>
                </div>

                {/* Payment Info Banner */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100 px-4 py-2.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-semibold">
                    💡 Ask for payment details → Send via EasyPaisa/Bank → Share payment screenshot here as proof
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="w-6 h-6 text-purple-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-5xl mb-3">👋</div>
                      <p className="text-gray-600 font-semibold">Start the conversation!</p>
                      <p className="text-gray-400 text-sm mt-1">Ask about availability, pricing, or custom orders</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe             = msg.senderRole === 'buyer';
                      const isPaymentProof   = msg.messageType === 'payment_proof';
                      const isPaymentInfo    = msg.messageType === 'payment_info';

                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-xs md:max-w-md ${isMe ? 'flex-row-reverse' : ''}`}>

                            {!isMe && (
                              <Avatar name={msg.senderName} avatar={msg.senderAvatar} size="w-8 h-8" />
                            )}

                            <div>
                              {isPaymentProof && (
                                <div className={`flex items-center gap-1 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">
                                    💳 Payment Proof
                                  </span>
                                </div>
                              )}
                              {isPaymentInfo && (
                                <div className={`flex items-center gap-1 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-lg">
                                    🏦 Payment Details
                                  </span>
                                </div>
                              )}

                              <div className={`rounded-2xl overflow-hidden ${
                                isMe
                                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-purple-200/50'
                                  : isPaymentProof
                                    ? 'bg-green-50 border-2 border-green-300 text-gray-900 rounded-bl-sm'
                                    : 'bg-white text-gray-900 shadow-sm rounded-bl-sm border border-gray-100'
                              } ${msg._id?.toString().startsWith('temp-') ? 'opacity-60' : ''}`}>

                                {msg.image && (
                                  <img
                                    src={msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`}
                                    alt="attachment"
                                    className="max-w-full cursor-pointer hover:opacity-90 transition block"
                                    style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                                    onClick={() => window.open(
                                      msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`,
                                      '_blank'
                                    )}
                                  />
                                )}

                                {msg.text && (
                                  <p className="px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line">
                                    {msg.text}
                                  </p>
                                )}
                              </div>

                              <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                                {isMe && (
                                  msg.read
                                    ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                    : <Check className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview Bar */}
                {imagePreview && (
                  <div className="bg-white border-t border-gray-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="preview"
                          className="w-16 h-16 object-cover rounded-xl border-2 border-purple-200 shadow-sm"
                        />
                        <button
                          onClick={() => { setImagePreview(null); setImageFile(null); }}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 font-bold mb-2">Send as:</p>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={handleSend}
                            disabled={sending}
                            className="px-3 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition flex items-center gap-1 disabled:opacity-50 shadow-md shadow-purple-200"
                          >
                            <Image className="w-3 h-3" /> Regular Photo
                          </button>
                          <button
                            onClick={handleSendPaymentProof}
                            disabled={sendingProof}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50 shadow-md shadow-green-200"
                          >
                            <CreditCard className="w-3 h-3" />
                            {sendingProof ? 'Sending...' : 'Payment Proof'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Templates */}
                {showTemplates && (
                  <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-2">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Quick Messages</p>
                    {PAYMENT_TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => { setMessageInput(t.text); setShowTemplates(false); }}
                        className="w-full text-left px-3 py-2.5 bg-purple-50 hover:bg-purple-100 rounded-xl text-xs text-purple-700 font-semibold transition border border-purple-100"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0 shadow-lg">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition flex-shrink-0"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowTemplates(v => !v)}
                      className={`p-2.5 rounded-xl transition flex-shrink-0 ${
                        showTemplates
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                    />
                    <button
                      onClick={handleSend}
                      disabled={(!messageInput.trim() && !imageFile) || sending}
                      className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-md shadow-purple-200"
                    >
                      {sending
                        ? <Loader className="w-4 h-4 animate-spin" />
                        : <Send className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}