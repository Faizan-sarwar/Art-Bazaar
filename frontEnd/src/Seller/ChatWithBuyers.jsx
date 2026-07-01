import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Search, Check, CheckCheck, Loader,
  MessageCircle, CreditCard, Paperclip,
  X, Shield, ChevronLeft, BanknoteIcon
} from 'lucide-react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import { messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const BASE_URL = 'http://localhost:5000';

const PAYMENT_TEMPLATES = [
  {
    label: '🏦 Share EasyPaisa',
    text: 'My EasyPaisa account: [Your Number]\nAccount Name: [Your Name]\nPlease send payment and share screenshot here.',
  },
  {
    label: '🏦 Share Bank Details',
    text: 'Bank: [Bank Name]\nAccount #: [Account Number]\nAccount Name: [Your Name]\nPlease transfer and share proof.',
  },
  {
    label: '✅ Payment Received',
    text: 'I have received your payment. Your order has been confirmed. I will start working on it right away!',
  },
  {
    label: '🚚 Order Dispatched',
    text: 'Great news! Your order has been dispatched. You will receive it within 3–5 business days.',
  },
];

export default function ChatWithBuyers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);
  const fileInputRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const loadConversations = useCallback(async () => {
    try {
      const data = await messageAPI.getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback(async (convId) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const data = await messageAPI.getMessages(convId);
      setMessages(data.messages || []);
      loadConversations();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedConv) return;
    loadMessages(selectedConv._id);
    pollRef.current = setInterval(async () => {
      try {
        const data = await messageAPI.getMessages(selectedConv._id);
        setMessages(data.messages || []);
        loadConversations();
      } catch { }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [selectedConv?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!messageInput.trim() && !imageFile) || !selectedConv || sending) return;
    setSending(true);
    const text = messageInput.trim();
    setMessageInput('');

    const optimistic = {
      _id: 'temp-' + Date.now(),
      senderRole: 'artist', senderName: user.fullName,
      text, image: imageFile ? URL.createObjectURL(imageFile) : '',
      messageType: imageFile ? 'image' : 'text',
      read: false, createdAt: new Date().toISOString(),
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
      loadConversations();
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleSendPaymentInfo = async (template) => {
    if (!selectedConv || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          conversationId: selectedConv._id,
          text: template,
          messageType: 'payment_info',
        }),
      });
      const data = await res.json();
      if (data.success) {
        const msgs = await messageAPI.getMessages(selectedConv._id);
        setMessages(msgs.messages || []);
        loadConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
      setShowTemplates(false);
    }
  };

  const filteredConvs = conversations.filter(c =>
    (c.buyerName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (d) => {
    const date = new Date(d), now = new Date(), diff = now - date;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const Avatar = ({ name, avatar, size = 'w-11 h-11', online = false }) => {
    const url = avatar ? getImageUrl(avatar) : null;
    return (
      <div className={`${size} rounded-full overflow-hidden flex-shrink-0 relative`}>
        {url ? <img src={url} alt={name} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
        <div className={`w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 ${url ? 'hidden' : 'flex'} items-center justify-center text-white font-black text-sm`}>
          {name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        {online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SellerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0" style={{ height: '100vh' }}>
        <SellerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Chat with Buyers"
          subtitle={`${conversations.filter(c => c.sellerUnread > 0).length} unread`}
        />

        <div className="flex-1 flex overflow-hidden">

          {/* Conversations List */}
          <div className={`${selectedConv ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 bg-white border-r border-gray-100 flex-col flex-shrink-0 shadow-sm`}>
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="font-black text-white text-sm mb-3">Buyers</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search buyers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white/20 border border-white/30 rounded-xl text-sm outline-none text-white placeholder-white/60 focus:bg-white/30 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-8 h-8 text-indigo-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-semibold">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">Buyers will appear here when they message you</p>
                </div>
              ) : filteredConvs.map(conv => (
                <button key={conv._id} onClick={() => setSelectedConv(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-indigo-50/50 transition-all border-b border-gray-50 ${selectedConv?._id === conv._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                    }`}>
                  <Avatar name={conv.buyerName} avatar={conv.buyerAvatar} online={true} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-gray-900 text-sm truncate">{conv.buyerName}</span>
                      <span className="text-xs text-gray-400 ml-1 flex-shrink-0">{formatTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Start a conversation'}</p>
                    {conv.sellerUnread > 0 && (
                      <div className="flex justify-end mt-1">
                        <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-black">
                          {conv.sellerUnread}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`${selectedConv ? 'flex' : 'hidden sm:flex'} flex-1 flex-col min-w-0`}>
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg mb-1">Select a conversation</h3>
                  <p className="text-gray-500 text-sm">Choose a buyer to start chatting</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedConv(null)} className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <Avatar name={selectedConv.buyerName} avatar={selectedConv.buyerAvatar} size="w-10 h-10" online={true} />
                    <div>
                      <h2 className="font-black text-gray-900 text-sm">{selectedConv.buyerName}</h2>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <p className="text-xs text-green-600 font-semibold">Online · Buyer</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-xl border border-green-100">
                      <BanknoteIcon className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-xs text-green-700 font-semibold">P2P Payment</span>
                    </div>
                  </div>
                </div>

                {/* Payment info banner */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 px-4 py-2.5 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700 font-semibold">
                    💡 Share your EasyPaisa/bank details → Buyer sends payment → Buyer shares proof → You confirm order.
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {loadingMsgs ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader className="w-6 h-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-4xl mb-2">👋</div>
                      <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                    </div>
                  ) : messages.map(msg => {
                    const isMe = msg.senderRole === 'artist';
                    const isPaymentProof = msg.messageType === 'payment_proof';
                    const isPaymentInfo = msg.messageType === 'payment_info';

                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-xs md:max-w-md ${isMe ? 'flex-row-reverse' : ''}`}>
                          {!isMe && <Avatar name={msg.senderName} avatar={msg.senderAvatar} size="w-8 h-8" />}
                          <div>
                            {isPaymentProof && (
                              <div className={`flex items-center gap-1 mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-lg">
                                  💳 Payment Proof Received
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

                            <div className={`rounded-2xl overflow-hidden ${isMe
                                ? isPaymentInfo
                                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-lg'
                                  : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-lg shadow-indigo-200/50'
                                : isPaymentProof
                                  ? 'bg-green-50 border-2 border-green-300 rounded-bl-sm shadow-sm'
                                  : 'bg-white text-gray-900 shadow-sm rounded-bl-sm border border-gray-100'
                              } ${msg._id?.toString().startsWith('temp-') ? 'opacity-60' : ''}`}>
                              {msg.image && (
                                <img
                                  src={msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`}
                                  alt="attachment"
                                  className="max-w-full cursor-pointer hover:opacity-90 transition"
                                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                                  onClick={() => window.open(msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`, '_blank')}
                                />
                              )}
                              {msg.text && (
                                <p className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${isPaymentProof && !isMe ? 'text-green-800 font-semibold' : ''}`}>
                                  {msg.text}
                                </p>
                              )}
                            </div>

                            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                              {isMe && (msg.read
                                ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                                : <Check className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="relative">
                      <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-xl border-2 border-indigo-200" />
                      <button onClick={() => { setImagePreview(null); setImageFile(null); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Image ready to send</p>
                      <p className="text-xs text-gray-400">Press send to share with buyer</p>
                    </div>
                  </div>
                )}

                {/* Payment Templates */}
                {showTemplates && (
                  <div className="bg-white border-t border-gray-100 px-4 py-3 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Payment Quick Messages</p>
                    {PAYMENT_TEMPLATES.map((t, i) => (
                      <button key={i} onClick={() => handleSendPaymentInfo(t.text)}
                        className="w-full text-left px-3 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-xs text-indigo-700 font-semibold transition border border-indigo-100">
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Bar */}
                <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0 shadow-lg">
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*"
                      onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }}
                      className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition flex-shrink-0">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowTemplates(!showTemplates)}
                      className={`p-2.5 rounded-xl transition flex-shrink-0 ${showTemplates ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}>
                      <CreditCard className="w-5 h-5" />
                    </button>
                    <input type="text" value={messageInput} onChange={e => setMessageInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
                    <button onClick={handleSend} disabled={(!messageInput.trim() && !imageFile) || sending}
                      className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 flex-shrink-0 shadow-md shadow-indigo-200">
                      {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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