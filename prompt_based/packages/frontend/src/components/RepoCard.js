import React from 'react';

export default function RepoCard({ repo, toggleSelect }) {
  return (
    <div 
      className={`repo-card border border-white/10 bg-surface-container rounded-xl p-md flex flex-col justify-between h-40 cursor-pointer ${repo.selected ? 'selected' : 'hover:bg-surface-container-high'}`}
      onClick={() => toggleSelect(repo.id)}
    >
      <div>
        <div className="flex justify-between items-start mb-sm">
          <h3 className="font-body-md text-body-md font-bold text-primary">{repo.name}</h3>
          <span 
            className={`material-symbols-outlined ${repo.selected ? 'text-primary' : 'text-on-surface-variant/20'}`} 
            style={{ fontVariationSettings: repo.selected ? "'FILL' 1" : "'FILL' 0" }}
          >
            {repo.selected ? 'check_circle' : 'radio_button_unchecked'}
          </span>
        </div>
        <p className="text-on-surface-variant line-clamp-2 font-body-md text-body-md opacity-80">{repo.description}</p>
      </div>
      <div className="flex items-center gap-xs mt-md">
        <div className={`w-2 h-2 rounded-full ${repo.color}`}></div>
        <span className="font-label-caps text-label-caps text-on-surface-variant">{repo.language}</span>
      </div>
    </div>
  );
}
