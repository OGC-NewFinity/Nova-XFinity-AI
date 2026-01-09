
import React from 'react';
import htm from 'htm';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const html = htm.bind(React.createElement);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const menuItems = [
    { id: 'agent', label: 'Agent', icon: 'fa-gauge-high', route: '/dashboard/agent' },
    { id: 'articles', label: 'SEO Writer', icon: 'fa-feather-pointed', route: '/dashboard/articles' },
    { id: 'mediahub', label: 'Media Hub', icon: 'fa-photo-film', route: '/media' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope', route: '/dashboard/research' },
    { id: 'account', label: 'Account', icon: 'fa-user-circle', route: '/account/profile' },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders', route: '/dashboard/settings' },
    // Admin-only items
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin', icon: 'fa-shield-halved', route: '/admin', adminOnly: true },
      { id: 'admin-settings', label: 'Admin Settings', icon: 'fa-cog', route: '/admin/settings', adminOnly: true }
    ] : [])
  ];

  const handleClick = (item) => {
    navigate(item.route);
  };

  const isActive = (item) => {
    // Check if current pathname matches the route or starts with it for nested routes
    if (item.id === 'mediahub') {
      return location.pathname.startsWith('/media');
    }
    if (item.id === 'account') {
      return location.pathname.startsWith('/account');
    }
    if (item.id === 'admin-settings') {
      return location.pathname === '/admin/settings';
    }
    if (item.id === 'admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === item.route || location.pathname.startsWith(item.route + '/');
  };

  return html`
    <div className="w-64 bg-slate-950 h-screen sticky top-0 text-slate-300 flex flex-col border-r border-slate-800/50">
      <div className="p-8 border-b border-slate-900 flex items-center justify-center">
        <img 
          src="/brand-identity/logo/nova-logo.png" 
          alt="Nova‑XFinity AI Logo" 
          className="sidebar-logo w-12 h-12 object-contain"
        />
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-2">
        ${menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
          const active = isActive(item);
          return html`
          <button
            key=${item.id}
            onClick=${() => handleClick(item)}
            className=${`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group ${
              active
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : item.adminOnly
                ? 'hover:bg-purple-900/30 hover:text-purple-300 border border-purple-800/30'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <i className=${`fa-solid ${item.icon} w-6 text-sm transition-all ${active ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-60'}`}></i>
            <span className="font-bold text-sm tracking-tight">${item.label}</span>
            ${item.adminOnly && html`<span className="ml-auto text-[8px] font-black text-purple-400 uppercase">Admin</span>`}
          </button>
        `})}
      </nav>

      <div className="p-8 mt-auto">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Engine Status</div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">Connected</span>
                </div>
                <span className="text-[9px] text-slate-600 font-black">v2.1.0</span>
            </div>
        </div>
      </div>
    </div>
  `;
};

export default Sidebar;
