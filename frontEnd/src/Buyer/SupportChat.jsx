import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Loader, MessageCircle, Shield,
  ChevronLeft, Paperclip, X, Check, CheckCheck
} from 'lucide-react';
import BuyerSidebar   from './BuyerSidebar';
import BuyerHeader    from './BuyerHeader';
import { messageAPI } from '../services/api';
import { getImageUrl } from '../hooks/useUser';

const BASE_URL = 'http://localhost:5000';

export default function SupportChat() {
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const messagesEndRef = useRef(null);
  const pollRef        = useRef(null);
  const fileInputRef   = useRef(null);
  const user           = JSON.parse(localStorage.getItem('user') || '{}');

  // Create or load admin conversation
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const data = await messageAPI.getOrCreateAdminConversation();
        setConversation(data.conversation);
        const msgs = await messageAPI.getMessages(data.conversation._id);
        setMessages(msgs.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Poll for new messages
  useEffect(() => {
    if (!conversation) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await messageAPI.getMessages(conversation._id);
        setMessages(data.messages || []);
      } catch {}
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [conversation?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && !imageFile) || !conversation || sending) return;
    setSending(true);
    const text = input.trim();
    setInput('');

    const optimistic = {
      _id: 'temp-' + Date.now(),
      senderRole: 'buyer', senderName: user.fullName,
      text, image: imageFile ? URL.createObjectURL(imageFile) : '',
      messageType: imageFile ? 'image' : 'text',
      read: false, createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    setImagePreview(null);

    try {
      if (imageFile) {
        await messageAPI.sendImage(conversation._id, imageFile, 'image', text);
        setImageFile(null);
      } else {
        await messageAPI.send(conversation._id, text);
      }
      const data = await messageAPI.getMessages(conversation._id);
      setMessages(data.messages || []);
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (d) => {
    const date = new Date(d), now = new Date(), diff = now - date;
    if (diff < 60000)    return 'Just now';
    if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <BuyerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0" style={{ height: '100vh' }}>
        <BuyerHeader
          onMenuClick={() => setSidebarOpen(true)}
          title="Support Chat"
          subtitle="ArtBazaar Customer Support"
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Support Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-white">ArtBazaar Support</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <p className="text-purple-200 text-xs font-semibold">Online · Usually replies in minutes</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Welcome to ArtBazaar Support!</h3>
                  <p className="text-gray-500 text-sm">How can we help you today?</p>
                  <div className="grid grid-cols-2 gap-2 mt-4 max-w-xs mx-auto">
                    {[
                      '🛍️ Order Issue', '💳 Payment Help',
                      '🎨 Art Store Query', '👤 Account Help',
                    ].map(t => (
                      <button key={t} onClick={() => setInput(t.split(' ').slice(1).join(' '))}
                        className="px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 font-semibold hover:bg-purple-100 transition">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => {
                const isMe = msg.senderRole === 'buyer';
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2 max-w-xs md:max-w-sm ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                          <Shield className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        {!isMe && <p className="text-xs text-gray-500 font-semibold mb-0.5 ml-1">ArtBazaar Support</p>}
                        <div className={`rounded-2xl overflow-hidden ${
                          isMe
                            ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-purple-200/50'
                            : 'bg-white text-gray-900 shadow-sm rounded-bl-sm border border-gray-100'
                        }`}>
                          {msg.image && (
                            <img
                              src={msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`}
                              alt="attachment"
                              className="max-w-full cursor-pointer hover:opacity-90 transition"
                              style={{ maxHeight: '200px', objectFit: 'cover' }}
                              onClick={() => window.open(msg.image.startsWith('blob:') ? msg.image : `${BASE_URL}${msg.image}`, '_blank')}
                            />
                          )}
                          {msg.text && <p className="px-4 py-2.5 text-sm leading-relaxed">{msg.text}</p>}
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
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-xl" />
                <button onClick={() => { setImagePreview(null); setImageFile(null); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-500">Image ready to send</p>
            </div>
          )}

          {/* Input */}
          <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0 shadow-lg">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*"
                onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }}
                className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition">
                <Paperclip className="w-5 h-5" />
              </button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-400 transition" />
              <button onClick={handleSend} disabled={(!input.trim() && !imageFile) || sending}
                className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:opacity-90 transition disabled:opacity-40 shadow-md shadow-purple-200">
                {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}