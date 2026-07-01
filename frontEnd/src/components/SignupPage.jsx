import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Loader, CheckCircle, Mail, Lock, User,
  Palette, ArrowLeft, RefreshCw, ShieldCheck, Camera,
  UploadCloud, Check, X, KeyRound
} from 'lucide-react';
import AvatarEditor from 'react-avatar-editor';
import { authAPI } from '../services/api';

const ADMIN_SECRET = 'ARTBAZAAR2025';

export default function SignupPage() {
  const navigate = useNavigate();

  const [step,        setStep]        = useState('form');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const [error,       setError]       = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [otpValues,   setOtpValues]   = useState(['','','','','','']);
  const [countdown,   setCountdown]   = useState(0);

  const [adminKey,        setAdminKey]        = useState('');
  const [showAdminOption, setShowAdminOption] = useState(false);
  const [showAdminKey,    setShowAdminKey]    = useState(false);
  const [adminKeyError,   setAdminKeyError]   = useState('');

  const [selectedImage,    setSelectedImage]    = useState(null);
  const [showCropper,      setShowCropper]      = useState(false);
  const [scale,            setScale]            = useState(1);
  const [croppedImageFile, setCroppedImageFile] = useState(null);
  const [previewUrl,       setPreviewUrl]       = useState(null);
  const editorRef = useRef(null);
  const otpRefs   = useRef([]);

  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'buyer' });

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sel = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setFieldErrors(f => ({ ...f, [key]: '' }));
    setError('');
  };

  const validatePassword = (pw) => ({
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  });

  const getPasswordStrength = (pw) => {
    const score = Object.values(validatePassword(pw)).filter(Boolean).length;
    if (score <= 2) return { text: 'Weak',   color: 'text-red-500',    bg: 'bg-red-500',    w: '20%'  };
    if (score <= 3) return { text: 'Fair',   color: 'text-amber-500',  bg: 'bg-amber-500',  w: '50%'  };
    if (score <= 4) return { text: 'Good',   color: 'text-blue-500',   bg: 'bg-blue-500',   w: '75%'  };
    return             { text: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', w: '100%' };
  };

  const validateForm = () => {
    const errs = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) errs.fullName = 'Enter your full name';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))  errs.email    = 'Enter a valid email';
    if (!form.password || form.password.length < 6)               errs.password = 'Password must be at least 6 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdminKeyChange = (val) => {
    setAdminKey(val);
    setAdminKeyError('');
    if (val === ADMIN_SECRET) {
      setShowAdminOption(true);
    } else if (val.length >= ADMIN_SECRET.length) {
      setAdminKeyError('Invalid admin key');
      setShowAdminOption(false);
      if (form.role === 'admin') sel('role', 'buyer');
    } else {
      setShowAdminOption(false);
      if (form.role === 'admin') sel('role', 'buyer');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setSelectedImage(file); setShowCropper(true); }
  };

  const handleSaveCrop = () => {
    if (editorRef.current) {
      editorRef.current.getImageScaledToCanvas().toBlob((blob) => {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        setCroppedImageFile(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setShowCropper(false);
      }, 'image/jpeg', 0.95);
    }
  };

  const handleSendOTP = async () => {
    if (!validateForm()) return;
    setLoading(true); setError('');
    try {
      await authAPI.sendOTP(form);
      setStep('otp');
      setCountdown(60);
      setOtpValues(['','','','','','']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true); setError('');
    try {
      await authAPI.sendOTP(form);
      setCountdown(60);
      setOtpValues(['','','','','','']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleOTPChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);
    setError('');
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
    if (e.key === 'Enter') handleVerifyOTP();
  };

  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otpValues];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtpValues(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const data = await authAPI.verifyOTP(form.email, otp);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user',  JSON.stringify(data.user));
      if (data.user.role === 'artist')     navigate('/seller/home');
      else if (data.user.role === 'admin') navigate('/admin/dashboard');
      else                                 navigate('/buyer/home');
    } catch (err) {
      setError(err.message);
      setOtpValues(['','','','','','']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const pwVal      = validatePassword(form.password);
  const pwStrength = getPasswordStrength(form.password);

  const inputCls = (field) =>
    `w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none transition ${
      fieldErrors[field] ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
    }`;

  // ── OTP Step ──────────────────────────────────────────────
  if (step === 'otp') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-300" />
            <span className="text-xl font-black text-white">Art<span className="text-purple-300">Bazaar</span></span>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">Verify Your Email</h1>
            <p className="text-purple-200 text-sm">We sent a 6-digit code to</p>
            <p className="text-white font-bold text-sm mt-1 bg-white/10 px-3 py-1 rounded-full inline-block">{form.email}</p>
          </div>
          <div className="px-8 py-8">
            <p className="text-center text-gray-500 text-sm mb-6">Enter the code to verify and create your account</p>
            <div className="flex gap-2 sm:gap-3 justify-center mb-6">
              {otpValues.map((val, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} value={val}
                  onChange={e => handleOTPChange(i, e.target.value)}
                  onKeyDown={e => handleOTPKeyDown(i, e)}
                  onPaste={i === 0 ? handleOTPPaste : undefined}
                  className={`w-11 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all ${
                    val ? 'border-purple-500 bg-purple-50 text-purple-700 scale-105'
                        : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-purple-400 focus:bg-white'
                  }`}
                  style={{ height: '3.25rem' }}
                />
              ))}
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-semibold">{error}</div>
            )}
            <button onClick={handleVerifyOTP} disabled={loading || otpValues.join('').length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-base hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Loader className="w-5 h-5 animate-spin" /> Verifying...</> : <><CheckCircle className="w-5 h-5" /> Verify & Create Account</>}
            </button>
            <div className="text-center mt-4">
              {countdown > 0 ? (
                <p className="text-gray-400 text-sm">Resend in <span className="text-purple-600 font-bold">{countdown}s</span></p>
              ) : (
                <button onClick={handleResendOTP} disabled={resending}
                  className="text-purple-600 text-sm font-bold hover:text-purple-700 transition flex items-center gap-1.5 mx-auto">
                  {resending ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Sending...</> : <><RefreshCw className="w-3.5 h-3.5" /> Resend OTP</>}
                </button>
              )}
            </div>
            <button onClick={() => { setStep('form'); setError(''); }}
              className="w-full mt-3 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-purple-300 hover:text-purple-600 transition flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Sign Up
            </button>
          </div>
        </div>
        <p className="text-center text-purple-300 text-xs mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-white font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );

  // ── Sign Up Form ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4 py-8">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="w-full max-w-md relative">

        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Palette className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Art<span className="text-purple-300">Bazaar</span></h1>
          <p className="text-purple-300 text-sm mt-1">Pakistan's #1 Art Marketplace</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 text-center">
            <h2 className="text-xl font-black text-white">Create Your Account</h2>
            <p className="text-purple-200 text-sm mt-1">Join thousands of art lovers</p>
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-4">

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Account Type</label>
              <div className={`grid gap-2 p-1 bg-gray-100 rounded-2xl ${showAdminOption ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {[
                  { id: 'buyer',  emoji: '🛍️', label: 'Buyer',  desc: 'Browse & buy'     },
                  { id: 'artist', emoji: '🎨', label: 'Artist', desc: 'Sell artwork'      },
                  ...(showAdminOption ? [{ id: 'admin', emoji: '👑', label: 'Admin', desc: 'Manage platform' }] : []),
                ].map(r => (
                  <button key={r.id} type="button" onClick={() => sel('role', r.id)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      form.role === r.id
                        ? r.id === 'admin' ? 'bg-white text-red-600 shadow-md' : 'bg-white text-purple-700 shadow-md'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    <span className="text-lg block mb-0.5">{r.emoji}</span>
                    {r.label}
                    <span className={`block text-xs font-normal ${
                      form.role === r.id ? r.id === 'admin' ? 'text-red-400' : 'text-purple-400' : 'text-gray-400'
                    }`}>{r.desc}</span>
                  </button>
                ))}
              </div>

              {/* Admin Key Input */}
              <div className="mt-3">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    value={adminKey}
                    onChange={e => handleAdminKeyChange(e.target.value)}
                    placeholder="Admin key (optional)"
                    className={`w-full pl-10 pr-10 py-2.5 border-2 rounded-xl text-sm placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none transition ${
                      adminKeyError   ? 'border-red-300 text-red-700'
                      : showAdminOption ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 focus:border-purple-400 text-gray-700'
                    }`}
                  />
                  <button type="button" onClick={() => setShowAdminKey(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {adminKeyError && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><X className="w-3 h-3" /> {adminKeyError}</p>
                )}
                {showAdminOption && (
                  <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1 font-semibold"><Check className="w-3 h-3" /> Admin access unlocked — select Admin above</p>
                )}
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group cursor-pointer">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center overflow-hidden bg-purple-50 group-hover:border-purple-500 transition-all">
                  {previewUrl ? <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                    : <UploadCloud className="w-7 h-7 text-purple-400 group-hover:text-purple-600 transition-colors" />}
                </div>
                <label className="absolute bottom-0 right-0 bg-purple-600 p-1.5 rounded-full cursor-pointer hover:bg-purple-700 shadow-md transition hover:scale-110">
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Profile picture (optional)</p>
            </div>

            {/* Crop Modal */}
            {showCropper && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col items-center shadow-2xl">
                  <h3 className="text-lg font-bold mb-4">Adjust Profile Picture</h3>
                  <div className="rounded-xl overflow-hidden mb-4 border-2 border-gray-200">
                    <AvatarEditor ref={editorRef} image={selectedImage} width={200} height={200}
                      border={30} borderRadius={100} color={[255,255,255,0.6]} scale={scale} rotate={0} />
                  </div>
                  <div className="w-full mb-6">
                    <label className="text-sm text-gray-500 block mb-2 text-center">Zoom</label>
                    <input type="range" value={scale} min="1" max="3" step="0.01"
                      onChange={e => setScale(parseFloat(e.target.value))} className="w-full accent-purple-600" />
                  </div>
                  <div className="flex gap-3 w-full">
                    <button onClick={() => setShowCropper(false)}
                      className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={handleSaveCrop}
                      className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">Apply</button>
                  </div>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.fullName} onChange={e => sel('fullName', e.target.value)}
                  placeholder="e.g. Ahmed Ali" className={inputCls('fullName')} />
              </div>
              {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={e => sel('email', e.target.value)}
                  placeholder="you@example.com" className={inputCls('email')} />
              </div>
              {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => sel('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`${inputCls('password')} pr-10`} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
              {form.password.length > 0 && (
                <div className="mt-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${pwStrength.bg} transition-all duration-500`} style={{ width: pwStrength.w }} />
                    </div>
                    <span className={`text-xs font-bold ${pwStrength.color}`}>{pwStrength.text}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { key: 'length',    label: '8+ chars'      },
                      { key: 'uppercase', label: 'Uppercase'     },
                      { key: 'lowercase', label: 'Lowercase'     },
                      { key: 'number',    label: 'Number'        },
                      { key: 'special',   label: 'Special (!@#)' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`flex items-center gap-1 text-xs font-medium ${pwVal[key] ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {pwVal[key] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-semibold">{error}</div>
            )}

            <button onClick={handleSendOTP} disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-base hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <><Loader className="w-5 h-5 animate-spin" /> Sending OTP...</> : <><Mail className="w-5 h-5" /> Send Verification Code</>}
            </button>

            <p className="text-center text-gray-500 text-sm pb-2">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}