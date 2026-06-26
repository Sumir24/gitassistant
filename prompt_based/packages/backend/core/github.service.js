/**
 * GitHub API Service
 * Encapsulates calls to the GitHub API using the user's access token.
 */

const fetch = global.fetch || require('node-fetch'); // Use native fetch if available

class GitHubService {
  /**
   * Fetch repositories for the authenticated user
   * @param {string} accessToken - User's GitHub access token
   * @returns {Promise<Array>} List of repositories
   */
  static async getUserRepositories(accessToken) {
    try {
      // Fetch user's own repos and repos they are a member of
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const repos = await response.json();

      // Filter out essential fields to keep payload lightweight
      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        isPrivate: repo.private,
        defaultBranch: repo.default_branch,
        language: repo.language,
        topics: repo.topics || [],
        url: repo.html_url,
        updatedAt: repo.updated_at,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0
      }));
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  }
  /**
   * Helper to make authenticated requests to GitHub API
   */
  static async fetchWithAuth(url, accessToken) {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} for ${url}`);
    }
    return response.json();
  }

  /**
   * Fetch aggregated dashboard data for a single repository
   */
  static async getRepoDashboardData(accessToken, owner, repo) {
    try {
      const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

      const [repoDetails, commits, pulls, issues, runs, contributors, contents] = await Promise.all([
        this.fetchWithAuth(baseUrl, accessToken),
        this.fetchWithAuth(`${baseUrl}/commits?per_page=10`, accessToken),
        this.fetchWithAuth(`${baseUrl}/pulls?state=open&per_page=10`, accessToken),
        this.fetchWithAuth(`${baseUrl}/issues?state=open&per_page=5`, accessToken),
        this.fetchWithAuth(`${baseUrl}/actions/runs?per_page=5`, accessToken),
        this.fetchWithAuth(`${baseUrl}/contributors?per_page=10`, accessToken).catch(() => []), // Sometimes stats fail or return 202
        this.fetchWithAuth(`${baseUrl}/contents`, accessToken).catch(() => []) // Fetch root contents
      ]);

      // Filter out PRs from the issues array (GitHub API returns PRs as issues too)
      const pureIssues = issues.filter(issue => !issue.pull_request);

      return {
        details: {
          name: repoDetails.name,
          fullName: repoDetails.full_name,
          description: repoDetails.description,
          stars: repoDetails.stargazers_count,
          forks: repoDetails.forks_count,
          language: repoDetails.language,
          isPrivate: repoDetails.private,
          defaultBranch: repoDetails.default_branch,
          updatedAt: repoDetails.updated_at
        },
        contents: Array.isArray(contents) ? contents.map(item => ({
          name: item.name,
          path: item.path,
          type: item.type, // 'file' or 'dir'
          size: item.size,
          url: item.html_url
        })) : [],
        commits: commits.map(c => ({
          sha: c.sha,
          message: c.commit.message,
          authorName: c.commit.author.name,
          authorAvatar: c.author?.avatar_url,
          date: c.commit.author.date,
          url: c.html_url
        })),
        pullRequests: pulls.map(pr => ({
          number: pr.number,
          title: pr.title,
          authorName: pr.user.login,
          authorAvatar: pr.user.avatar_url,
          state: pr.state,
          createdAt: pr.created_at,
          url: pr.html_url
        })),
        issues: pureIssues.map(issue => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          labels: issue.labels.map(l => ({ name: l.name, color: l.color })),
          createdAt: issue.created_at,
          url: issue.html_url
        })),
        actions: runs.workflow_runs ? runs.workflow_runs.map(run => ({
          id: run.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion,
          branch: run.head_branch,
          createdAt: run.created_at,
          url: run.html_url
        })) : [],
        contributors: contributors.map(user => ({
          login: user.login,
          avatar: user.avatar_url,
          contributions: user.contributions
        }))
      };
    } catch (error) {
      console.error(`Error fetching dashboard data for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  /**
   * Fetch specific path contents for a repository
   */
  static async getRepoContents(accessToken, owner, repo, path) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
      const contents = await this.fetchWithAuth(url, accessToken);

      // If the path is a file, the API returns an object instead of an array.
      // If it's a directory, it returns an array of objects.
      if (Array.isArray(contents)) {
        return {
          type: 'directory',
          contents: contents.map(item => ({
            name: item.name,
            path: item.path,
            type: item.type, // 'file' or 'dir'
            size: item.size,
            url: item.html_url
          }))
        };
      } else {
        let fileContent = contents.content;
        let fileEncoding = contents.encoding;

        // GitHub omits content for files > 1MB via the contents API. Fetch via blob API instead.
        if (!fileContent && contents.sha) {
          const blobUrl = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${contents.sha}`;
          const blobData = await this.fetchWithAuth(blobUrl, accessToken);
          fileContent = blobData.content;
          fileEncoding = blobData.encoding;
        }

        return {
          type: 'file',
          name: contents.name,
          path: contents.path,
          size: contents.size,
          encoding: fileEncoding, // usually 'base64'
          content: fileContent // base64 encoded string
        };
      }
    } catch (error) {
      console.error(`Error fetching contents for ${owner}/${repo}/${path}:`, error);
      throw error;
    }
  }

  /**
   * Fetch repository tree recursively
   */
  static async getRepoTree(accessToken, owner, repo, branch) {
    try {
      const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
      const treeData = await this.fetchWithAuth(url, accessToken);
      return treeData;
    } catch (error) {
      console.error(`Error fetching tree for ${owner}/${repo}/${branch}:`, error);
      throw error;
    }
  }

  /**
   * Create a new repository for the authenticated user
   */
  static async createRepository(accessToken, repoData) {
    try {
      const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(repoData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating GitHub repository:', error);
      throw error;
    }
  }

  /**
   * Fetch gitignore templates
   */
  static async getGitignoreTemplates(accessToken) {
    try {
      return await this.fetchWithAuth('https://api.github.com/gitignore/templates', accessToken);
    } catch (error) {
      console.error('Error fetching gitignore templates:', error);
      throw error;
    }
  }

  /**
   * Fetch open source licenses
   */
  static async getLicenses(accessToken) {
    try {
      return await this.fetchWithAuth('https://api.github.com/licenses', accessToken);
    } catch (error) {
      console.error('Error fetching licenses:', error);
      throw error;
    }
  }

  /**
   * Reads a local directory and pushes it directly to a GitHub repository using the Git Database API.
   * Completely bypasses local Git installations.
   */
  static async uploadLocalFolderToGitHub(accessToken, owner, repo, localPath, defaultBranch = 'main') {
    const fs = require('fs');
    const path = require('path');

    let baseTreeSha = null;
    let latestCommitSha = null;

    try {
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (refRes.ok) {
        const refData = await refRes.json();
        latestCommitSha = refData.object.sha;

        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        const commitData = await commitRes.json();
        baseTreeSha = commitData.tree.sha;
      }
    } catch (e) {
      console.log("No existing ref found, treating as a new repository initialization");
    }

    const tree = [];
    const readDirRecursive = async (dir, baseDir) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (['.git', 'node_modules', '.env', 'dist', 'build'].includes(entry.name)) continue; // ignore common large/unwanted folders

        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
          await readDirRecursive(fullPath, baseDir);
        } else {
          // Upload blob
          const content = await fs.promises.readFile(fullPath);
          const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'GitAssistant-App'
            },
            body: JSON.stringify({
              content: content.toString('base64'),
              encoding: 'base64'
            })
          });

          if (blobRes.ok) {
            const blobData = await blobRes.json();
            tree.push({
              path: relativePath,
              mode: '100644',
              type: 'blob',
              sha: blobData.sha
            });
          } else {
            const errText = await blobRes.text();
            throw new Error(`Failed to upload blob for ${entry.name}: ${blobRes.status} ${blobRes.statusText} - ${errText}`);
          }
        }
      }
    };

    await readDirRecursive(localPath, localPath);
    if (tree.length === 0) return { message: 'No files to upload' };

    const treePayload = { tree };
    if (baseTreeSha) treePayload.base_tree = baseTreeSha;

    const createTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'GitAssistant-App'
      },
      body: JSON.stringify(treePayload)
    });
    if (!createTreeRes.ok) throw new Error(`Tree failed: ${await createTreeRes.text()}`);
    const treeData = await createTreeRes.json();

    const commitPayload = {
      message: 'Initial commit from GitAssistant API push',
      tree: treeData.sha,
      parents: latestCommitSha ? [latestCommitSha] : []
    };
    const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'GitAssistant-App'
      },
      body: JSON.stringify(commitPayload)
    });
    if (!createCommitRes.ok) throw new Error(`Commit failed: ${await createCommitRes.text()}`);
    const commitResult = await createCommitRes.json();

    if (latestCommitSha) {
      const pRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sha: commitResult.sha, force: true })
      });
      if (!pRes.ok) throw new Error(`Ref patch failed: ${await pRes.text()}`);
    } else {
      const pRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: `refs/heads/${defaultBranch}`, sha: commitResult.sha })
      });
      if (!pRes.ok) throw new Error(`Ref post failed: ${await pRes.text()}`);
    }

    return commitResult;
  }
  /**
   * List all branches in a repository
   */
  static async listBranches(accessToken, owner, repo) {
    try {
      const branches = await this.fetchWithAuth(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, accessToken);
      return branches.map(b => ({
        name: b.name,
        commitSha: b.commit.sha,
        protected: b.protected
      }));
    } catch (error) {
      console.error(`Error listing branches for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  /**
   * Create a new branch
   */
  static async createBranch(accessToken, owner, repo, branchName, baseBranch = 'main') {
    try {
      // 1. Get the SHA of the base branch
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${baseBranch}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!refRes.ok) throw new Error(`Could not find base branch ${baseBranch}`);
      const refData = await refRes.json();
      const sha = refData.object.sha;

      // 2. Create new reference
      const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha })
      });
      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(`Failed to create branch: ${errData.message || createRes.statusText}`);
      }
      return await createRes.json();
    } catch (error) {
      console.error(`Error creating branch ${branchName}:`, error);
      throw error;
    }
  }

  /**
   * Create a commit with multiple file changes
   * @param {Array} files - Array of { path, content }
   */
  static async createCommit(accessToken, owner, repo, branch, files, message) {
    try {
      // 1. Get current branch ref
      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!refRes.ok) throw new Error(`Could not find branch ${branch}`);
      const refData = await refRes.json();
      const latestCommitSha = refData.object.sha;

      // 2. Get the commit to find the base tree
      const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
      });
      const commitData = await commitRes.json();
      const baseTreeSha = commitData.tree.sha;

      // 3. Create blobs for all files
      const tree = [];
      for (const file of files) {
        const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: file.content, encoding: 'utf-8' })
        });
        if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}`);
        const blobData = await blobRes.json();
        tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blobData.sha });
      }

      // 4. Create new tree
      const createTreeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base_tree: baseTreeSha, tree })
      });
      if (!createTreeRes.ok) throw new Error('Failed to create tree');
      const treeData = await createTreeRes.json();

      // 5. Create new commit
      const createCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, tree: treeData.sha, parents: [latestCommitSha] })
      });
      if (!createCommitRes.ok) throw new Error('Failed to create commit');
      const newCommit = await createCommitRes.json();

      // 6. Update reference
      const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sha: newCommit.sha, force: false })
      });
      if (!updateRefRes.ok) throw new Error('Failed to update branch reference');
      
      return newCommit;
    } catch (error) {
      console.error('Error creating commit:', error);
      throw error;
    }
  }

  /**
   * Create a Pull Request
   */
  static async createPullRequest(accessToken, owner, repo, head, base, title, body = '') {
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, head, base, body })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Failed to create PR: ${errData.message || res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error creating PR:', error);
      throw error;
    }
  }

  /**
   * Merge a Pull Request
   */
  static async mergePullRequest(accessToken, owner, repo, pullNumber, commitTitle = '') {
    try {
      const payload = {};
      if (commitTitle) payload.commit_title = commitTitle;
      
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/merge`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(`Failed to merge PR: ${errData.message || res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      console.error('Error merging PR:', error);
      throw error;
    }
  }
}

module.exports = GitHubService;
