import React from 'react';

const ReviewNav = () => {
  return (
    <nav className="fixed top-12 w-full h-10 bg-surface border-b border-outline-variant z-40 flex items-center px-lg gap-lg">
      <button className="flex items-center gap-2 h-full px-1 tab-active font-medium text-body-md">
        <i className="ph ph-code"></i> Code
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-warning-circle"></i> Issues <span className="bg-surface-variant px-1.5 rounded-full text-[10px]">12</span>
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-git-pull-request"></i> Pull Requests <span className="bg-surface-variant px-1.5 rounded-full text-[10px]">3</span>
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-play"></i> Actions
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-projector-screen-chart"></i> Projects
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-shield-checkered"></i> Security
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-chart-line-up"></i> Insights
      </button>
      <button className="flex items-center gap-2 h-full px-1 text-on-surface-variant hover:text-primary transition-colors text-body-md">
        <i className="ph ph-gear-six"></i> Settings
      </button>
    </nav>
  );
};

export default ReviewNav;
