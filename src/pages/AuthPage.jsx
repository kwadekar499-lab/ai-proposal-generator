import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, ArrowRight, Zap, Shield, BarChart3, MailCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

const features = [
  { icon: Zap,      title: 'AI-Powered',  desc: 'Generate professional proposals in seconds' },
  { icon: Shield,   title: 'Branded',     desc: 'Every proposal reflects your agency identity' },
  { icon: BarChart3,title: 'Win More',    desc: 'Close clients with polished, structured proposals' },
];

export default function AuthPage() {
  const { loginWithEmail, signUpWithEmail, signInWithGoogle, resendVerification, profile, showToast } = useApp();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();

  const [tab, setTab]                 = useState('login');
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [resending, setResending]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [infoMsg, setInfoMsg]         = useState('');
  const [showVerifyRedirect, setShowVerifyRedirect] = useState(false);
  const [form, setForm]               = useState({ email: '', password: '', name: '' });

  // Handle URL redirect query params from InsForge verification link
  useEffect(() => {
    const status = searchParams.get('insforge_status');
    const type = searchParams.get('insforge_type');
    if (status === 'success' && type === 'verify_email') {
      setInfoMsg('Email verified successfully! Please sign in with your credentials.');
      showToast('Email verified successfully! You can now sign in.');
    }
  }, [searchParams, showToast]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    setShowVerifyRedirect(false);

    try {
      if (tab === 'login') {
        const res = await loginWithEmail(form.email, form.password);
        if (res.success) {
          navigate(profile ? '/dashboard' : '/setup');
        }
      } else {
        const res = await signUpWithEmail(form.email, form.password, form.name);
        if (res.requireVerification) {
          showToast('Account created! Please verify your email code.');
          navigate('/verify-email', { state: { email: form.email, password: form.password } });
        } else if (res.success) {
          navigate('/setup');
        }
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed';
      if (err.statusCode === 403 || msg.toLowerCase().includes('verify your email')) {
        setErrorMsg('Please verify your email before signing in.');
        setShowVerifyRedirect(true);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToVerification = () => {
    navigate('/verify-email', { state: { email: form.email, password: form.password } });
  };

  const handleGoogleAuth = async () => {
    setLoadingGoogle(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setErrorMsg(err.message || 'Google sign in failed');
      showToast(err.message || 'Google sign in failed', 'error');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleResend = async () => {
    if (!form.email) {
      showToast('Please enter your email address to resend verification link.', 'error');
      return;
    }
    setResending(true);
    try {
      await resendVerification(form.email);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ─── Left: Form panel ─── */}
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
            <h1>{tab === 'login' ? 'Welcome back' : 'Get started free'}</h1>
            <p>{tab === 'login' ? 'Sign in to your workspace' : 'Create your account — no credit card required'}</p>
          </div>

          {/* Tab bar */}
          <div className="auth-tab-bar">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setErrorMsg(''); setInfoMsg(''); }}>Sign In</button>
            <button className={`auth-tab ${tab === 'signup' ? 'active' : ''}`} onClick={() => { setTab('signup'); setErrorMsg(''); setInfoMsg(''); }}>Sign Up</button>
          </div>

          {/* Messages */}
          {infoMsg && (
            <div style={{ color: '#60a5fa', fontSize: '0.85rem', background: 'rgba(59,130,246,0.15)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '16px', display:'flex', alignItems:'center', gap:'10px' }}>
              <MailCheck size={20} flexShrink={0} />
              <div>{infoMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', background: 'rgba(239,68,68,0.15)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '16px' }}>
              <div>{errorMsg}</div>
              {showVerifyRedirect && (
                <button
                  type="button"
                  onClick={handleGoToVerification}
                  className="btn btn-ghost"
                  style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px 12px', color: '#60a5fa', borderColor: 'rgba(96,165,250,0.4)', width: '100%', justifyContent: 'center' }}
                >
                  Verify Email / Resend Code →
                </button>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {tab === 'signup' && (
              <div className="field">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" className="input" placeholder="Jane Doe" value={form.name} onChange={handle} required />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" placeholder="you@agency.com" value={form.email} onChange={handle} required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password" name="password"
                  type={showPass ? 'text' : 'password'}
                  className="input"
                  style={{ paddingRight: '44px' }}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handle}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--clr-text-muted)', display:'flex' }}
                >
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading || loadingGoogle} style={{ width:'100%', marginTop:'8px' }}>
              {loading ? (
                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
              ) : (
                <>{tab === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight size={18}/></>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 16px 0', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--clr-border, rgba(255,255,255,0.12))' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--clr-border, rgba(255,255,255,0.12))' }} />
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loadingGoogle || loading}
            className="btn"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--clr-border, rgba(255, 255, 255, 0.12))',
              color: 'var(--clr-text, #f8fafc)',
              fontWeight: 600,
              padding: '12px 16px',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontSize: '0.9rem'
            }}
          >
            {loadingGoogle ? (
              <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29c-.81 1.62-1.29 3.44-1.29 5.42s.48 3.8 1.29 5.42l3.99-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--clr-text-muted)', marginTop:'16px' }}>
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setTab(tab === 'login' ? 'signup' : 'login'); setErrorMsg(''); setInfoMsg(''); setShowVerifyRedirect(false); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--clr-primary)', fontWeight:600, fontSize:'0.82rem' }}>
              {tab === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      {/* ─── Right: Feature panel ─── */}
      <div className="auth-right">
        <div style={{ marginBottom:'8px' }}>
          <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'white', marginBottom:'8px' }}>Win more clients.<br />Write proposals in seconds.</h2>
          <p style={{ color:'var(--clr-text-soft)', fontSize:'0.92rem' }}>Trusted by 2,400+ freelancers and digital agencies worldwide.</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px', width:'100%' }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ display:'flex', alignItems:'flex-start', gap:'14px', padding:'16px 18px' }}>
              <div style={{ background:'var(--clr-primary-subtle)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:'10px', padding:'8px', color:'var(--clr-primary)', display:'flex', flexShrink:0 }}>
                <f.icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.92rem', marginBottom:'2px' }}>{f.title}</div>
                <div style={{ fontSize:'0.82rem', color:'var(--clr-text-muted)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--clr-text-muted)', textAlign:'center' }}>
          🔒 Your data is stored securely. No spam, ever.
        </div>
      </div>
    </div>
  );
}
