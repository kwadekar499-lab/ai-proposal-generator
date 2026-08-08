import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import html2pdf from 'html2pdf.js';
import { ArrowLeft, Copy, Download, Pencil, Check, X, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ProposalView() {
  const { id }                          = useParams();
  const { history, updateProposal, profile, showToast } = useApp();
  const [proposal, setProposal]         = useState(null);
  const [editing, setEditing]           = useState(false);
  const [editContent, setEditContent]   = useState('');
  const [downloading, setDownloading]   = useState(false);
  const [copied, setCopied]             = useState(false);
  const paperRef                        = useRef(null);

  useEffect(() => {
    const found = history.find(p => p.id === id);
    if (found) { setProposal(found); setEditContent(found.content); }
  }, [id, history]);

  if (!proposal) return (
    <div className="fade-up" style={{ textAlign:'center', padding:'80px 24px' }}>
      <p style={{ color:'var(--clr-text-muted)' }}>Proposal not found.</p>
      <Link to="/history" className="btn btn-ghost" style={{ marginTop:'16px' }}>Back to History</Link>
    </div>
  );

  // ─── Actions ───────────────────────────────────────────────
  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal.content);
    setCopied(true);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!paperRef.current) return;
    setDownloading(true);
    const el = paperRef.current;
    html2pdf()
      .set({
        margin: 0,
        filename: `Proposal-${proposal.clientName.replace(/\s+/g,'-')}.pdf`,
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)
      .save()
      .then(() => { setDownloading(false); showToast('PDF downloaded!'); });
  };

  const handleSaveEdit = async () => {
    try {
      await updateProposal(id, editContent);
      setProposal(p => ({ ...p, content: editContent }));
      setEditing(false);
    } catch (err) {
      // Error toast handled inside updateProposal
    }
  };

  const handleCancelEdit = () => {
    setEditContent(proposal.content);
    setEditing(false);
  };

  return (
    <div className="fade-up">
      {/* ─── Actions Bar ─── */}
      <div className="proposal-actions-bar no-print">
        <div>
          <Link to="/history" style={{ display:'inline-flex', alignItems:'center', gap:'6px', fontSize:'0.84rem', color:'var(--clr-text-muted)', fontWeight:500, textDecoration:'none', marginBottom:'8px' }}>
            <ArrowLeft size={15}/> Proposal History
          </Link>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800 }}>Proposal for {proposal.clientName}</h1>
          <p style={{ color:'var(--clr-text-muted)', fontSize:'0.875rem', marginTop:'4px' }}>
            {proposal.projectType} · {proposal.date}
          </p>
        </div>

        <div className="actions">
          <button onClick={handleCopy} className="btn btn-ghost">
            {copied ? <><Check size={16}/>Copied!</> : <><Copy size={16}/>Copy</>}
          </button>

          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn btn-ghost">
              <Pencil size={16}/> Edit
            </button>
          ) : (
            <>
              <button onClick={handleCancelEdit} className="btn btn-ghost">
                <X size={16}/> Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary">
                <Save size={16}/> Save
              </button>
            </>
          )}

          {!editing && (
            <button onClick={handleDownload} className="btn btn-primary" disabled={downloading}>
              {downloading
                ? <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                : <Download size={16}/>
              }
              {downloading ? 'Exporting…' : 'Download PDF'}
            </button>
          )}
        </div>
      </div>

      {/* ─── Edit Mode ─── */}
      {editing ? (
        <div style={{ marginTop:'8px' }}>
          <p style={{ fontSize:'0.82rem', color:'var(--clr-text-muted)', marginBottom:'12px' }}>✏️ Editing in Markdown — changes are saved to your history.</p>
          <textarea
            className="edit-area"
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
        </div>
      ) : (
        /* ─── Paper Preview ─── */
        <div className="paper-wrapper" style={{ marginTop:'8px' }}>
          <div ref={paperRef}>
            {/* Stripe header */}
            <div className="paper-header-stripe">
              <div>
                <div className="ph-brand">{profile?.businessName || 'Proposer.ai'}</div>
                <div className="ph-tag">{profile?.email}</div>
              </div>
              <div className="ph-badge">Digital Marketing Proposal</div>
            </div>

            {/* Markdown body */}
            <div className="md-body">
              <ReactMarkdown
                components={{
                  table: ({ children }) => (
                    <div style={{ overflowX:'auto', marginBottom:'16px' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'14px' }}>{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th style={{ padding:'10px 14px', textAlign:'left', background:'#f3f4f6', borderBottom:'2px solid #e5e7eb', fontWeight:700, fontSize:'13px' }}>{children}</th>
                  ),
                  td: ({ children }) => (
                    <td style={{ padding:'10px 14px', borderBottom:'1px solid #f3f4f6', fontSize:'14px' }}>{children}</td>
                  ),
                }}
              >
                {proposal.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
