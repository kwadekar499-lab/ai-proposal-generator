import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const navItems = [
  { path:'/dashboard', label:'Dashboard',  icon:LayoutDashboard },
  { path:'/history',   label:'History',    icon:History },
];

export default function DashboardLayout() {
  const { profile, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <>
      <div className="sidebar-brand">
        <div className="brand-icon"><Sparkles size={18}/></div>
        <span className="brand-name">Proposer.ai</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {profile && (
          <div className="user-chip">
            <div className="avatar">{profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}</div>
            <div className="user-info">
              <div className="user-name">{profile.name}</div>
              <div className="user-biz">{profile.businessName || profile.business_name}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ width:'100%', justifyContent:'flex-start', gap:'10px', color:'var(--clr-text-muted)' }}
        >
          <LogOut size={18}/> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">{sidebarContent}</aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div className="overlay-backdrop" onClick={() => setMobileOpen(false)} />
          <aside className="sidebar open">
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position:'absolute', top:'16px', right:'16px', background:'none', border:'none', cursor:'pointer', color:'var(--clr-text-muted)', display:'flex' }}
            >
              <X size={20}/>
            </button>
            {sidebarContent}
          </aside>
        </>
      )}

      <div className="main-area">
        {/* Mobile header */}
        <header className="mobile-header no-print">
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div className="brand-icon" style={{ width:'28px', height:'28px' }}><Sparkles size={15}/></div>
            <span className="brand-name" style={{ fontSize:'1rem' }}>Proposer.ai</span>
          </div>
          <button onClick={() => setMobileOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--clr-text)', display:'flex' }}>
            <Menu size={22}/>
          </button>
        </header>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
