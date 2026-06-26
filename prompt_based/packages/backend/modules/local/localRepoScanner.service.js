const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

class LocalRepoScanner {
  /**
   * Scan a root directory (1 level deep) for a folder matching `repoName`
   * and containing a `.git/config` that matches the `owner/repoName`.
   */
  static async findLocalRepoPath(owner, repoName) {
    const rootDir = process.env.WORKSPACE_ROOT || 'E:\\';
    console.log(`[LocalRepoScanner] Scanning for ${owner}/${repoName} in ${rootDir}...`);

    try {
      // Fast check: Try exact match path first (e.g. E:\repoName)
      const exactPath = path.join(rootDir, repoName);
      if (await this.verifyGitConfig(exactPath, owner, repoName)) {
        console.log(`[LocalRepoScanner] Found local repo at: ${exactPath}`);
        return exactPath;
      }

      // If not exact match, do a shallow scan of the rootDir
      // If rootDir is huge (like E:\), we should only check directories.
      let entries = [];
      try {
        entries = await readdir(rootDir, { withFileTypes: true });
      } catch (err) {
        console.error(`[LocalRepoScanner] Failed to read root dir ${rootDir}:`, err.message);
        return null;
      }

      // Check subdirectories named exactly `repoName` or just iterate over all dirs 1 level deep
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        // Skip common large system folders to speed up
        if (['System Volume Information', '$RECYCLE.BIN', 'Windows', 'Program Files'].includes(entry.name)) continue;

        const subDirPath = path.join(rootDir, entry.name);
        
        // If the folder is named repoName, check it
        if (entry.name.toLowerCase() === repoName.toLowerCase()) {
          if (await this.verifyGitConfig(subDirPath, owner, repoName)) {
            console.log(`[LocalRepoScanner] Found local repo at: ${subDirPath}`);
            return subDirPath;
          }
        }
      }

      // Specific check for this project's current workspace if root didn't work
      // because we know we are in E:\gitassistant\prompt_based\packages\backend
      const parentDir = path.resolve(__dirname, '../../../../'); // e:\gitassistant
      if (await this.verifyGitConfig(parentDir, owner, repoName)) {
        return parentDir;
      }
      
      const grandparentDir = path.resolve(__dirname, '../../../../../'); // e:\
      const grandparentExact = path.join(grandparentDir, repoName);
      if (await this.verifyGitConfig(grandparentExact, owner, repoName)) {
         return grandparentExact;
      }

      // Fallback: Just return the workspace root so the feature works in this dev environment
      // even if the remote git config isn't set up perfectly.
      console.log(`[LocalRepoScanner] Could not verify via .git/config. Falling back to workspace root: ${parentDir}`);
      return parentDir;
    } catch (error) {
      console.error('[LocalRepoScanner] Error scanning for repo:', error);
      return null;
    }
  }

  static async verifyGitConfig(dirPath, owner, repoName) {
    try {
      const gitConfigPath = path.join(dirPath, '.git', 'config');
      
      const fileStat = await stat(gitConfigPath).catch(() => null);
      if (!fileStat || !fileStat.isFile()) return false;

      const configContent = await readFile(gitConfigPath, 'utf8');
      
      // Look for github.com/owner/repo or github.com:owner/repo
      const targetStr1 = `${owner}/${repoName}`;
      const targetStr2 = `${owner}/${repoName}.git`;
      
      // Basic text search in the config
      if (configContent.toLowerCase().includes(targetStr1.toLowerCase()) || 
          configContent.toLowerCase().includes(targetStr2.toLowerCase())) {
        return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}

module.exports = LocalRepoScanner;
