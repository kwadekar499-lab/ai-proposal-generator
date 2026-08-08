import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, MapPin, Building2, FileText, Hash, DollarSign, Clock, AlignLeft, TrendingUp, FileCheck, History } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateProposal } from '../lib/generateProposal';

const PROJECT_TYPES = [
  'Website Design',
  'SEO Optimization',
  'Google/Facebook Ads',
  'Social Media Management',
  'Content Marketing',
  'Full Digital Strategy',
  'Other',
];

export default function Dashboard() {
  const { profile, history, addProposal, showToast } = useApp();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientLocation: '',
    projectType: 'Website Design',
    pages: '1',
    price: '',
    timeline: '',
    description: '',
  });

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));


  const submit = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      // Resolve "Other" to the custom text the user typed
      const resolvedForm = {
        ...form,
        projectType: form.projectType === 'Other'
          ? (form.customProjectType || 'Other')
          : form.projectType,
      };
      const content = await generateProposal(resolvedForm, profile);
      const proposalPayload = {
        status: 'Generated',
        content,
        ...resolvedForm,
      };
      const created = await addProposal(proposalPayload);
      if (created?.id) {
        navigate(`/proposal/${created.id}`);
      }
    } catch (err) {
      showToast(err.message || 'Proposal generation failed', 'error');
    } finally {
      setGenerating(false);
    }
  };


  const totalProposals = history.length;
  const totalValue = history.reduce((s, p) => s + Number(p.price || 0), 0);
  const recentClients = [...new Set(history.slice(0,5).map(p => p.clientName))].length;

  return (
    <div className="fade-up">
      {/* ─── Page header ─── */}
      <div className="page-header">
        <h1>New Proposal</h1>
        <p>Fill in the project details below and your AI will generate a professional proposal.</p>
      </div>

      {/* ─── Stats ─── */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'var(--clr-primary-subtle)', color:'var(--clr-primary)' }}>
            <FileCheck size={22}/>
          </div>
          <div>
            <div className="stat-label">Proposals Created</div>
            <div className="stat-value">{totalProposals}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(16,185,129,0.15)', color:'var(--clr-success)' }}>
            <TrendingUp size={22}/>
          </div>
          <div>
            <div className="stat-label">Total Value</div>
            <div className="stat-value" style={{ fontSize:'1.3rem' }}>${totalValue.toLocaleString()}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{ background:'rgba(6,182,212,0.15)', color:'var(--clr-accent)' }}>
            <History size={22}/>
          </div>
          <div>
            <div className="stat-label">Recent Clients</div>
            <div className="stat-value">{recentClients}</div>
          </div>
        </div>
      </div>

      {/* ─── Form ─── */}
      <div className="card" style={{ padding:'32px' }}>
        <h2 style={{ fontSize:'1.15rem', marginBottom:'24px', display:'flex', alignItems:'center', gap:'8px' }}>
          <Wand2 size={20} color="var(--clr-primary)"/>
          Project Details
        </h2>

        {generating ? (
          <div className="generating-overlay">
            <div className="generating-ring" />
            <div>
              <h3 style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:'8px' }}>Generating your proposal…</h3>
              <p style={{ color:'var(--clr-text-muted)' }}>Our AI is crafting a professional proposal tailored for {form.clientName}.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="form-grid">
              {/* Client Name */}
              <div className="field">
                <label htmlFor="clientName">Client / Company Name</label>
                <div className="input-wrap">
                  <span className="input-icon"><Building2 size={16}/></span>
                  <input id="clientName" name="clientName" type="text" className="input has-icon" placeholder="Acme Corp" value={form.clientName} onChange={handle} required />
                </div>
              </div>

              {/* Client Location */}
              <div className="field">
                <label htmlFor="clientLocation">Client Location</label>
                <div className="input-wrap">
                  <span className="input-icon"><MapPin size={16}/></span>
                  <input id="clientLocation" name="clientLocation" type="text" className="input has-icon" placeholder="New York, USA" value={form.clientLocation} onChange={handle} required />
                </div>
              </div>

              {/* Project Type */}
              <div className="field">
                <label htmlFor="projectType">Project Type</label>
                <div className="input-wrap">
                  <span className="input-icon"><FileText size={16}/></span>
                  <select id="projectType" name="projectType" className="input has-icon" value={form.projectType} onChange={handle}>
                    {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {form.projectType === 'Other' && (
                  <input
                    type="text"
                    name="projectType"
                    className="input"
                    placeholder="Describe your project type…"
                    value={form.customProjectType || ''}
                    onChange={e => setForm(f => ({ ...f, customProjectType: e.target.value }))}
                    required
                    style={{ marginTop: '8px' }}
                  />
                )}
              </div>

              {/* Pages */}
              <div className="field">
                <label htmlFor="pages">Scale / Number of Pages or Campaigns</label>
                <div className="input-wrap">
                  <span className="input-icon"><Hash size={16}/></span>
                  <input id="pages" name="pages" type="number" min="1" className="input has-icon" placeholder="5" value={form.pages} onChange={handle} required />
                </div>
              </div>

              {/* Price */}
              <div className="field">
                <label htmlFor="price">Total Price (USD)</label>
                <div className="input-wrap">
                  <span className="input-icon"><DollarSign size={16}/></span>
                  <input id="price" name="price" type="number" min="0" className="input has-icon" placeholder="2500" value={form.price} onChange={handle} required />
                </div>
              </div>

              {/* Timeline */}
              <div className="field">
                <label htmlFor="timeline">Estimated Timeline</label>
                <div className="input-wrap">
                  <span className="input-icon"><Clock size={16}/></span>
                  <input id="timeline" name="timeline" type="text" className="input has-icon" placeholder="3–4 weeks" value={form.timeline} onChange={handle} required />
                </div>
              </div>

              {/* Description — full width */}
              <div className="field col-span-2">
                <label htmlFor="description">Project Description & Specific Requirements</label>
                <div className="input-wrap">
                  <span className="input-icon input-icon-top"><AlignLeft size={16}/></span>
                  <textarea id="description" name="description" className="input has-icon" placeholder="Describe the client's goals, challenges, and any specific requirements…" value={form.description} onChange={handle} required />
                </div>
              </div>
            </div>

            <div className="generate-bar">
              <button type="submit" className="btn btn-primary btn-lg">
                <Wand2 size={20}/>
                Generate Proposal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
