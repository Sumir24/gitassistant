import React, { useState } from 'react';

const ActivityFeed = ({ activities = [] }) => {
  const [visibleCount, setVisibleCount] = useState(10);
  
  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };
  
  const visibleActivities = activities.slice(0, visibleCount);
  const hasMore = visibleCount < activities.length;

  return (
    <>
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <h2 className="font-label-caps text-[11px] text-white tracking-widest uppercase">Global Activity</h2>
          <span className="mono text-[9px] text-white/30 border border-white/10 px-1.5 py-0.5 rounded">Real-time</span>
          <span className="mono text-[9px] text-blue-400/80 border border-blue-400/20 px-1.5 py-0.5 rounded bg-blue-500/10">
            {activities.length} Total Event{activities.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex gap-2">
          <button className="mono text-[10px] text-[#8B949E] hover:text-white transition-colors">Filters</button>
          <span className="text-[#1F2328]">/</span>
          <button className="mono text-[10px] text-[#8B949E] hover:text-white transition-colors">Clear</button>
        </div>
      </div>
      <div className="space-y-[1px] border border-[#1F2328] rounded overflow-hidden">
        {visibleActivities.map((activity) => (
          <div key={activity.id} className="activity-row flex items-center gap-md px-md py-2.5 transition-colors cursor-default border-b border-[#1F2328] last:border-0">
            <div className="w-6 h-6 rounded-full border border-white/5 overflow-hidden flex-shrink-0 bg-[#161B22]"></div>
            <i className={`ph ${activity.icon} text-white/40 text-[14px]`}></i>
            <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
              <span className="mono text-[11px] text-white/50 flex-shrink-0">{activity.repo}</span>
              <p className="text-sm text-[#F0F6FC] truncate font-medium">{activity.title}</p>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              {activity.hash && <span className="mono text-[10px] text-white px-2 py-0.5 bg-white/5 rounded-sm">{activity.hash}</span>}
              <span className="mono text-[10px] text-white/30 hidden sm:block">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center py-4">
        <button 
          onClick={handleLoadMore}
          disabled={!hasMore}
          className={`mono text-[10px] uppercase tracking-widest border px-6 py-2 rounded transition-all ${
            hasMore 
              ? 'text-[#8B949E] hover:text-white border-[#1F2328] hover:bg-white/5' 
              : 'text-white/20 border-white/5 cursor-not-allowed'
          }`}
        >
          {hasMore ? 'Load More Stream Data' : 'No More Data'}
        </button>
      </div>
    </>
  );
};

export default ActivityFeed;
