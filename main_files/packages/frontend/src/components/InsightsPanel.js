import React from 'react';
import Heatmap from './Heatmap';

const InsightsPanel = ({ insights }) => {
  if (!insights) return null;

  const renderSparkline = (data) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 35 - ((val / max) * 30);
      return `${x} ${y}`;
    });
    
    const pathD = `M${points[0]} ` + points.slice(1).map(p => `L${p}`).join(' ');
    const fillPathD = `${pathD} L100 40 L0 40 Z`;
    const lastY = 35 - ((data[data.length - 1] / max) * 30);

    return { pathD, fillPathD, lastY };
  };

  const sparkline = renderSparkline(insights.velocity?.sparkline);

  return (
    <>
      <div className="p-md bg-[#0D1117] border border-[#1F2328] rounded-lg">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-label-caps text-[10px] text-[#8B949E] uppercase tracking-wider mb-1">Weekly Velocity</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[#F0F6FC]">{insights.velocity?.value || '+0%'}</span>
              {insights.velocity?.isPositive ? (
                <span className="mono text-[10px] text-green-500/80">▲</span>
              ) : (
                <span className="mono text-[10px] text-red-500/80">▼</span>
              )}
            </div>
          </div>
          <span className="mono text-[9px] text-white/20 uppercase">Last 7 Days</span>
        </div>
        <div className="h-20 w-full relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
            <defs>
              <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)"></stop>
                <stop offset="100%" stopColor="rgba(255,255,255,0)"></stop>
              </linearGradient>
            </defs>
            {sparkline && (
              <>
                <path d={sparkline.fillPathD} fill="url(#lineGrad)"></path>
                <path d={sparkline.pathD} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"></path>
                <circle cx="100" cy={sparkline.lastY} fill="white" r="2"></circle>
              </>
            )}
          </svg>
        </div>
        <div className="mt-4 flex justify-between px-1">
          <span className="mono text-[9px] text-white/20">MON</span>
          <span className="mono text-[9px] text-white/20">WED</span>
          <span className="mono text-[9px] text-white/20">FRI</span>
          <span className="mono text-[9px] text-white/20">SUN</span>
        </div>
      </div>

      <div className="p-md bg-[#0D1117] border border-[#1F2328] rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-caps text-[10px] text-[#8B949E] uppercase tracking-wider">Critical Queue</h3>
          <div className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20">
            <span className="mono text-[9px] text-red-400 font-bold">{insights.attentionItems?.length || 0} ACTIVE</span>
          </div>
        </div>
        <div className="space-y-3">
          {insights.attentionItems?.length > 0 ? insights.attentionItems.map((item) => (
            <div key={item.id} className="group flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
              <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${item.color}`}></div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#F0F6FC] font-medium truncate group-hover:text-white">{item.title}</p>
                <p className="mono text-[10px] text-white/40 mt-0.5">{item.subtitle}</p>
              </div>
              <i className="ph ph-arrow-right text-xs text-white/20 group-hover:text-white mt-1"></i>
            </div>
          )) : (
            <div className="text-center py-4">
              <p className="mono text-[10px] text-white/40">No pending items.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-md bg-[#0D1117] border border-[#1F2328] rounded-lg">
        <h3 className="font-label-caps text-[10px] text-[#8B949E] uppercase tracking-wider mb-4">Language Breakdown</h3>
        <div className="space-y-4">
          {insights.languages?.length > 0 ? insights.languages.map((lang) => (
            <div key={lang.name} className="flex items-center justify-between">
              <span className="mono text-[11px] text-white/60">{lang.name.toUpperCase()}</span>
              <div className="flex-1 mx-3 h-1.5 bg-[#1F2328] rounded-full overflow-hidden">
                <div className="h-full" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}></div>
              </div>
              <span className="mono text-[11px] text-white/40 w-10 text-right">{lang.percentage.toFixed(1)}%</span>
            </div>
          )) : (
            <div className="text-center py-2">
              <span className="mono text-[10px] text-white/40">No language data available.</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-md bg-[#0D1117] border border-[#1F2328] rounded-lg flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-label-caps text-[10px] text-[#8B949E] uppercase tracking-wider mb-6">Contribution Heatmap</h3>
          <Heatmap data={insights.heatmap || []} />
        </div>
        <div className="mt-6 flex justify-between items-center">
          <span className="mono text-[9px] text-white/20 uppercase">Past 12 Weeks</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 border border-white/5 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-white/20 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-white/50 rounded-[2px]"></div>
            <div className="w-3 h-3 bg-white rounded-[2px]"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsightsPanel;
