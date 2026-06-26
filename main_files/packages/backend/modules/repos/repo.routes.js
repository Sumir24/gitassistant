const express = require('express');
const { requireAuth } = require('../auth/auth.middleware');
const GitHubService = require('../../core/github.service');
const RegisteredRepo = require('./RegisteredRepo.model');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const router = express.Router();

// Fetch repositories from GitHub
router.get('/github', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'No GitHub access token found for user' });
    }

    const repos = await GitHubService.getUserRepositories(user.accessToken);
    res.json({ repos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repositories from GitHub', details: error.message });
  }
});

// Get Gitignore Templates
router.get('/github/gitignore-templates', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) return res.status(400).json({ error: 'No GitHub access token' });
    const templates = await GitHubService.getGitignoreTemplates(user.accessToken);
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Get Licenses
router.get('/github/licenses', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) return res.status(400).json({ error: 'No GitHub access token' });
    const licenses = await GitHubService.getLicenses(user.accessToken);
    res.json({ licenses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch licenses' });
  }
});

// Create repository on GitHub
router.post('/github/create', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'No GitHub access token found for user' });
    }

    const { repoData, localPath } = req.body;
    if (!repoData || !repoData.name) {
      return res.status(400).json({ error: 'Invalid input: repoData with a name is required' });
    }

    repoData.auto_init = true; // Always auto-init so the repo is not empty (needed for Blob API)
    const newRepo = await GitHubService.createRepository(user.accessToken, repoData);

    // Automatically register it in our DB
    const userId = user._id;
    const registered = new RegisteredRepo({
      userId: userId,
      githubRepoId: newRepo.id,
      fullName: newRepo.full_name,
      name: newRepo.name,
      description: newRepo.description,
      defaultBranch: newRepo.default_branch || 'main',
      isPrivate: newRepo.private,
      language: newRepo.language,
      topics: newRepo.topics || []
    });
    await registered.save();

    let pushOutput = '';
    if (localPath) {
      try {
        await GitHubService.uploadLocalFolderToGitHub(user.accessToken, newRepo.owner.login, newRepo.name, localPath, newRepo.default_branch || 'main');
        pushOutput = 'Successfully pushed local files via API';
      } catch (err) {
        console.error('Local file API push error:', err);
        pushOutput = 'Failed to push local path via API: ' + err.message;
      }
    }

    res.json({ message: 'Successfully created repository', repo: newRepo, registeredRepo: registered, pushOutput });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create repository', details: error.message });
  }
});

// Connect selected repositories
router.post('/connect', requireAuth, async (req, res) => {
  try {
    const { repos } = req.body; // Array of repo objects
    if (!repos || !Array.isArray(repos)) {
      return res.status(400).json({ error: 'Invalid input: expected an array of repos' });
    }

    const userId = req.user._id;
    const connectedRepos = [];

    for (const repo of repos) {
      // Check if already registered
      let existingRepo = await RegisteredRepo.findOne({ githubRepoId: repo.id, userId });

      if (!existingRepo) {
        const newRepo = new RegisteredRepo({
          userId: userId,
          githubRepoId: repo.id,
          fullName: repo.fullName || repo.full_name,
          name: repo.name,
          description: repo.description,
          defaultBranch: repo.defaultBranch || repo.default_branch || 'main',
          isPrivate: repo.isPrivate || repo.private,
          language: repo.language,
          topics: repo.topics || []
        });
        await newRepo.save();
        connectedRepos.push(newRepo);
      } else {
        connectedRepos.push(existingRepo);
      }
    }

    res.json({ message: 'Successfully connected repositories', repos: connectedRepos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect repositories', details: error.message });
  }
});

// Get dashboard data for a specific repository
router.get('/dashboard/:owner/:repo', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'No GitHub access token found for user' });
    }

    const { owner, repo } = req.params;
    const dashboardData = await GitHubService.getRepoDashboardData(user.accessToken, owner, repo);

    res.json({ dashboardData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data', details: error.message });
  }
});

// Get specific path contents for a repository
router.get('/dashboard/:owner/:repo/contents/{*path}', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'No GitHub access token found for user' });
    }

    // In Express 5 / path-to-regexp 8, the matched wildcard part is returned as an array of segments.
    // We must join them back into a single string path separated by slashes.
    const rawPath = req.params.path || req.params[0];
    const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;

    const { owner, repo } = req.params;
    const data = await GitHubService.getRepoContents(user.accessToken, owner, repo, path);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repository contents', details: error.message });
  }
});

// Get recursive tree for a repository
router.get('/dashboard/:owner/:repo/tree/:branch', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.accessToken) {
      return res.status(400).json({ error: 'No GitHub access token found for user' });
    }

    const { owner, repo, branch } = req.params;
    const treeData = await GitHubService.getRepoTree(user.accessToken, owner, repo, branch);

    res.json(treeData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repository tree', details: error.message });
  }
});

module.exports = router;
