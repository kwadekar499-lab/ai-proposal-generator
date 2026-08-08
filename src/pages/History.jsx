import { Link } from 'react-router-dom';
import { FileText, Trash2, ArrowRight, PlusCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function History() {
  const { history, proposalsLoading, deleteProposal } = useApp();

  const handleDelete = async (id, clientName, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Delete proposal for "${clientName}"?`)) {
      await deleteProposal(id);
    }
  };

  return (
    <div className="fade-up">
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Proposal History</h1>
          <p>{history.length} proposal{history.length !== 1 ? 's' : ''} generated</p>
        </div>
        <Link to="/dashboard" className="btn btn-primary no-print">
          <PlusCircle size={18}/> New Proposal
        </Link>
      </div>

      {proposalsLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div className="generating-ring" style={{ margin: '0 auto 16px auto' }} />
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem' }}>Loading proposals from InsForge database…</p>
        </div>
      ) : history.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">
            <FileText size={32}/>
          </div>
          <h3>No proposals yet</h3>
          <p>Generate your first professional proposal in seconds — just fill in the project details.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop:'8px' }}>
            <PlusCircle size={18}/> Create First Proposal
          </Link>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((proposal, i) => (
            <Link
              key={proposal.id}
              to={`/proposal/${proposal.id}`}
              className="card card-hover proposal-card"
              style={{ animationDelay:`${i * 0.04}s` }}
            >
              <div className="proposal-card-meta">
                <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--clr-text-muted)', fontSize:'0.78rem' }}>
                  <Clock size={13}/> {proposal.date}
                </div>
                <span className="badge badge-primary">{proposal.status}</span>
              </div>

              <div className="proposal-card-body">
                <h3 style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'4px' }}>{proposal.clientName}</h3>
                <p style={{ color:'var(--clr-text-muted)', fontSize:'0.85rem' }}>{proposal.projectType}</p>
                {proposal.clientLocation && (
                  <p style={{ color:'var(--clr-text-muted)', fontSize:'0.8rem', marginTop:'2px' }}>📍 {proposal.clientLocation}</p>
                )}
              </div>

              <div className="proposal-card-footer">
                <span className="proposal-price">${Number(proposal.price || 0).toLocaleString()}</span>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <button
                    onClick={(e) => handleDelete(proposal.id, proposal.clientName, e)}
                    className="btn btn-icon"
                    style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--clr-text-muted)', padding:'6px' }}
                    title="Delete"
                  >
                    <Trash2 size={15}/>
                  </button>
                  <ArrowRight size={17} color="var(--clr-primary)"/>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
