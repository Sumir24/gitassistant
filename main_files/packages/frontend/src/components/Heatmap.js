import React, { useMemo } from 'react';

const Heatmap = ({ data = [] }) => {
  const cells = useMemo(() => {
    const generated = [];
    for (let i = 0; i < 147; i++) {
      const count = data[i] || 0;
      let classes = 'w-2 h-2 md:w-3 md:h-3 border border-[rgba(255,255,255,0.08)] rounded-[1px]';
      let style = {};

      if (count >= 4) {
        classes += ' bg-[#F2F4F7]';
        style.border = 'none';
      } else if (count >= 2) {
        classes += ' bg-[#F2F4F7]/40';
        style.border = 'none';
      } else if (count >= 1) {
        classes += ' bg-[#F2F4F7]/10';
        style.border = 'none';
      }
      
      generated.push(<div key={i} className={classes} style={style} title={`${count} contribution${count !== 1 ? 's' : ''}`}></div>);
    }
    return generated;
  }, [data]);

  return (
    <div className="grid grid-cols-21 gap-[2px]" style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))' }}>
      {cells}
    </div>
  );
};

export default Heatmap;
