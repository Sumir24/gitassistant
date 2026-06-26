import React, { useState, useMemo } from 'react';

const FileTreeItem = ({ item, treeMap, level, selectedFile, onFileSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const isDir = item.type === 'tree';
  const isSelected = selectedFile && selectedFile.path === item.path;
  
  const children = treeMap[item.path] || [];

  const handleClick = () => {
    if (isDir) {
      setExpanded(!expanded);
    } else {
      if (onFileSelect) {
        onFileSelect({
          name: item.path.split('/').pop(),
          path: item.path,
          type: 'file'
        });
      }
    }
  };

  return (
    <div>
      <div 
        onClick={handleClick}
        className={`flex items-center py-1.5 cursor-pointer group ${isSelected ? 'bg-surface-variant border-l-2 border-primary' : 'hover:bg-surface-variant'}`}
        style={{ paddingLeft: `${level * 12 + 16}px`, paddingRight: '16px' }}
      >
        <i className={`ph ${isDir ? (expanded ? 'ph-folder-open' : 'ph-folder') + ' text-yellow-500' : 'ph-file-text text-on-surface-variant group-hover:text-primary'} text-[16px] mr-2 shrink-0`}></i>
        <span className={`flex-1 truncate font-code-sm text-code-sm ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{item.path.split('/').pop()}</span>
      </div>
      {expanded && children.map(child => (
        <FileTreeItem 
          key={child.path} 
          item={child} 
          treeMap={treeMap}
          level={level + 1} 
          selectedFile={selectedFile} 
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
};

const ReviewSideNav = ({ tree, selectedFile, onFileSelect }) => {
  const { rootItems, treeMap } = useMemo(() => {
    if (!tree) return { rootItems: [], treeMap: {} };
    
    const rootItems = [];
    const treeMap = {};
    
    const sortedTree = [...tree].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'tree' ? -1 : 1;
      return a.path.localeCompare(b.path);
    });

    sortedTree.forEach(item => {
      const parts = item.path.split('/');
      if (parts.length === 1) {
        rootItems.push(item);
      } else {
        const parentPath = parts.slice(0, -1).join('/');
        if (!treeMap[parentPath]) treeMap[parentPath] = [];
        treeMap[parentPath].push(item);
      }
    });
    
    return { rootItems, treeMap };
  }, [tree]);

  return (
    <aside className="fixed left-0 top-[5.5rem] h-[calc(100vh-5.5rem)] w-16 md:w-64 bg-surface border-r border-outline-variant flex flex-col hidden md:flex z-40">
      <div className="p-md border-b border-outline-variant shrink-0">
        <div className="flex bg-surface-variant p-0.5 border border-outline-variant">
          <button className="flex-1 py-1 text-[10px] font-bold tracking-wider text-on-surface-variant hover:text-primary">CHANGES</button>
          <button className="flex-1 py-1 text-[10px] font-bold tracking-wider bg-surface text-primary border border-outline-variant">EXPLORER</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {tree ? rootItems.map(item => (
            <FileTreeItem 
              key={item.path} 
              item={item} 
              treeMap={treeMap}
              level={0}
              selectedFile={selectedFile} 
              onFileSelect={onFileSelect} 
            />
          )) : (
            <div className="px-md py-4 font-code-sm text-xs text-on-surface-variant text-center">Loading contents...</div>
          )}
        </div>
      </div>
      <footer className="mt-auto border-t border-outline-variant px-md py-4 space-y-2 shrink-0">
        <div className="flex items-center gap-md text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
          <i className="ph ph-lifebuoy"></i>
          <span className="font-label-caps text-label-caps">Support</span>
        </div>
        <div className="flex items-center gap-md text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
          <i className="ph ph-terminal-window"></i>
          <span className="font-label-caps text-label-caps">Terminal</span>
        </div>
      </footer>
    </aside>
  );
};

export default ReviewSideNav;
