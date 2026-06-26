import React from 'react';

const DiffViewer = ({ selectedFile, fileContent, fileLoading }) => {
  if (!selectedFile) {
    return (
      <section className="flex-1 flex flex-col min-w-0 bg-background border-r border-outline-variant items-center justify-center text-on-surface-variant font-code-sm">
        Select a file from the explorer to view its contents
      </section>
    );
  }

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-background border-r border-outline-variant">
      <div className="h-10 border-b border-outline-variant flex items-center justify-between px-md bg-surface">
        <div className="flex items-center gap-md">
          <span className="font-code-sm text-code-sm text-on-surface font-bold">{selectedFile.path}</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto font-code-sm text-code-sm leading-relaxed p-md selection:bg-white/10">
        <div className="min-w-fit space-y-0">
          {fileLoading ? (
            <div className="text-on-surface-variant p-4">Loading file contents...</div>
          ) : (
            fileContent ? (
              fileContent.startsWith('data:image/') ? (
                <div className="p-4 flex items-center justify-center bg-surface-container-low rounded-lg m-4 border border-outline-variant">
                  <img src={fileContent} alt={selectedFile.path} className="max-w-full max-h-[70vh] object-contain rounded" />
                </div>
              ) : (
                fileContent.split('\n').map((line, index) => (
                  <div key={index} className="flex hover:bg-surface-container transition-colors">
                    <div className="line-number text-right pr-4 text-on-surface-variant opacity-50 min-w-[3rem] select-none">{index + 1}</div>
                    <div className="pl-4 whitespace-pre text-on-surface">{line || ' '}</div>
                  </div>
                ))
              )
            ) : <div className="text-on-surface-variant p-4">No content available</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default DiffViewer;
