import React, { useEffect } from 'react';

const Authentication = ({ onLogin }) => {
  useEffect(() => {
    console.log(
      "%c GitSpeak %c Authentication Loaded ",
      "background: #F2F4F7; color: #0B0D10; font-weight: bold;",
      "background: #14171C; color: #9298A2;"
    );
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0B0D10] overflow-hidden bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]">
      {/* Subtle Glow behind card */}
      <div className="absolute w-[600px] h-[600px] bg-white/[0.03] blur-[80px] rounded-full pointer-events-none"></div>

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center">
        {/* The Authentication Card */}
        <div className="w-full max-w-[400px] p-8 mx-4 rounded-[12px] border border-[rgba(255,255,255,0.08)] flex flex-col items-center text-center bg-[#14171C] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
          
          {/* Logo/Icon Section */}
          <div className="w-14 h-14 rounded-lg border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-6 bg-gradient-to-br from-white/5 to-transparent">
            <i className="ph ph-terminal-window text-white/90 text-3xl"></i>
          </div>

          {/* Typography Section */}
          <h1 className="font-headline-md text-[24px] font-semibold text-white mb-2">
            Welcome to GitSpeak.
          </h1>
          <p className="font-body-md text-[15px] text-[#9298A2] mb-8">
            The single-player orchestrator for your codebase.
          </p>

          {/* Action Section */}
          <div className="w-full space-y-4">
            <button 
              onClick={() => {
                window.location.href = 'http://localhost:4000/api/auth/github';
              }}
              className="w-full h-11 bg-[#F2F4F7] text-[#0B0D10] rounded-[8px] flex items-center justify-center gap-2 font-semibold tracking-tight text-[14px] transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#ffffff] hover:-translate-y-px active:translate-y-0 active:opacity-90">
              <i className="ph ph-github-logo text-xl"></i>
              Continue with GitHub
            </button>
            <button 
              onClick={onLogin}
              className="w-full h-11 rounded-[8px] border border-[rgba(255,255,255,0.08)] text-white hover:bg-white/5 transition-colors font-medium text-[14px]">
              Enter Access Key
            </button>
          </div>

          {/* Metadata/Footer Section */}
          <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.04)] w-full">
            <p className="font-label-caps text-[11px] text-[#9298A2] leading-relaxed mb-4">
              GitSpeak requests access to your repositories to perform git operations. We never store your source code.
            </p>
            <div className="flex justify-center gap-4 text-[10px] font-label-caps text-[#9298A2]/60">
              <a className="hover:text-white transition-colors" href="#privacy">Privacy</a>
              <span>•</span>
              <a className="hover:text-white transition-colors" href="#terms">Terms</a>
              <span>•</span>
              <a className="hover:text-white transition-colors" href="#security">Security</a>
            </div>
          </div>
        </div>

        {/* Environmental Detail: Bottom Brand Label */}
        <div className="mt-8 flex justify-center items-center gap-2 opacity-30">
          <span className="font-code-sm text-[12px] tracking-widest uppercase text-[#9298A2]">Orchestrator v2.4.0</span>
        </div>
      </main>
    </div>
  );
};

export default Authentication;
