const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

class LocalWatcherService {
  constructor() {
    this.watcher = null;
    this.currentPath = null;
    
    // Map of filepath -> timestamp (to track recently modified)
    // In a real app we might only keep last X hours, but keeping it simple
    this.modifiedFiles = new Map();
  }

  startWatching(folderPath) {
    if (this.currentPath === folderPath && this.watcher) {
      return; // Already watching this
    }

    this.stopWatching();

    console.log(`[LocalWatcher] Starting to watch: ${folderPath}`);
    this.currentPath = folderPath;
    this.modifiedFiles.clear();

    // Initialize watcher. Ignore .git and node_modules
    this.watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\..|node_modules|build|dist/, // ignore dotfiles (like .git), node_modules, etc.
      persistent: true,
      ignoreInitial: true // don't fire "add" events for existing files on startup
    });

    this.watcher
      .on('add', filePath => this.markModified(filePath, 'added'))
      .on('change', filePath => this.markModified(filePath, 'modified'))
      .on('unlink', filePath => this.markModified(filePath, 'deleted'))
      .on('error', error => console.log(`[LocalWatcher] Watcher error: ${error}`));
  }

  stopWatching() {
    if (this.watcher) {
      console.log(`[LocalWatcher] Stopping watch on: ${this.currentPath}`);
      this.watcher.close();
      this.watcher = null;
      this.currentPath = null;
      this.modifiedFiles.clear();
    }
  }

  markModified(filePath, action) {
    // We store relative path to the repo root to make it easy for the UI
    if (!this.currentPath) return;
    
    const relativePath = path.relative(this.currentPath, filePath).replace(/\\/g, '/');
    this.modifiedFiles.set(relativePath, {
      path: relativePath,
      absolutePath: filePath,
      action: action,
      timestamp: Date.now()
    });
    
    console.log(`[LocalWatcher] File ${action}: ${relativePath}`);
  }

  getModifiedFiles() {
    // Return array sorted by newest first
    return Array.from(this.modifiedFiles.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  getFileContent(relativePath) {
    if (!this.currentPath) return null;
    const absPath = path.join(this.currentPath, relativePath);
    
    try {
      if (!fs.existsSync(absPath)) return null;
      const content = fs.readFileSync(absPath, 'utf8');
      return content;
    } catch (err) {
      console.error(`[LocalWatcher] Error reading ${absPath}:`, err.message);
      return null;
    }
  }
}

// Export a singleton instance
module.exports = new LocalWatcherService();
