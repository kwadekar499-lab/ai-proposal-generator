import { useState, useEffect, useCallback } from 'react';
import { BarChart3, Users, Clock, RefreshCw, Smartphone, Monitor, ShieldCheck, Calendar } from 'lucide-react';
import { loginLogService } from '../services/loginLogService';
import { useApp } from '../context/AppContext';

export default function AdminAnalytics() {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalLoginsToday: 0,
    dau: 0,
    last20Logins: [],
    trendData: []
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loginLogService.getAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      showToast(err.message || 'Failed to load login analytics', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Max value calculation for trend chart scaling
  const maxTrend = Math.max(...(analytics.trendData.map(d => d.count) || [1]), 5);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 className="text-primary" size={28} />
            Login Analytics & Insights
          </h1>
          <p style={{ color: 'var(--clr-text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time authentication tracking, Daily Active Users (DAU), and login trends powered by InsForge
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="btn btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          Refresh
        </button>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Metric 1: Total Logins Today */}
        <div className="card" style={{ padding: '20px 24px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Total Logins Today</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '…' : analytics.totalLoginsToday}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#60a5fa', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Recorded via InsForge Logger
          </div>
        </div>

        {/* Metric 2: Daily Active Users */}
        <div className="card" style={{ padding: '20px 24px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Daily Active Users (DAU)</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
            {loading ? '…' : analytics.dau}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Unique authenticated accounts today
          </div>
        </div>

        {/* Metric 3: Active Tracking Status */}
        <div className="card" style={{ padding: '20px 24px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)', fontWeight: 600 }}>Tracking Backend</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '6px' }}>
            PostgreSQL / InsForge
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', marginTop: '8px' }}>
            `login_logs` & `profiles.last_login` synced
          </div>
        </div>
      </div>

      {/* Login Trend Chart */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} className="text-primary" />
          7-Day Login Trend
        </h2>

        <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0 30px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {analytics.trendData.map((d) => {
            const pct = Math.max((d.count / maxTrend) * 100, 8);
            return (
              <div key={d.dateStr} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', marginBottom: '6px' }}>{d.count}</span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${pct}%`,
                    background: 'linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.2) 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.3s ease'
                  }}
                />
                <span style={{ position: 'absolute', bottom: '-26px', fontSize: '0.75rem', color: 'var(--clr-text-muted)', whiteSpace: 'nowrap' }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Last 20 Logins Table */}
      <div className="card" style={{ padding: '24px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} className="text-primary" />
          Recent Login Log History (Last 20)
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--clr-text-muted)' }}>
            Loading login logs...
          </div>
        ) : analytics.last20Logins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--clr-text-muted)' }}>
            No login logs recorded yet. Log out and sign in to generate logs.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--clr-text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>User</th>
                  <th style={{ padding: '12px 14px' }}>Login Time</th>
                  <th style={{ padding: '12px 14px' }}>Browser</th>
                  <th style={{ padding: '12px 14px' }}>Device</th>
                </tr>
              </thead>
              <tbody>
                {analytics.last20Logins.map((log) => {
                  const formattedTime = new Date(log.created_at || log.login_time).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#f8fafc' }}>
                        <div>{log.userName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--clr-text-muted)', fontWeight: 400 }}>{log.userEmail}</div>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--clr-text-soft)' }}>
                        {formattedTime}
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--clr-text-soft)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Monitor size={14} className="text-primary" />
                          {log.browser || 'Chrome'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--clr-text-soft)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Smartphone size={14} style={{ color: '#4ade80' }} />
                          {log.device || 'Desktop'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
