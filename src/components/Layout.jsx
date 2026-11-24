import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Briefcase, Wallet, Siren, Settings2, ScrollText, Users, LogOut, Car } from 'lucide-react';
import { useAuth } from '../lib/auth';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/verification', label: 'Verification', icon: ShieldCheck },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/finance', label: 'Finance', icon: Wallet },
  { to: '/trust-safety', label: 'Trust & Safety', icon: Siren },
  { to: '/configuration', label: 'Configuration', icon: Settings2 },
  { to: '/audit', label: 'Audit', icon: ScrollText },
  { to: '/accounts', label: 'Accounts', icon: Users },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-navy text-slate-300 md:flex">
        <div className="flex items-center gap-2 px-5 py-5 text-white">
          <Car className="text-brand" />
          <span className="text-lg font-bold">Auto<span className="text-brand">Service</span></span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand text-white' : 'hover:bg-white/10 hover:text-white'}`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4 text-sm">
          <p className="truncate font-medium text-white">{user?.name}</p>
          <p className="truncate text-xs text-slate-400">{user?.email}</p>
          <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs text-slate-300 hover:text-white"><LogOut size={14} /> Sign out</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        {/* compact top bar for small screens */}
        <div className="flex gap-1 overflow-x-auto bg-navy px-3 py-2 md:hidden">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium ${isActive ? 'bg-brand text-white' : 'text-slate-300'}`}>{label}</NavLink>
          ))}
        </div>
        <main className="mx-auto max-w-7xl p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
