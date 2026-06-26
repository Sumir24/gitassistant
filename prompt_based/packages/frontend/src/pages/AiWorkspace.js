import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AiWorkspace = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [localStatus, setLocalStatus] = useState(null);
  const [showLocalMenu, setShowLocalMenu] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch user's repositories for the context dropdown
    const token = localStorage.getItem('gitspeak_token');
    fetch('http://localhost:4000/api/repos/github', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.repos) {
          setRepos(data.repos);
        }
      })
      .catch(console.error);
  }, []);

  // Poll local status when a repo is selected
  useEffect(() => {
    let intervalId;
    if (selectedRepo) {
      const checkLocalStatus = async () => {
        try {
          const token = localStorage.getItem('gitspeak_token');
          const res = await fetch(`http://localhost:4000/api/local/status?repo=${selectedRepo}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.found) {
            setLocalStatus(data);
          } else {
            setLocalStatus(null);
          }
        } catch (e) {
          console.error("Local status check failed", e);
        }
      };

      checkLocalStatus(); // initial check
      intervalId = setInterval(checkLocalStatus, 5000); // poll every 5s
    } else {
      setLocalStatus(null);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedRepo]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const attachLocalFile = async (filePath) => {
    try {
      const token = localStorage.getItem('gitspeak_token');
      const res = await fetch(`http://localhost:4000/api/local/file-content?path=${encodeURIComponent(filePath)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.content) {
        const fileBlock = `\n\n\`\`\`${filePath.split('.').pop()}\n// File: ${filePath}\n${data.content}\n\`\`\`\n`;
        setInput(prev => prev + fileBlock);
        setShowLocalMenu(false);
      }
    } catch (e) {
      console.error("Failed to fetch local file content", e);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Prepend repository context if one is selected
    const contextPrefix = selectedRepo ? `[Context: Working in repository ${selectedRepo}] ` : '';
    const displayMessage = input;
    const systemMessage = contextPrefix + input;

    const userMessage = { role: 'user', content: systemMessage, display: displayMessage };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('gitspeak_token');
      const payloadMessages = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: payloadMessages })
      });

      const data = await res.json();
      if (data.requiresApproval) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          type: 'approval',
          content: data.summary,
          toolCallId: data.toolCallId,
          functionName: data.functionName,
          arguments: data.arguments,
          originalMessages: data.originalMessages,
          status: 'pending' // pending, approved, rejected
        }]);
      } else if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, executedTools: data.executedTools }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the AI server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (msgIndex, isApproved) => {
    const msg = messages[msgIndex];
    if (msg.status !== 'pending') return;

    // Update status locally
    setMessages(prev => prev.map((m, idx) => idx === msgIndex ? { ...m, status: isApproved ? 'approved' : 'rejected' } : m));

    if (!isApproved) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Action **${msg.functionName}** was rejected.` }]);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('gitspeak_token');
      const res = await fetch('http://localhost:4000/api/ai/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toolCallId: msg.toolCallId,
          functionName: msg.functionName,
          arguments: msg.arguments,
          originalMessages: msg.originalMessages
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, executedTools: data.executedTools }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error executing the approved action." }]);
      }
    } catch (error) {
      console.error('Approve error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Failed to connect to the AI server during approval." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-surface-container-lowest text-on-surface font-sans">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-container-lowest/80 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
          <h1 className="font-headline-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-fixed-dim">
            GitAssistant Workspace
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-container-high rounded-full px-4 py-1.5 border border-white/5 shadow-inner">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">folder</span>
            <select 
              value={selectedRepo}
              onChange={e => setSelectedRepo(e.target.value)}
              className="bg-transparent text-sm text-on-surface focus:outline-none appearance-none cursor-pointer pr-4"
            >
              <option value="">Global Context (All Repos)</option>
              {repos.map(repo => (
                <option key={repo.id} value={repo.full_name}>{repo.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} 
              alt="User" 
              className="w-9 h-9 rounded-full border-2 border-surface-container-high object-cover shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-8 pb-32">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-32 text-center animate-fade-in">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-2xl shadow-primary/10">
                <span className="material-symbols-outlined text-5xl text-primary drop-shadow-md">auto_awesome</span>
              </div>
              <h2 className="text-3xl font-headline-lg font-bold mb-3">What would you like to do?</h2>
              <p className="text-on-surface-variant max-w-md text-lg">
                Ask me to review code, create branches, merge PRs, or analyze your repositories.
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`} style={{animationFillMode: 'both', animationDelay: '0.05s'}}>
              
              {/* Approval Card */}
              {msg.type === 'approval' ? (
                <div className="w-full max-w-2xl bg-surface-container border border-primary/20 rounded-2xl p-6 shadow-xl shadow-primary/5">
                  <div className="flex items-center gap-3 text-primary font-headline-md mb-4 pb-4 border-b border-white/5">
                    <span className="material-symbols-outlined bg-primary/20 p-2 rounded-lg text-primary">gavel</span>
                    Approval Required for Action
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-on-surface text-base mb-3 leading-relaxed">{msg.content}</p>
                    <div className="bg-black/30 rounded-xl p-4 overflow-x-auto border border-white/5">
                      <pre className="text-sm font-code-sm text-primary-fixed-dim/90">
                        {JSON.stringify(msg.arguments, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {msg.status === 'pending' ? (
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleApprove(idx, true)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl py-3 font-headline-md shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Approve Action
                      </button>
                      <button 
                        onClick={() => handleApprove(idx, false)}
                        className="flex-1 bg-surface-container-high hover:bg-surface-container-highest border border-white/5 text-on-surface rounded-xl py-3 font-headline-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className={`mt-4 py-3 px-4 rounded-xl flex items-center gap-2 text-sm font-headline-md ${
                      msg.status === 'approved' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      <span className="material-symbols-outlined text-base">
                        {msg.status === 'approved' ? 'check_circle' : 'cancel'}
                      </span>
                      Action {msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Message Bubbles */
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 mt-1">
                    {msg.role === 'user' ? (
                       <img 
                       src={user?.avatarUrl || "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"} 
                       alt="User" 
                       className="w-8 h-8 rounded-full border border-white/10"
                     />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                         <span className="material-symbols-outlined text-on-primary text-sm">smart_toy</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div 
                    className={`rounded-3xl px-6 py-4 text-base leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-surface-container-high text-on-surface border border-white/5 rounded-tr-sm' 
                        : 'bg-transparent text-on-surface'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div>{msg.display || msg.content}</div>
                    ) : (
                      <div className="flex flex-col gap-4 w-full">
                        {msg.executedTools && msg.executedTools.length > 0 && (
                          <div className="bg-surface-container-highest/50 border border-white/5 rounded-xl p-3 text-xs font-code-sm text-on-surface-variant max-w-fit">
                            <div className="flex items-center gap-2 mb-2 text-primary-fixed-dim font-headline-sm uppercase tracking-wider">
                              <span className="material-symbols-outlined text-[14px]">psychology</span>
                              AI Thought Process
                            </div>
                            {msg.executedTools.map((t, i) => (
                              <div key={i} className="flex gap-2 opacity-80">
                                <span className="text-tertiary">➜</span>
                                <span>Executed <strong className="text-white">{t.functionName}</strong>({JSON.stringify(t.arguments)})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-surface-container-high prose-pre:border prose-pre:border-white/5 max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex w-full justify-start animate-fade-in">
              <div className="flex gap-4 max-w-[85%]">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                     <span className="material-symbols-outlined text-on-primary text-sm animate-spin-slow">sync</span>
                  </div>
                </div>
                <div className="px-6 py-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest to-transparent pointer-events-none flex justify-center flex-col items-center">
        
        {/* Local Status Popover / Button */}
        {localStatus && localStatus.modifiedFiles && localStatus.modifiedFiles.length > 0 && (
          <div className="w-full max-w-4xl relative mb-2 pointer-events-auto flex justify-start">
            <div className="relative">
              <button 
                onClick={() => setShowLocalMenu(!showLocalMenu)}
                className="bg-primary/20 hover:bg-primary/30 text-primary-fixed-dim text-xs font-headline-md px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2 transition-all shadow-lg backdrop-blur-md"
              >
                <span className="material-symbols-outlined text-sm">attach_file</span>
                Attach Local Changes ({localStatus.modifiedFiles.length})
              </button>
              
              {showLocalMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-72 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 border-b border-white/5 bg-surface-container-lowest text-xs font-headline-md text-on-surface-variant flex items-center justify-between">
                    <span>Unpushed Local Files</span>
                    <button onClick={() => setShowLocalMenu(false)} className="hover:text-white material-symbols-outlined text-sm">close</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {localStatus.modifiedFiles.map(f => (
                      <button 
                        key={f.path}
                        onClick={() => attachLocalFile(f.path)}
                        className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex items-center justify-between group transition-colors"
                      >
                        <span className="text-sm font-code-sm text-on-surface truncate pr-4">{f.path}</span>
                        <span className="material-symbols-outlined text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl bg-surface-container rounded-[2rem] p-2 shadow-2xl border border-white/10 pointer-events-auto flex items-end gap-2 transition-all focus-within:border-primary/50 focus-within:shadow-primary/10">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={selectedRepo ? `Ask anything about ${selectedRepo.split('/')[1]}...` : "Ask GitAssistant anything..."}
            className="flex-1 bg-transparent border-none resize-none max-h-48 min-h-[56px] px-6 py-4 text-on-surface focus:ring-0 placeholder:text-on-surface-variant/50 custom-scrollbar leading-relaxed"
            rows="1"
            style={{
              height: input ? `${Math.min(input.split('\n').length * 24 + 32, 200)}px` : '56px'
            }}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="mb-1 mr-1 flex-shrink-0 w-12 h-12 bg-primary hover:bg-primary-fixed disabled:bg-surface-container-high disabled:text-on-surface-variant text-on-primary rounded-full flex items-center justify-center transition-all active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed shadow-lg shadow-primary/20 disabled:shadow-none"
          >
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default AiWorkspace;
