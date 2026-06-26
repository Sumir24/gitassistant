import React, { useState, useEffect } from 'react';
import ReviewHeader from '../components/ReviewHeader';
import ReviewNav from '../components/ReviewNav';
import ReviewSideNav from '../components/ReviewSideNav';
import DiffViewer from '../components/DiffViewer';
import RightPanel from '../components/RightPanel';

const ReviewCommandBar = () => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-surface-bright border border-outline-variant p-1.5 min-w-[340px]">
      <div className="flex items-center w-full px-2">
        <i className="ph ph-command text-primary mr-3"></i>
        <span className="font-code-sm text-[11px] text-on-surface-variant flex-1">
          Press <kbd className="px-1 bg-surface-container-highest border border-outline-variant text-primary text-[10px]">⌘</kbd> <kbd className="px-1 bg-surface-container-highest border border-outline-variant text-primary text-[10px]">K</kbd> for commands
        </span>
        <div className="h-4 w-px bg-outline-variant mx-3"></div>
        <button className="bg-primary text-on-primary px-3 py-1.5 flex items-center gap-2 font-code-sm text-[11px] active:scale-95 transition-transform">
          <i className="ph ph-terminal text-[14px]"></i> Command
        </button>
      </div>
    </div>
  );
}

const CodeReviewDashboard = ({ selectedRepo }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [repoTree, setRepoTree] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);

  useEffect(() => {
    if (!selectedRepo) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('gitspeak_token');
        const res = await fetch(`http://localhost:4000/api/repos/dashboard/${selectedRepo.owner}/${selectedRepo.name}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setDashboardData(data.dashboardData);

        const defaultBranch = data.dashboardData?.details?.defaultBranch || 'main';
        const treeRes = await fetch(`http://localhost:4000/api/repos/dashboard/${selectedRepo.owner}/${selectedRepo.name}/tree/${defaultBranch}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const treeData = await treeRes.json();
        if (treeData && treeData.tree) {
          setRepoTree(treeData.tree);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedRepo]);

  const handleFileSelect = async (file) => {
    if (file.type !== 'file') return;
    setSelectedFile(file);
    setFileLoading(true);
    setFileContent(null);

    try {
      const token = localStorage.getItem('gitspeak_token');
      const res = await fetch(`http://localhost:4000/api/repos/dashboard/${selectedRepo.owner}/${selectedRepo.name}/contents/${file.path}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.content && data.encoding === 'base64') {
        const cleanBase64 = data.content.replace(/\n/g, '');
        const isImage = file.path.match(/\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i);

        if (isImage) {
          const ext = isImage[1].toLowerCase();
          const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
          setFileContent(`data:${mimeType};base64,${cleanBase64}`);
        } else {
          try {
            const binaryString = atob(cleanBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const decoded = new TextDecoder('utf-8').decode(bytes);
            setFileContent(decoded);
          } catch (e) {
            setFileContent('// Cannot read file content as text');
          }
        }
      } else {
        setFileContent('// Cannot read file content');
      }
    } catch (err) {
      console.error('Error fetching file contents:', err);
      setFileContent('// Error loading file');
    } finally {
      setFileLoading(false);
    }
  };

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface text-on-surface">Loading Dashboard...</div>;
  }

  if (!selectedRepo) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface text-on-surface">No repository selected.</div>;
  }

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden selection:bg-primary selection:text-on-primary h-screen w-screen relative">
      <ReviewHeader repoDetails={dashboardData?.details} />
      <ReviewNav />
      <ReviewSideNav tree={repoTree} selectedFile={selectedFile} onFileSelect={handleFileSelect} />
      <main className="ml-16 md:ml-64 mt-[5.5rem] h-[calc(100vh-5.5rem)] flex bg-background relative overflow-hidden">
        <DiffViewer selectedFile={selectedFile} fileContent={fileContent} fileLoading={fileLoading} />
        <RightPanel dashboardData={dashboardData} />
        <ReviewCommandBar />
      </main>
    </div>
  );
};

export default CodeReviewDashboard;
