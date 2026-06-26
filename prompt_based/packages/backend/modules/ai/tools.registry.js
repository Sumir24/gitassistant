const GitHubService = require('../../core/github.service');

const toolsRegistry = [
  {
    definition: {
      type: "function",
      function: {
        name: "create_repository",
        description: "Creates a new GitHub repository and optionally uploads a local folder to it. Use this when the user asks to create a repo.",
        parameters: {
          type: "object",
          properties: {
            name: { type: "string", description: "The name of the new repository" },
            description: { type: "string", description: "A short description of the repository" },
            private: { type: "boolean", description: "Whether the repository should be private" },
            localPath: { type: "string", description: "The absolute path of a local folder to upload to the repository (e.g. E:\\mangabook). Only provide this if the user mentions a specific folder path." }
          },
          required: ["name"]
        }
      }
    },
    requiresApproval: true,
    handler: async (args, req) => {
      // Handled natively in ai.routes.js due to side-effects (DB saving)
      return { _intercept: 'create_repository', args }; 
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "list_repositories",
        description: "List all GitHub repositories accessible by the current authenticated user.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    requiresApproval: false,
    handler: async (args, req) => {
      return await GitHubService.getUserRepositories(req.user.accessToken);
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "get_repository_tree",
        description: "Fetch the recursive file tree for a repository. Use this to find files, see directory structure, or count total files.",
        parameters: {
          type: "object",
          properties: {
            owner: { type: "string", description: "The owner of the repository" },
            repo: { type: "string", description: "The name of the repository" },
            branch: { type: "string", description: "The branch name, e.g., main or master" }
          },
          required: ["owner", "repo", "branch"]
        }
      }
    },
    requiresApproval: false,
    handler: async (args, req) => {
      const treeData = await GitHubService.getRepoTree(req.user.accessToken, args.owner, args.repo, args.branch);
      if (treeData && treeData.tree) {
         return {
           total_files: treeData.tree.length,
           files: treeData.tree.map(item => item.path).slice(0, 500) // Return max 500 files
         };
      }
      return treeData;
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "list_branches",
        description: "List all branches for a given GitHub repository.",
        parameters: {
          type: "object",
          properties: {
            owner: { type: "string", description: "The owner of the repository" },
            repo: { type: "string", description: "The name of the repository" }
          },
          required: ["owner", "repo"]
        }
      }
    },
    requiresApproval: false,
    handler: async (args, req) => {
      return await GitHubService.listBranches(req.user.accessToken, args.owner, args.repo);
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "create_branch",
        description: "Create a new branch in a repository.",
        parameters: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            branchName: { type: "string", description: "Name of the new branch" },
            baseBranch: { type: "string", description: "Name of the base branch to branch off of (e.g., main)" }
          },
          required: ["owner", "repo", "branchName"]
        }
      }
    },
    requiresApproval: false, 
    handler: async (args, req) => {
      return await GitHubService.createBranch(req.user.accessToken, args.owner, args.repo, args.branchName, args.baseBranch);
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "create_commit",
        description: "Create a commit with file changes and push it to a branch.",
        parameters: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            branch: { type: "string", description: "The branch to commit to" },
            message: { type: "string", description: "The commit message" },
            files: { 
              type: "array", 
              description: "Array of files to commit. Each file needs a path and content.",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", description: "File path (e.g. src/index.js)" },
                  content: { type: "string", description: "The new content of the file" }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["owner", "repo", "branch", "message", "files"]
        }
      }
    },
    requiresApproval: true,
    handler: async (args, req) => {
      return await GitHubService.createCommit(req.user.accessToken, args.owner, args.repo, args.branch, args.files, args.message);
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "create_pull_request",
        description: "Create a Pull Request.",
        parameters: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            head: { type: "string", description: "The branch containing your changes" },
            base: { type: "string", description: "The branch you want to merge into (e.g. main)" },
            title: { type: "string", description: "Title of the PR" },
            body: { type: "string", description: "Description of the PR" }
          },
          required: ["owner", "repo", "head", "base", "title"]
        }
      }
    },
    requiresApproval: true,
    handler: async (args, req) => {
      return await GitHubService.createPullRequest(req.user.accessToken, args.owner, args.repo, args.head, args.base, args.title, args.body);
    }
  },
  {
    definition: {
      type: "function",
      function: {
        name: "merge_pull_request",
        description: "Merge an open Pull Request.",
        parameters: {
          type: "object",
          properties: {
            owner: { type: "string" },
            repo: { type: "string" },
            pullNumber: { type: "number", description: "The PR number to merge" },
            commitTitle: { type: "string", description: "Optional custom commit title for the merge" }
          },
          required: ["owner", "repo", "pullNumber"]
        }
      }
    },
    requiresApproval: true,
    handler: async (args, req) => {
      return await GitHubService.mergePullRequest(req.user.accessToken, args.owner, args.repo, args.pullNumber, args.commitTitle);
    }
  }
];

const getToolsArray = () => toolsRegistry.map(t => t.definition);
const getToolByName = (name) => toolsRegistry.find(t => t.definition.function.name === name);

module.exports = {
  toolsRegistry,
  getToolsArray,
  getToolByName
};
