import React from 'react';

const TopNavBar = ({ onNavigate, currentPage = 'dashboard', user }) => {
  const inactiveClass = "text-xs font-medium text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer";
  const activeClass = "text-xs font-medium text-[#F0F6FC] relative after:absolute after:-bottom-[17px] after:left-0 after:w-full after:h-[1px] after:bg-white cursor-pointer";

  return (
    <header className="fixed top-0 w-full h-12 bg-[#0D1117] border-b border-[#1F2328] flex justify-between items-center px-lg z-50">
      <div className="flex items-center gap-xl">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
            <i className="ph-fill ph-command text-[#0D1117] text-xs"></i>
          </div>
          <span className="font-bold text-sm tracking-tight text-[#F0F6FC]">GitSpeak</span>
        </div>
        <nav className="hidden md:flex gap-lg">
          <button className={currentPage === 'repositories' ? activeClass : inactiveClass} onClick={() => onNavigate && onNavigate('repositories')}>Repositories</button>
          <button className={currentPage === 'dashboard' ? activeClass : inactiveClass} onClick={() => onNavigate && onNavigate('dashboard')}>Activity</button>
          <button className={inactiveClass}>Insights</button>
        </nav>
      </div>
      <div className="flex items-center gap-md">
        <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/5">
          <div className="status-dot bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
          <span className="mono text-[9px] text-[#8B949E] uppercase">Live</span>
        </div>
        <div className="h-4 w-[1px] bg-[#1F2328] mx-1"></div>
        <i className="ph ph-bell text-[18px] text-[#8B949E] hover:text-white cursor-pointer"></i>
        <div 
          className="w-6 h-6 rounded-full border border-white/10 overflow-hidden ml-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            localStorage.removeItem('gitspeak_token');
            window.location.reload();
          }}
          title="Logout"
        >
          <img 
            className="w-full h-full object-cover" 
            alt="User avatar" 
            src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBbbehM84nU8Okqt5bfB-jC-ubiuvPDJars9vW9TeSq_BiK3Ca3frAXROZZv_R-fF7PTBCfAQUk1udstEFUHAAX0Xjh3qDwMa9D0m7OoHR00yf-Lkj_PtFx9wpBzYnw01F-C7gHf0MTpZx3K4JDc0NGElugjNEJbSc8AzOKRA_1lEfTHpAb4VF1b1wRETq4PeEpip-hGxlP07EniJcjrY3UhLFQSrYbI1Xr91y7RpwV5gXDHhHlqcgL3GUjm7VeAsnLhVAhst3SoLdJ4"} 
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
