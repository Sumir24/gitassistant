import React, { useState, useEffect } from 'react';

const CreateRepoModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    private: false,
    auto_init: true,
    gitignore_template: '',
    license_template: ''
  });
  
  const [localPath, setLocalPath] = useState('');
  const [gitignores, setGitignores] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const token = localStorage.getItem('gitspeak_token');
        const [giRes, licRes] = await Promise.all([
          fetch('http://localhost:4000/api/repos/github/gitignore-templates', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('http://localhost:4000/api/repos/github/licenses', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        const giData = await giRes.json();
        const licData = await licRes.json();
        if (giData.templates) setGitignores(giData.templates);
        if (licData.licenses) setLicenses(licData.licenses);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      } finally {
        setLoadingOptions(false);
      }
    };
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('gitspeak_token');
      const res = await fetch('http://localhost:4000/api/ai/generate-repo-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.config) {
        setFormData(prev => ({
          ...prev,
          name: data.config.name || prev.name,
          description: data.config.description || prev.description,
          private: data.config.private !== undefined ? data.config.private : prev.private,
          auto_init: data.config.auto_init !== undefined ? data.config.auto_init : prev.auto_init
        }));
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate config from AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileContent = event.target.result;
      setIsAiLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('gitspeak_token');
        const res = await fetch('http://localhost:4000/api/ai/generate-repo-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ fileContent, prompt: 'Analyze this file and extract repository configuration.' })
        });
        const data = await res.json();
        if (data.config) {
          setFormData(prev => ({
            ...prev,
            name: data.config.name || prev.name,
            description: data.config.description || prev.description,
            private: data.config.private !== undefined ? data.config.private : prev.private,
            auto_init: data.config.auto_init !== undefined ? data.config.auto_init : prev.auto_init
          }));
        } else if (data.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to generate config from file.');
      } finally {
        setIsAiLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('gitspeak_token');
      const res = await fetch('http://localhost:4000/api/repos/github/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ repoData: formData, localPath })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create repository');
      }
      onSuccess(data.repo);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-surface-container-high rounded-2xl border border-white/10 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-headline-sm text-on-surface">Create New Repository</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* AI Assist Section */}
          <div className="md:w-1/2 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
            <div>
              <h3 className="font-title-md text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                AI Assist
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Describe the repository you want to create, or upload a config file like <code className="bg-surface-container text-on-surface px-1 py-0.5 rounded text-xs">package.json</code> and AI will pre-fill the details.
              </p>
            </div>
            
            <textarea 
              className="w-full bg-surface-container-lowest border border-white/10 rounded-lg p-3 text-sm text-on-surface focus:outline-none focus:border-primary/50 resize-none h-24"
              placeholder="e.g. A React project for a blog with a dark mode theme..."
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            
            <button 
              onClick={handleAiAssist}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="w-full bg-surface-container-highest text-on-surface hover:bg-white/10 font-label-lg py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAiLoading ? <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span> : <span className="material-symbols-outlined text-[18px]">magic_button</span>}
              Generate Config
            </button>

            <div className="relative mt-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface-container-high px-2 text-on-surface-variant">OR</span>
              </div>
            </div>

            <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-primary/50 transition-colors relative">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl mb-2">upload_file</span>
              <p className="text-sm text-on-surface-variant font-medium">Upload File</p>
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                accept=".json,.md,.txt"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="md:w-1/2 flex flex-col">
            <h3 className="font-title-md text-on-surface mb-4">Repository Details</h3>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form id="create-repo-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase">Repository Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value.replace(/\s+/g, '-')})}
                />
              </div>

              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase">Description</label>
                <textarea 
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 resize-none h-20"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase">.gitignore Template</label>
                  <select 
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50"
                    value={formData.gitignore_template}
                    onChange={e => setFormData({...formData, gitignore_template: e.target.value})}
                    disabled={loadingOptions}
                  >
                    <option value="">None</option>
                    {gitignores.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase">License</label>
                  <select 
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50"
                    value={formData.license_template}
                    onChange={e => setFormData({...formData, license_template: e.target.value})}
                    disabled={loadingOptions}
                  >
                    <option value="">None</option>
                    {licenses.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant mb-1 uppercase">Local Directory Path (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50"
                  placeholder="e.g. C:\Projects\MyNewApp"
                  value={localPath}
                  onChange={e => setLocalPath(e.target.value)}
                />
                <p className="text-xs text-on-surface-variant mt-1 leading-tight">If provided, we will initialize and push this local folder to your new repository.</p>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-white/20 bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface-container-high"
                    checked={formData.private}
                    onChange={e => setFormData({...formData, private: e.target.checked})}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-on-surface font-medium">Private Repository</span>
                    <span className="text-xs text-on-surface-variant">Only you can see this repository.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-white/20 bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface-container-high"
                    checked={formData.auto_init}
                    onChange={e => setFormData({...formData, auto_init: e.target.checked})}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-on-surface font-medium">Initialize with README</span>
                    <span className="text-xs text-on-surface-variant">Create an initial commit with a README.md</span>
                  </div>
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 bg-surface-container">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-label-lg text-on-surface hover:bg-white/5 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="create-repo-form"
            disabled={isCreating || !formData.name}
            className="px-6 py-2 text-sm font-label-lg bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isCreating ? <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span> : null}
            Create Repository
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRepoModal;
