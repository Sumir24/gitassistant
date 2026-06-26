import React, { useState, useEffect } from 'react';
import RepoCard from '../components/RepoCard';
import TopNavBar from '../components/TopNavBar';
import AiChatWidget from '../components/AiChatWidget';
import CreateRepoModal from '../components/CreateRepoModal';

export default function SelectRepositories({ onNavigate, user }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const token = localStorage.getItem('gitspeak_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:4000/api/repos/github', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (data.repos) {
          const langColors = {
            'JAVASCRIPT': 'bg-yellow-400',
            'TYPESCRIPT': 'bg-blue-400',
            'PYTHON': 'bg-blue-600',
            'GO': 'bg-green-400',
            'RUST': 'bg-orange-400',
            'HTML': 'bg-red-500',
            'CSS': 'bg-blue-300'
          };

          const mappedRepos = data.repos.slice(0, 30).map(r => {
            const lang = r.language ? r.language.toUpperCase() : 'UNKNOWN';
            return {
              id: r.id,
              name: r.name,
              fullName: r.fullName,
              description: r.description || 'No description provided.',
              language: lang,
              color: langColors[lang] || 'bg-gray-400',
              selected: false,
            };
          });
          setRepos(mappedRepos);
        }
      } catch (error) {
        console.error('Failed to fetch repos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [refreshKey]);

  const toggleSelect = (id) => {
    setRepos(repos.map(repo => 
      repo.id === id ? { ...repo, selected: !repo.selected } : repo
    ));
  };

  const selectedCount = repos.filter(r => r.selected).length;

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-32">
      <TopNavBar onNavigate={onNavigate} currentPage="repositories" user={user} />

      <main className="max-w-[1180px] mx-auto px-gutter mt-16">
        {/* Header Section */}
        <div className="mb-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-[-0.01em] mb-md">Select Repositories</h1>
            <div className="relative max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg py-2 pl-10 pr-4 text-on-surface focus:outline-none focus:border-white/50 transition-all font-body-md text-body-md placeholder:text-on-surface-variant/40" 
                placeholder="Search repositories..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-lg flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 whitespace-nowrap self-start md:self-end"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create Repository
          </button>
        </div>

        {/* Repository Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="text-on-surface-variant font-body-md">Loading your repositories from GitHub...</span>
          </div>
        ) : (
          <div className="repository-grid" id="repo-container">
            {filteredRepos.length > 0 ? (
              filteredRepos.map(repo => (
                <RepoCard key={repo.id} repo={repo} toggleSelect={toggleSelect} />
              ))
            ) : (
              <div className="text-on-surface-variant col-span-full text-center py-10">No repositories found.</div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-lg left-1/2 -translate-x-1/2 z-50">
        <div className="glass-pill rounded-full px-lg py-sm flex items-center gap-xl shadow-2xl">
          <div className="flex items-center gap-sm">
            <span className="font-body-md text-body-md text-on-surface-variant" id="selected-count">
              {selectedCount} {selectedCount === 1 ? 'repository' : 'repositories'} selected
            </span>
          </div>
          <button 
            className={`font-body-md text-body-md font-bold py-2 px-lg rounded-full transition-all ${selectedCount > 0 ? 'bg-primary text-on-primary active:scale-95' : 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'}`}
            disabled={selectedCount === 0}
            onClick={() => {
              const selectedRepo = repos.find(r => r.selected);
              if (selectedRepo && selectedRepo.fullName) {
                const [owner, name] = selectedRepo.fullName.split('/');
                onNavigate && onNavigate('repo-dashboard', { repo: { owner, name } });
              }
            }}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-t border-white/10 flex justify-around items-center h-16 px-gutter">
        <button className="flex flex-col items-center text-on-surface-variant/50 active:scale-95 duration-200" onClick={(e) => e.preventDefault()}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-caps text-label-caps mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-primary scale-110 active:scale-95 duration-200" onClick={(e) => e.preventDefault()}>
          <span className="material-symbols-outlined">search</span>
          <span className="font-label-caps text-label-caps mt-1">Search</span>
        </button>
        <button className="flex flex-col items-center text-on-surface-variant/50 active:scale-95 duration-200" onClick={(e) => e.preventDefault()}>
          <span className="material-symbols-outlined">explore</span>
          <span className="font-label-caps text-label-caps mt-1">Explore</span>
        </button>
        <button className="flex flex-col items-center text-on-surface-variant/50 active:scale-95 duration-200" onClick={(e) => e.preventDefault()}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label-caps text-label-caps mt-1">Profile</span>
        </button>
      </nav>

      <AiChatWidget />
      <CreateRepoModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSuccess={() => {
          setCreateModalOpen(false);
          setRefreshKey(k => k + 1);
        }}
      />
    </div>
  );
}
