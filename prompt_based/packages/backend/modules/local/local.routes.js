const express = require('express');
const { requireAuth } = require('../auth/auth.middleware');
const LocalRepoScanner = require('./localRepoScanner.service');
const localWatcher = require('./localWatcher.service');

const router = express.Router();

// GET /api/local/status?repo=owner/repoName
// Auto-discovers the local repo, attaches the watcher, and returns modified files.
router.get('/status', requireAuth, async (req, res) => {
  try {
    const { repo } = req.query; // e.g. "sumire02/syncUp"
    if (!repo) {
      return res.status(400).json({ error: 'repo query parameter is required' });
    }

    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      return res.status(400).json({ error: 'invalid repo format' });
    }

    // 1. Auto-discover the local path
    const localPath = await LocalRepoScanner.findLocalRepoPath(owner, repoName);
    
    if (!localPath) {
      // If we are currently watching a different repo, stop it
      localWatcher.stopWatching();
      return res.json({ found: false, modifiedFiles: [] });
    }

    // 2. Attach the watcher to the found path
    localWatcher.startWatching(localPath);

    // 3. Return the status
    const modifiedFiles = localWatcher.getModifiedFiles();
    
    return res.json({
      found: true,
      localPath,
      modifiedFiles
    });
  } catch (error) {
    console.error('Local status error:', error);
    res.status(500).json({ error: 'Failed to get local status' });
  }
});

// GET /api/local/file-content?path=...
router.get('/file-content', requireAuth, (req, res) => {
  try {
    const { path: filePath } = req.query;
    if (!filePath) {
      return res.status(400).json({ error: 'path query parameter is required' });
    }

    const content = localWatcher.getFileContent(filePath);
    if (content === null) {
      return res.status(404).json({ error: 'File not found or unreadable' });
    }

    res.json({ content });
  } catch (error) {
    console.error('Local file content error:', error);
    res.status(500).json({ error: 'Failed to read file content' });
  }
});

module.exports = router;
