import React from 'react';

const RightPanel = ({ dashboardData }) => {
  const details = dashboardData?.details || {};
  const contributors = dashboardData?.contributors || [];

  return (
    <section className="w-[320px] flex flex-col bg-surface overflow-y-auto">
      {/* Repository Details */}
      <div className="p-md border-b border-outline-variant space-y-md shrink-0">
        <div className="space-y-sm">
          <span className="font-label-caps text-label-caps text-on-surface-variant opacity-60">ABOUT</span>
          <p className="text-body-md text-on-surface leading-snug">{details.description || 'No description provided.'}</p>
        </div>
        <div className="flex justify-between items-center text-[12px]">
          <div className="flex items-center gap-4 text-on-surface-variant">
            <span className="flex items-center gap-1 hover:text-primary cursor-pointer"><i className="ph ph-star"></i> {details.stars || 0}</span>
            <span className="flex items-center gap-1 hover:text-primary cursor-pointer"><i className="ph ph-git-fork"></i> {details.forks || 0}</span>
            <span className="flex items-center gap-1 hover:text-primary cursor-pointer"><i className="ph ph-eye"></i> {details.watchers || 0}</span>
          </div>
        </div>
        {details.language && (
        <div className="space-y-sm">
          <div className="flex justify-between text-[10px] font-bold tracking-wider">
            <span className="text-on-surface">LANGUAGE</span>
          </div>
          <div className="flex gap-4 text-[11px] font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {details.language}</span>
          </div>
        </div>
        )}
        {contributors.length > 0 && (
        <div className="space-y-sm">
          <span className="font-label-caps text-label-caps text-on-surface-variant opacity-60">CONTRIBUTORS</span>
          <div className="flex -space-x-2">
            {contributors.slice(0, 5).map((c, i) => (
              <img key={i} className="w-6 h-6 rounded-full border border-surface bg-surface-variant" alt={c.login} src={c.avatar} title={c.login} />
            ))}
            {contributors.length > 5 && (
              <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[9px] font-bold">+{contributors.length - 5}</div>
            )}
          </div>
        </div>
        )}
      </div>
      {/* Commit Panel */}
      <div className="p-md flex-1 flex flex-col space-y-md">
        <span className="font-label-caps text-label-caps text-on-surface">COMMIT CHANGES</span>
        <div className="space-y-sm">
          <label className="font-label-caps text-label-caps text-on-surface-variant opacity-60">SUMMARY</label>
          <input className="w-full bg-surface-container-high border-outline-variant text-body-md font-body-md focus:border-primary focus:ring-0 placeholder:text-outline/40 p-2" placeholder="Refactor session management" type="text" />
        </div>
        <div className="space-y-sm flex-1 flex flex-col">
          <label className="font-label-caps text-label-caps text-on-surface-variant opacity-60">DESCRIPTION</label>
          <textarea className="flex-1 w-full bg-surface-container-high border-outline-variant text-body-md font-body-md focus:border-primary focus:ring-0 placeholder:text-outline/40 resize-none p-md" placeholder="Add a more detailed description..."></textarea>
        </div>
        <div className="pt-md border-t border-outline-variant">
          <div className="flex items-center gap-3 mb-md">
            <img className="w-6 h-6 rounded-full border border-outline-variant" alt="Commiter Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzQ9VsfiW_pf5f-JCdeTAmEilj2tg10VYLhFvh8QYEzNQt5bvfczTtWdYuEPb4OYvRIH_NArjPpmTljOirK_4-w4-G1Uimrq4Yo-H5qBsqayQ-GfhWRpZDZXJc77DRs8BwJyDwNYvlq1qQLaNVygU10cVQE6r4AJ44MMD6w68VlAezpmHTOt-u2vGoo5Xux3EvXG7x2s7MvxJJasyV3etfMPJikF0BPPvwZx2ABYG46DfCqh_9d524Fxm4UFgQHS2K64DvWjvgiq5y"/>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-on-surface">Dev Orchestrator</span>
              <span className="text-[10px] text-on-surface-variant">dev@gitspeak.io</span>
            </div>
          </div>
          <button className="w-full bg-primary text-on-primary font-bold py-2.5 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <i className="ph ph-upload-simple font-bold"></i>
            Commit to branch
          </button>
        </div>
      </div>
    </section>
  );
};

export default RightPanel;
