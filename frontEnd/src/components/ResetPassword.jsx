import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock, Eye, EyeOff, Palette, CheckCircle, Loader,
  Check, X, ShieldCheck, ArrowLeft, RefreshCw, Mail,
  AlertCircle
} from 'lucide-react';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();

  // step: 'email' → 'otp' → 'newpass' → 'done'
  const [step,      setStep]      = useState('email');
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error,     setError]     = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const [email,    setEmail]    = useState('');
  const [otpValues,setOtpValues]= useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');

  const otpRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Auto-redirect after success
  useEffect(() => {
    if (step !== 'done') return;
    const t = setTimeout(() => navigate('/login'), 4000);
    return () => clearTimeout(t);
  }, [step, navigate]);

  const validatePassword = (pw) => ({
    length:    pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  });

  const getStrength = (pw) => {
    const score = Object.values(validatePassword(pw)).filter(Boolean).length;
    if (score <= 2) return { text: 'Weak',   color: 'text-red-500',    bg: 'bg-red-500',    w: '20%'  };
    if (score <= 3) return { text: 'Fair',   color: 'text-amber-500',  bg: 'bg-amber-500',  w: '50%'  };
    if (score <= 4) return { text: 'Good',   color: 'text-blue-500',   bg: 'bg-blue-500',   w: '75%'  };
    return             { text: 'Strong', color: 'text-emerald-500', bg: 'bg-emerald-500', w: '100%' };
  };

  // ── Step 1: Send OTP to email ──────────────────────────────
  const handleSendOTP = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address'); return;
    }
    setLoading(true); setError('');
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setStep('otp');
      setCountdown(60);
      setOtpValues(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────
  const handleResend = async () => {
    setResending(true); setError('');
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setCountdown(60);
      setOtpValues(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  // ── OTP input handlers ─────────────────────────────────────
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

  // ── Step 2: Verify OTP ─────────────────────────────────────
  const handleVerifyOTP = async () => {
    const otp = otpValues.join('');
    if (otp.length !== 6) { setError('Please enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      // We verify the OTP using the same verifyOTP endpoint
      // but we don't create the account — just confirm it's valid
      // Backend should have a verify-reset-otp or we use the token approach
      await authAPI.verifyResetOTP(email.trim().toLowerCase(), otp);
      setStep('newpass');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtpValues(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Set new password ───────────────────────────────
  const handleResetPassword = async () => {
    const pwVal = validatePassword(password);
    if (!pwVal.length) { setError('Password must be at least 8 characters'); return; }
    if (Object.values(pwVal).includes(false)) { setError('Password does not meet all requirements'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }

    setLoading(true); setError('');
    try {
      await authAPI.resetPassword('', email.trim().toLowerCase(), password);
      setStep('done');
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pwVal      = validatePassword(password);
  const pwStrength = getStrength(password);

  // Shared layout wrapper
  const PageWrapper = ({ children }) => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <Palette className="w-6 h-6 text-purple-300" />
            <span className="text-xl font-black text-white">Art<span className="text-purple-300">Bazaar</span></span>
          </div>
        </div>
        {children}
        <p className="text-center text-purple-300 text-xs mt-5">
          Remember your password?{' '}
          <Link to="/login" className="text-white font-bold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );

  // ── STEP: email ────────────────────────────────────────────
  if (step === 'email') return (
    <PageWrapper>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Forgot Password?</h1>
          <p className="text-purple-200 text-sm">Enter your email and we'll send a verification code</p>
        </div>

        <div className="px-8 py-8 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                placeholder="your@email.com"
                autoFocus
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-semibold flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleSendOTP} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-base hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><Loader className="w-5 h-5 animate-spin" /> Sending Code...</>
              : <><Mail className="w-5 h-5" /> Send Verification Code</>
            }
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-gray-500 text-sm font-semibold hover:text-purple-600 transition py-1">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </PageWrapper>
  );

  // ── STEP: otp ──────────────────────────────────────────────
  if (step === 'otp') return (
    <PageWrapper>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Enter OTP</h1>
          <p className="text-purple-200 text-sm">Code sent to</p>
          <p className="text-white font-bold text-sm mt-1 bg-white/10 px-3 py-1 rounded-full inline-block">{email}</p>
        </div>

        <div className="px-8 py-8">
          <p className="text-center text-gray-500 text-sm mb-6">
            Enter the 6-digit code to verify your identity
          </p>

          <div className="flex gap-2 sm:gap-3 justify-center mb-6">
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={el => otpRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={e => handleOTPChange(i, e.target.value)}
                onKeyDown={e => handleOTPKeyDown(i, e)}
                onPaste={i === 0 ? handleOTPPaste : undefined}
                className={`w-11 text-center text-xl font-black border-2 rounded-xl focus:outline-none transition-all ${
                  val
                    ? 'border-purple-500 bg-purple-50 text-purple-700 scale-105'
                    : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-purple-400 focus:bg-white'
                }`}
                style={{ height: '3.25rem' }}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-semibold">
              {error}
            </div>
          )}

          <button onClick={handleVerifyOTP} disabled={loading || otpValues.join('').length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-base hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><Loader className="w-5 h-5 animate-spin" /> Verifying...</>
              : <><ShieldCheck className="w-5 h-5" /> Verify Code</>
            }
          </button>

          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-gray-400 text-sm">Resend in <span className="text-purple-600 font-bold">{countdown}s</span></p>
            ) : (
              <button onClick={handleResend} disabled={resending}
                className="text-purple-600 text-sm font-bold hover:text-purple-700 transition flex items-center gap-1.5 mx-auto">
                {resending
                  ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> Resend Code</>
                }
              </button>
            )}
          </div>

          <button onClick={() => { setStep('email'); setError(''); }}
            className="w-full mt-3 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:border-purple-300 hover:text-purple-600 transition flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Change Email
          </button>
        </div>
      </div>
    </PageWrapper>
  );

  // ── STEP: newpass ──────────────────────────────────────────
  if (step === 'newpass') return (
    <PageWrapper>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">New Password</h1>
          <p className="text-purple-200 text-sm">Create a strong password for your account</p>
        </div>

        <div className="px-8 py-8 space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Minimum 8 characters"
                className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength indicator */}
            {password.length > 0 && (
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
                      {pwVal[key] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showConf ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                placeholder="Re-enter new password"
                className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none transition ${
                  confirm && password !== confirm ? 'border-red-300' : 'border-gray-200 focus:border-purple-500'
                }`}
              />
              <button type="button" onClick={() => setShowConf(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirm && password !== confirm && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <X className="w-3 h-3" /> Passwords do not match
              </p>
            )}
            {confirm && password === confirm && confirm.length > 0 && (
              <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center font-semibold flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleResetPassword} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-base hover:opacity-90 transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading
              ? <><Loader className="w-5 h-5 animate-spin" /> Resetting...</>
              : <><Lock className="w-5 h-5" /> Reset Password</>
            }
          </button>
        </div>
      </div>
    </PageWrapper>
  );

  // ── STEP: done ─────────────────────────────────────────────
  return (
    <PageWrapper>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden text-center">
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-8 py-10">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1">Password Reset!</h1>
          <p className="text-green-100 text-sm">Your password has been updated successfully</p>
        </div>

        <div className="px-8 py-8">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-gray-600 text-sm mb-6">
            You can now sign in with your new password. Redirecting to login in a few seconds...
          </p>
          <Link to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-black text-base hover:opacity-90 transition shadow-lg shadow-purple-200">
            Go to Sign In →
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}