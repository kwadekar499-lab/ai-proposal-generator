import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

const steps = ['Personal', 'Business'];

export default function ProfileSetup() {
  const { saveProfile, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || user?.user_metadata?.full_name || '',
    email: user?.email || '',
    businessName: '',
    services: ''
  });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const next = async (e) => {
    e.preventDefault();
    if (step < steps.length - 1) { setStep(s => s + 1); return; }
    setLoading(true);
    try {
      await saveProfile(form);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-shell">
      <div className="setup-panel fade-up">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div className="brand-icon"><Sparkles size={18}/></div>
          <span className="brand-name">Proposer.ai</span>
        </div>

        {/* Progress */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
            <span style={{ fontSize:'0.8rem', color:'var(--clr-text-muted)' }}>Step {step + 1} of {steps.length}</span>
            <span style={{ fontSize:'0.8rem', color:'var(--clr-primary)', fontWeight:600 }}>{steps[step]}</span>
          </div>
          <div style={{ height:'4px', borderRadius:'999px', background:'var(--clr-border)', overflow:'hidden' }}>
            <div style={{ height:'100%', background:'linear-gradient(90deg, var(--clr-primary), var(--clr-accent))', borderRadius:'999px', width:`${((step+1)/steps.length)*100}%`, transition:'width 0.4s ease' }}/>
          </div>
        </div>

        {/* Panel */}
        <div className="card" style={{ padding:'36px' }}>
          <form onSubmit={next} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            {step === 0 && (
              <>
                <div>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800 }}>Tell us about yourself</h2>
                  <p style={{ color:'var(--clr-text-soft)', fontSize:'0.9rem', marginTop:'6px' }}>This info will appear on your proposals as the freelancer identity.</p>
                </div>
                <div className="field">
                  <label htmlFor="name">Your Full Name</label>
                  <div className="input-wrap">
                    <span className="input-icon"><User size={16}/></span>
                    <input id="name" name="name" type="text" className="input has-icon" placeholder="Jane Smith" value={form.name} onChange={handle} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="email">Professional Email</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Mail size={16}/></span>
                    <input id="email" name="email" type="email" className="input has-icon" placeholder="jane@agency.com" value={form.email} onChange={handle} required />
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <h2 style={{ fontSize:'1.5rem', fontWeight:800 }}>Your business details</h2>
                  <p style={{ color:'var(--clr-text-soft)', fontSize:'0.9rem', marginTop:'6px' }}>Used to personalise proposals and build client trust.</p>
                </div>
                <div className="field">
                  <label htmlFor="businessName">Agency / Business Name</label>
                  <div className="input-wrap">
                    <span className="input-icon"><Building2 size={16}/></span>
                    <input id="businessName" name="businessName" type="text" className="input has-icon" placeholder="Smith Digital Co." value={form.businessName} onChange={handle} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="services">Services You Offer <span style={{ color:'var(--clr-text-muted)', textTransform:'none', fontWeight:400 }}>(comma separated)</span></label>
                  <div className="input-wrap">
                    <span className="input-icon input-icon-top"><Briefcase size={16}/></span>
                    <textarea id="services" name="services" className="input has-icon" placeholder="e.g. SEO, Google Ads, Social Media, Web Design" value={form.services} onChange={handle} required style={{ minHeight:'90px' }}/>
                  </div>
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
              {step > 0 && (
                <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={() => setStep(s => s - 1)}>
                  Back
                </button>
              )}
              <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={loading}>
                {loading
                  ? <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                  : <>{step < steps.length - 1 ? 'Continue' : 'Launch Dashboard'}<ArrowRight size={16}/></>
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
