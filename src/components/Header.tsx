import React from 'react';
import { Sparkles, Bell, Shield, User, Globe, ChevronDown, Cpu, Terminal } from 'lucide-react';
import { UserProfile } from '../../types';

interface HeaderProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  allUsers: UserProfile[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMakerApi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchUser,
  allUsers,
  activeTab,
  setActiveTab,
  onOpenMakerApi
}) => {
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#171717]/80 border-b border-[#2F2F2F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9E7FFF] via-[#38bdf8] to-[#f472b6] p-[2px] shadow-lg shadow-[#9E7FFF]/20 group-hover:shadow-[#9E7FFF]/40 transition-all duration-300">
              <div className="w-full h-full bg-[#171717] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#9E7FFF] animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-[#9E7FFF] bg-clip-text text-transparent">
                  NEXUS<span className="text-[#9E7FFF]">AI</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#9E7FFF]/10 text-[#9E7FFF] border border-[#9E7FFF]/30">
                  ENTERPRISE OS
                </span>
              </div>
              <p className="text-xs text-[#A3A3A3] font-medium hidden sm:block">
                B2B Commerce & Agentic AI Ecosystem
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#262626]/50 p-1.5 rounded-2xl border border-[#2F2F2F]">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'catalog', label: 'B2B Catalog' },
              { id: 'orders', label: 'Wholesale Orders' },
              { id: 'agents', label: 'Agentic Hub' },
              { id: 'analytics', label: 'Global Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#9E7FFF] to-[#805ad5] text-white shadow-md shadow-[#9E7FFF]/30'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Controls: Maker API, Notifications & User Switcher */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenMakerApi}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#9E7FFF]/15 to-[#38bdf8]/15 border border-[#9E7FFF]/30 text-[#9E7FFF] text-sm font-bold hover:from-[#9E7FFF]/25 hover:to-[#38bdf8]/25 hover:border-[#9E7FFF]/50 transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden sm:inline">Maker API</span>
            <span className="sm:hidden">API</span>
          </button>

          <button className="relative p-2.5 rounded-xl bg-[#262626] border border-[#2F2F2F] text-[#A3A3A3] hover:text-white hover:border-[#9E7FFF]/50 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38bdf8]" />
          </button>

          {/* User Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-2xl bg-[#262626] border border-[#2F2F2F] hover:border-[#9E7FFF]/40 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#9E7FFF]/20 to-[#38bdf8]/20 border border-[#9E7FFF]/30 flex items-center justify-center text-[#9E7FFF] font-bold">
                {currentUser.companyName.charAt(0)}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-white truncate max-w-[140px]">{currentUser.companyName}</p>
                <p className="text-[10px] text-[#9E7FFF] capitalize font-medium">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#262626] border border-[#2F2F2F] shadow-2xl p-2 z-50 backdrop-blur-xl">
                <div className="px-3 py-2 border-b border-[#2F2F2F] mb-1">
                  <p className="text-xs font-bold text-white">Switch Persona & Role</p>
                  <p className="text-[10px] text-[#A3A3A3]">Test different ecosystem workflows</p>
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                      currentUser.id === u.id
                        ? 'bg-[#9E7FFF]/15 text-white border border-[#9E7FFF]/30 font-semibold'
                        : 'text-[#A3A3A3] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-white">{u.companyName}</p>
                      <p className="text-[10px] text-[#9E7FFF] capitalize">{u.role.replace('_', ' ')}</p>
                    </div>
                    {currentUser.id === u.id && <Sparkles className="w-4 h-4 text-[#9E7FFF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
