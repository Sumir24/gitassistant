import React from 'react';

const ReviewHeader = ({ repoDetails }) => {
  const [owner, name] = (repoDetails?.fullName || 'acme-corp/engine-core').split('/');
  const defaultBranch = repoDetails?.defaultBranch || 'feature/auth-refactor';

  return (
    <header className="fixed top-0 w-full h-12 bg-surface flex justify-between items-center px-lg z-50 border-b border-outline-variant">
      <div className="flex items-center gap-md">
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">GitSpeak</span>
        <div className="h-4 w-px bg-outline-variant mx-sm"></div>
        <div className="flex items-center gap-xs">
          <span className="text-on-surface-variant font-medium">{owner}</span>
          <span className="text-outline">/</span>
          <span className="text-primary font-bold">{name}</span>
        </div>
        <div className="ml-md px-2 py-0.5 bg-surface-variant border border-outline-variant flex items-center gap-2">
          <i className="ph ph-git-branch text-[14px]"></i>
          <span className="font-code-sm text-[10px] uppercase tracking-wider">{defaultBranch}</span>
        </div>
      </div>
      <div className="flex items-center gap-lg">
        <div className="flex items-center gap-md">
          <button className="ph ph-bell text-[18px] text-on-surface-variant hover:text-primary transition-all"></button>
          <button className="ph ph-gear text-[18px] text-on-surface-variant hover:text-primary transition-all"></button>
          <img
            alt="User avatar"
            className="w-7 h-7 rounded-full border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQSxg9IKZE4F6Kl5jEDbO9j85mRIHAwipKPy1nP0-sUjxvQbKl7Ypa1LcAyTMkc2Ph9fUxIlgSMEybI8Y2Q5eUE4YMyxdZhTrWrsDHo8A7GbD5PcTMEvs057rSIVkKFMDg19brgDNeyv-tILPxnzljkptQk7s5tis7MGTL6wLBxd53MJhDEY4YojiW_7H0suVUwdly52iZb2VvLHDnSFmMudrWb_9M2OunWGhh3HUqrDlKT60P2k8nFJJp0BpR16ydPiw11SzNx_bS"
          />
        </div>
      </div>
    </header>
  );
};

export default ReviewHeader;
