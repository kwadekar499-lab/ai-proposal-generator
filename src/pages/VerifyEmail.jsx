import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Sparkles, KeyRound, ArrowRight, RotateCcw, ArrowLeft, MailCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function VerifyEmail() {
  const { verifyEmailCode, loginWithEmail, resendVerification, profile, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve state passed from Sign Up or Login
  const initialEmail = location.state?.email || '';
  const initialPassword = location.state?.password || '';

  const [email, setEmail]             = useState(initialEmail);
  const [password, setPassword]       = useState(initialPassword);
  const [otpCode, setOtpCode]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [resending, setResending]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [infoMsg, setInfoMsg]         = useState(`We sent a 6-digit verification code to ${email || 'your email'}.`);

  // 60 seconds Countdown Timer for Resend
  const [timer, setTimer]             = useState(60);
  const [canResend, setCanResend]     = useState(false);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      setErrorMsg('Please enter a valid verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Call official InsForge verifyEmail API
      await verifyEmailCode(email, cleanOtp);

      // 2. Automatically authenticate after verification
      if (password) {
        const authRes = await loginWithEmail(email, password);
        if (authRes.success) {
          showToast('Email verified and signed in!');
          navigate(profile ? '/dashboard' : '/setup');
          return;
        }
      }

      // If password wasn't stored in state, prompt user to sign in
      showToast('Email verified! Please sign in.');
      navigate('/login');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired verification code. Please check your email or resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMsg('Email address missing. Please go back and sign up again.');
      return;
    }
    setResending(true);
    setErrorMsg('');
    try {
      await resendVerification(email);
      setInfoMsg(`A new 6-digit verification code has been sent to ${email}.`);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div className="auth-panel fade-up">
          {/* Logo */}
          <div className="auth-logo">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>
            <span className="brand-name">Proposer.ai</span>
          </div>

          {/* Heading */}
          <div className="auth-heading">
            <h1>Verify your email</h1>
            <p>Enter the code sent to your inbox to activate your account</p>
          </div>

          {/* Info Banner */}
          {infoMsg && (
            <div style={{ color: '#60a5fa', fontSize: '0.85rem', background: 'rgba(59,130,246,0.15)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '16px', display:'flex', alignItems:'center', gap:'10px' }}>
              <MailCheck size={20} flexShrink={0} />
              <div>{infoMsg}</div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', background: 'rgba(239,68,68,0.15)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '16px' }}>
              {errorMsg}
            </div>
          )}

          {/* Verification Form */}
          <form onSubmit={handleVerify} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <div className="field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="otpCode">6-Digit Verification Code</label>
              <div className="input-wrap">
                <span className="input-icon"><KeyRound size={16}/></span>
                <input
                  id="otpCode"
                  type="text"
                  className="input has-icon"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ letterSpacing: '3px', fontWeight: 700, fontSize: '1.1rem' }}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', marginTop:'4px' }}>
              {loading ? (
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
              ) : (
                <>Verify & Continue <ArrowRight size={18}/></>
              )}
            </button>
          </form>

          {/* Resend & Timer Controls */}
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend || resending}
              className="btn btn-ghost"
              style={{
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: canResend ? 1 : 0.6,
                cursor: canResend ? 'pointer' : 'not-allowed'
              }}
            >
              <RotateCcw size={15} />
              {resending ? 'Resending code…' : canResend ? 'Resend Code' : `Resend Code in ${timer}s`}
            </button>

            <Link to="/login" style={{ fontSize: '0.82rem', color: 'var(--clr-text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Sign In / Change Email
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Right: Decorative feature panel ─── */}
      <div className="auth-right">
        <div style={{ marginBottom:'8px' }}>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'white', marginBottom:'8px' }}>Activate your workspace.</h2>
          <p style={{ color:'var(--clr-text-soft)', fontSize:'0.92rem' }}>We take account security seriously. Verify your email to complete registration.</p>
        </div>
      </div>
    </div>
  );
}
