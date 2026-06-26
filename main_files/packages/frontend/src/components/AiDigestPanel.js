import React from 'react';

const AiDigestPanel = ({ digest }) => {
  if (!digest) return null;

  return (
    <div className="py-lg border-b border-[#1F2328] mb-lg grid grid-cols-1 md:grid-cols-4 gap-lg">
      <div className="space-y-1">
        <span className="font-label-caps text-[9px] text-[#8B949E] uppercase">Nightly Digest</span>
        <p className="text-sm text-[#F0F6FC] leading-relaxed" dangerouslySetInnerHTML={{ __html: digest.text }} />
      </div>
      <div className="flex flex-col justify-center border-l border-[#1F2328] pl-lg">
        <span className="font-label-caps text-[9px] text-[#8B949E] uppercase">Total Repositories</span>
        <span className="mono text-lg font-medium text-[#F0F6FC]">{digest.totalRepos || 0}</span>
      </div>
      <div className="flex flex-col justify-center border-l border-[#1F2328] pl-lg">
        <span className="font-label-caps text-[9px] text-[#8B949E] uppercase">Total Stars Earned</span>
        <span className="mono text-lg font-medium text-[#F0F6FC]">{digest.totalStars || 0}</span>
      </div>
      <div className="flex flex-col justify-center border-l border-[#1F2328] pl-lg">
        <span className="font-label-caps text-[9px] text-[#8B949E] uppercase">Followers</span>
        <span className="mono text-lg font-medium text-[#F0F6FC]">{digest.followers || 0}</span>
      </div>
    </div>
  );
};

export default AiDigestPanel;
