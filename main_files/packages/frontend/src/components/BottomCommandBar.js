import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const BottomCommandBar = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      setLoading(true);
      setIsOpen(true);
      setResponse('');
      setQuery(''); // Clear the input field after submitting

      try {
        const token = localStorage.getItem('gitspeak_token');
        const res = await fetch('http://localhost:4000/api/dashboard/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ question: query })
        });

        const data = await res.json();
        if (data.success) {
          setResponse(data.answer);
        } else {
          setResponse('Error: ' + (data.error || 'Failed to get an answer'));
        }
      } catch (error) {
        setResponse('Error: Could not connect to the AI service');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-[520px] px-md">
      {isOpen && (
        <div className="mb-4 w-full bg-[#0D1117] border border-[#1F2328] rounded-xl p-6 shadow-2xl relative glass">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-[#8B949E] hover:text-white"
          >
            <i className="ph ph-x text-lg"></i>
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <i className="ph-fill ph-sparkle text-[#0D1117] text-xs"></i>
            </div>
            <h3 className="text-[#F0F6FC] font-semibold text-sm">AI Assistant</h3>
          </div>
          <div className="text-[#F0F6FC] text-sm leading-relaxed max-h-[50vh] overflow-y-auto custom-scrollbar prose prose-invert prose-sm max-w-none prose-p:my-2 prose-pre:my-2 prose-pre:bg-[#161B22] prose-pre:border-[#1F2328] prose-pre:border">
            {loading ? (
              <div className="flex items-center gap-2 text-[#8B949E] animate-pulse">
                <i className="ph ph-circle-notch animate-spin"></i>
                Thinking...
              </div>
            ) : (
              <ReactMarkdown>{response}</ReactMarkdown>
            )}
          </div>
        </div>
      )}

      <div className="glass rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.5)] flex items-center h-12 p-1.5 ring-1 ring-white/5">
        <div className="flex-1 flex items-center px-3 gap-3">
          <i className="ph ph-command text-[16px] text-[#8B949E]"></i>
          <input 
            className="bg-transparent border-none text-[#F0F6FC] font-medium text-sm w-full focus:ring-0 placeholder-white/20" 
            placeholder="Type a command or ask anything..." 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 rounded-lg px-2.5 py-1.5">
          <span className="mono text-[10px] text-white/40 font-bold uppercase tracking-widest">Ctrl</span>
          <span className="mono text-[10px] text-white/40 font-bold uppercase tracking-widest">K</span>
        </div>
      </div>
    </div>
  );
};

export default BottomCommandBar;
