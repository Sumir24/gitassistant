# GitSpeak — Product Development Document
## Complete Technical Build Guide

**Version:** 1.0  
**Companion to:** GitSpeak PRD v2.0  
**Purpose:** This is the engineering playbook — every feature broken down into implementation detail, file structure, code patterns, API contracts, and a day-by-day build sequence. Read this when you're ready to start writing code.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Phase 0: Environment Setup](#2-phase-0-environment-setup)
3. [Component 1: The Local Agent — Full Build](#3-component-1-the-local-agent--full-build)
4. [Component 2: Backend Server — Full Build](#4-component-2-backend-server--full-build)
5. [Component 3: Web App — Full Build](#5-component-3-web-app--full-build)
6. [Component 4: NLP / LLM Integration Layer](#6-component-4-nlp--llm-integration-layer)
7. [Feature-by-Feature Implementation Specs](#7-feature-by-feature-implementation-specs)
8. [Database Schema — Full Definitions](#8-database-schema--full-definitions)
9. [Security Implementation](#9-security-implementation)
10. [Day-by-Day Build Plan (8 Weeks)](#10-day-by-day-build-plan-8-weeks)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Plan](#12-deployment-plan)
13. [Post-Launch Iteration Plan](#13-post-launch-iteration-plan)

---

## 1. Project Structure

GitSpeak is a **monorepo** with three independently deployable packages.

```
gitspeak/
├── packages/
│   ├── agent/                 # Local CLI agent (npm package)
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point / CLI commands
│   │   │   ├── git/
│   │   │   │   ├── executor.ts       # Runs git commands safely
│   │   │   │   ├── parser.ts         # Parses git output into structured data
│   │   │   │   ├── operations/       # One file per git operation category
│   │   │   │   │   ├── status.ts
│   │   │   │   │   ├── commit.ts
│   │   │   │   │   ├── branch.ts
│   │   │   │   │   ├── merge.ts
│   │   │   │   │   ├── rebase.ts
│   │   │   │   │   ├── stash.ts
│   │   │   │   │   ├── history.ts
│   │   │   │   │   └── recovery.ts
│   │   │   │   └── safety.ts         # Destructive op detection + backups
│   │   │   ├── repo/
│   │   │   │   ├── detector.ts       # Detects language/stack/test commands
│   │   │   │   ├── registry.ts       # Manages registered repos (local config)
│   │   │   │   └── watcher.ts        # chokidar file watcher
│   │   │   ├── connection/
│   │   │   │   ├── pairing.ts        # Pairing code generation/exchange
│   │   │   │   ├── websocket.ts      # WS connection to backend
│   │   │   │   └── messages.ts       # Message types (shared with backend)
│   │   │   ├── audit/
│   │   │   │   └── logger.ts         # Local audit log of all commands run
│   │   │   └── config.ts             # Local config file management (~/.gitspeak/)
│   │   ├── bin/
│   │   │   └── gitspeak-agent.js     # Executable entry
│   │   └── package.json
│   │
│   ├── backend/               # Express server
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── config/
│   │   │   │   ├── env.ts
│   │   │   │   └── db.ts
│   │   │   ├── models/
│   │   │   │   ├── User.ts
│   │   │   │   ├── RegisteredRepo.ts
│   │   │   │   ├── CommandHistory.ts
│   │   │   │   └── AgentSession.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts                 # GitHub OAuth
│   │   │   │   ├── repos.ts                # Repo registration, metadata
│   │   │   │   ├── commands.ts             # Main NLP command endpoint
│   │   │   │   ├── github-webhooks.ts      # Incoming GitHub webhooks
│   │   │   │   └── billing.ts              # Stripe
│   │   │   ├── services/
│   │   │   │   ├── llm/
│   │   │   │   │   ├── intentClassifier.ts
│   │   │   │   │   ├── parameterExtractor.ts
│   │   │   │   │   ├── responseGenerator.ts
│   │   │   │   │   ├── yamlGenerator.ts
│   │   │   │   │   ├── prSummarizer.ts
│   │   │   │   │   └── prompts/            # All system prompts as separate files
│   │   │   │   │       ├── base.ts
│   │   │   │   │       ├── intentClassification.ts
│   │   │   │   │       ├── yamlGeneration.ts
│   │   │   │   │       └── repoIntelligence.ts
│   │   │   │   ├── github/
│   │   │   │   │   ├── client.ts           # Octokit wrapper
│   │   │   │   │   ├── pullRequests.ts
│   │   │   │   │   ├── issues.ts
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   └── webhookHandler.ts
│   │   │   │   ├── agent/
│   │   │   │   │   ├── connectionManager.ts # Tracks connected agents (Socket.IO)
│   │   │   │   │   └── commandRelay.ts      # Sends commands to agent, awaits result
│   │   │   │   └── router/
│   │   │   │       └── intentRouter.ts      # Routes intent → local/remote/both
│   │   │   ├── socket/
│   │   │   │   └── index.ts                 # Socket.IO server setup
│   │   │   └── middleware/
│   │   │       ├── auth.ts
│   │   │       └── rateLimit.ts
│   │   └── package.json
│   │
│   └── web/                    # Next.js frontend
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx                     # Landing page
│       │   ├── (auth)/
│       │   │   ├── login/page.tsx
│       │   │   └── callback/page.tsx        # GitHub OAuth callback
│       │   ├── (app)/
│       │   │   ├── layout.tsx               # App shell (sidebar + command bar)
│       │   │   ├── dashboard/page.tsx       # Repo state dashboard
│       │   │   ├── history/page.tsx         # Commit graph explorer
│       │   │   ├── setup-agent/page.tsx     # Agent install/pairing flow
│       │   │   └── settings/page.tsx
│       │   └── api/                         # Next.js API routes (thin proxy to backend)
│       ├── components/
│       │   ├── CommandBar/
│       │   │   ├── CommandBar.tsx
│       │   │   ├── CommandHistory.tsx
│       │   │   ├── ResponseCard.tsx
│       │   │   ├── ActionButtons.tsx
│       │   │   └── DestructivePreview.tsx
│       │   ├── Dashboard/
│       │   │   ├── LocalStatePanel.tsx
│       │   │   ├── RemoteStatePanel.tsx
│       │   │   ├── BranchList.tsx
│       │   │   └── CIStatusBadge.tsx
│       │   ├── CommitGraph/
│       │   │   ├── GraphCanvas.tsx          # Visual git graph (D3 or custom SVG)
│       │   │   └── DiffViewer.tsx           # Monaco-based diff
│       │   ├── YamlPreview/
│       │   │   └── YamlPreviewModal.tsx
│       │   └── shared/
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       └── StatusDot.tsx
│       ├── lib/
│       │   ├── api.ts                       # Backend API client
│       │   ├── socket.ts                    # Socket.IO client setup
│       │   └── hooks/
│       │       ├── useCommand.ts
│       │       ├── useRepoState.ts
│       │       └── useAgentStatus.ts
│       └── package.json
│
├── package.json                # Root workspace config
└── README.md
```

---

## 2. Phase 0: Environment Setup

### Prerequisites
- Node.js 20+ installed
- Git installed
- MongoDB instance (local via Docker, or MongoDB Atlas free tier)
- GitHub account + OAuth App registered
- OpenAI API key

### Step-by-step setup

```bash
# 1. Create monorepo with workspaces
mkdir gitspeak && cd gitspeak
npm init -y
mkdir -p packages/agent packages/backend packages/web

# 2. Root package.json — configure workspaces
```

```json
{
  "name": "gitspeak",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev:backend": "npm run dev -w packages/backend",
    "dev:web": "npm run dev -w packages/web",
    "dev:agent": "npm run dev -w packages/agent"
  }
}
```

```bash
# 3. Initialize each package
cd packages/backend && npm init -y && npm install express mongoose socket.io \
  passport passport-github2 dotenv cors @octokit/rest openai

cd ../web && npx create-next-app@latest . --typescript --tailwind --app

cd ../agent && npm init -y && npm install simple-git chokidar ws commander
```

### GitHub OAuth App Setup
1. Go to GitHub Settings → Developer Settings → OAuth Apps → New OAuth App
2. Application name: `GitSpeak`
3. Homepage URL: `https://gitspeak.dev` (or `http://localhost:3000` for dev)
4. Authorization callback URL: `http://localhost:3000/auth/callback`
5. Save Client ID and Client Secret to `.env`

### Environment Variables (`packages/backend/.env`)
```bash
PORT=4000
MONGODB_URI=mongodb://localhost:27017/gitspeak
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=http://localhost:3000/auth/callback
OPENROUTER_API_KEY=sk-ant-xxx
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx        # 32-byte key for token encryption
SESSION_SECRET=xxx
```

---

## 3. Component 1: The Local Agent — Full Build

This is the most novel and important component. It's a CLI tool that runs persistently on the developer's machine.

### 3.1 Installation & Distribution

**Distribution method:** npm global package
```bash
npm install -g gitspeak-agent
```

**Why npm over a compiled binary (for V1):** Faster to iterate, your target audience (developers) all have Node.js installed already, and `npm install -g` is a familiar pattern (similar to installing `gh` CLI extensions or other dev tools).

**Future:** Once stable, ship as a compiled binary via `pkg` or `bun build --compile` for non-Node users.

### 3.2 Agent CLI Commands

```bash
gitspeak-agent start              # Start the background agent process
gitspeak-agent stop               # Stop it
gitspeak-agent status             # Check connection status
gitspeak-agent pair <code>        # Pair with web app using 6-digit code
gitspeak-agent register <path>    # Register a repo for GitSpeak to manage
gitspeak-agent unregister <path>  # Remove a repo
gitspeak-agent list                # List registered repos
gitspeak-agent logs                # Show audit log
```

### 3.3 Agent Architecture — Core Files

#### `src/config.ts` — Local configuration management

The agent stores its config in `~/.gitspeak/config.json`:

```typescript
interface AgentConfig {
  userId: string | null;          // set after pairing
  authToken: string | null;       // JWT for backend auth, set after pairing
  backendUrl: string;             // default: wss://api.gitspeak.dev
  registeredRepos: {
    path: string;                 // absolute local path
    id: string;                   // backend-assigned repo ID
    name: string;
  }[];
}

// Functions:
// - loadConfig(): AgentConfig
// - saveConfig(config: AgentConfig): void
// - getConfigPath(): string  →  ~/.gitspeak/config.json
```

#### `src/connection/pairing.ts` — Pairing flow

```typescript
// Flow:
// 1. User runs `gitspeak-agent pair ABC123` (code shown on web app)
// 2. Agent sends POST to backend: { pairingCode: "ABC123", machineId: <generated> }
// 3. Backend validates code, returns { userId, authToken }
// 4. Agent saves these to local config
// 5. Agent establishes persistent WebSocket connection using authToken

async function pairAgent(pairingCode: string): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/api/agent/pair`, {
    method: 'POST',
    body: JSON.stringify({ pairingCode, machineId: getMachineId() })
  });
  const { userId, authToken } = await response.json();
  saveConfig({ ...loadConfig(), userId, authToken });
  console.log('✅ Paired successfully. Starting agent...');
  startAgent();
}
```

#### `src/connection/websocket.ts` — Persistent connection

```typescript
// Maintains a WebSocket connection to the backend.
// Listens for incoming command requests, executes them, sends results back.

import WebSocket from 'ws';
import { executeGitOperation } from '../git/executor';

class AgentConnection {
  private ws: WebSocket | null = null;
  private reconnectInterval = 5000;

  connect() {
    const config = loadConfig();
    this.ws = new WebSocket(`${config.backendUrl}/agent-socket`, {
      headers: { Authorization: `Bearer ${config.authToken}` }
    });

    this.ws.on('open', () => console.log('🟢 Connected to GitSpeak'));

    this.ws.on('message', async (data) => {
      const message = JSON.parse(data.toString());
      // message = { requestId, repoPath, operation, params }
      
      const result = await executeGitOperation(message.repoPath, message.operation, message.params);
      
      this.ws.send(JSON.stringify({
        requestId: message.requestId,
        result
      }));
    });

    this.ws.on('close', () => {
      console.log('🔴 Disconnected. Reconnecting in 5s...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    });
  }
}
```

#### `src/git/executor.ts` — Core git operation runner

This is the heart of the agent. Every git operation passes through here for logging and safety checks.

```typescript
import simpleGit, { SimpleGit } from 'simple-git';
import { isDestructiveOperation, createSafetyBackup } from './safety';
import { logCommand } from '../audit/logger';

interface OperationResult {
  success: boolean;
  output?: any;
  error?: string;
  requiresConfirmation?: boolean;
  preview?: DestructivePreview;
}

export async function executeGitOperation(
  repoPath: string,
  operation: string,
  params: Record<string, any>
): Promise<OperationResult> {
  const git: SimpleGit = simpleGit(repoPath);

  // 1. Safety check
  if (isDestructiveOperation(operation) && !params.confirmed) {
    const preview = await generatePreview(git, operation, params);
    return { success: false, requiresConfirmation: true, preview };
  }

  // 2. Auto-backup before destructive ops
  if (isDestructiveOperation(operation)) {
    await createSafetyBackup(git, operation);
  }

  // 3. Execute via operation modules
  try {
    const result = await routeOperation(git, operation, params);
    logCommand(repoPath, operation, params, result, true);
    return { success: true, output: result };
  } catch (error) {
    logCommand(repoPath, operation, params, error, false);
    return { success: false, error: error.message };
  }
}

async function routeOperation(git: SimpleGit, operation: string, params: any) {
  switch (operation) {
    case 'status': return require('./operations/status').run(git, params);
    case 'commit': return require('./operations/commit').run(git, params);
    case 'branch.create': return require('./operations/branch').create(git, params);
    case 'branch.delete': return require('./operations/branch').delete(git, params);
    case 'branch.cleanup': return require('./operations/branch').cleanup(git, params);
    case 'merge': return require('./operations/merge').run(git, params);
    case 'rebase': return require('./operations/rebase').run(git, params);
    case 'stash.save': return require('./operations/stash').save(git, params);
    case 'stash.pop': return require('./operations/stash').pop(git, params);
    case 'log': return require('./operations/history').log(git, params);
    case 'diff': return require('./operations/history').diff(git, params);
    case 'reset.soft': return require('./operations/recovery').softReset(git, params);
    case 'reset.hard': return require('./operations/recovery').hardReset(git, params);
    case 'reflog.recover': return require('./operations/recovery').recoverFromReflog(git, params);
    default: throw new Error(`Unknown operation: ${operation}`);
  }
}
```

#### `src/git/safety.ts` — Destructive operation handling

```typescript
const DESTRUCTIVE_OPERATIONS = new Set([
  'reset.hard',
  'branch.delete',
  'branch.cleanup',
  'push.force',
  'rebase',
  'clean'
]);

export function isDestructiveOperation(operation: string): boolean {
  return DESTRUCTIVE_OPERATIONS.has(operation);
}

export async function createSafetyBackup(git: SimpleGit, operation: string) {
  const currentBranch = (await git.status()).current;
  const timestamp = Date.now();
  const backupTag = `gitspeak-backup/${currentBranch}/${timestamp}`;
  await git.addTag(backupTag);
  return backupTag;
}

interface DestructivePreview {
  operation: string;
  description: string;        // plain English: "This will permanently delete..."
  affectedCommits?: { hash: string; message: string }[];
  affectedBranches?: string[];
  willCreateBackup: boolean;
  backupRef?: string;
}

export async function generatePreview(
  git: SimpleGit, 
  operation: string, 
  params: any
): Promise<DestructivePreview> {
  switch (operation) {
    case 'reset.hard': {
      const log = await git.log({ from: 'HEAD', to: params.target });
      return {
        operation,
        description: `This will discard ${log.total} commit(s) and all uncommitted changes.`,
        affectedCommits: log.all.map(c => ({ hash: c.hash, message: c.message })),
        willCreateBackup: true
      };
    }
    case 'branch.delete': {
      return {
        operation,
        description: `This will permanently delete the branch '${params.branch}'.`,
        affectedBranches: [params.branch],
        willCreateBackup: true
      };
    }
    // ... other cases
    default:
      return { operation, description: 'This action cannot be undone.', willCreateBackup: false };
  }
}
```

#### `src/git/operations/status.ts` — Example operation module

```typescript
import { SimpleGit } from 'simple-git';

export async function run(git: SimpleGit, params: any) {
  const status = await git.status();
  const log = await git.log({ maxCount: 10 });
  const stashList = await git.stashList();

  return {
    currentBranch: status.current,
    ahead: status.ahead,
    behind: status.behind,
    staged: status.staged,
    modified: status.modified,
    not_added: status.not_added,
    conflicted: status.conflicted,
    recentCommits: log.all.map(c => ({
      hash: c.hash.substring(0, 7),
      message: c.message,
      date: c.date,
      author: c.author_name
    })),
    stashes: stashList.all
  };
}
```

#### `src/repo/detector.ts` — Tech stack detection (for CI generation)

```typescript
import fs from 'fs';
import path from 'path';

interface DetectedStack {
  language: string;
  packageManager: string | null;
  testCommand: string | null;
  buildCommand: string | null;
  framework: string | null;
}

export function detectStack(repoPath: string): DetectedStack {
  const files = fs.readdirSync(repoPath);

  if (files.includes('package.json')) {
    const pkg = JSON.parse(fs.readFileSync(path.join(repoPath, 'package.json'), 'utf-8'));
    const pm = files.includes('yarn.lock') ? 'yarn' 
             : files.includes('pnpm-lock.yaml') ? 'pnpm' 
             : 'npm';
    
    let framework = null;
    if (pkg.dependencies?.next) framework = 'nextjs';
    else if (pkg.dependencies?.react) framework = 'react';
    else if (pkg.dependencies?.express) framework = 'express';
    else if (pkg.dependencies?.vue) framework = 'vue';

    return {
      language: 'javascript',
      packageManager: pm,
      testCommand: pkg.scripts?.test || null,
      buildCommand: pkg.scripts?.build || null,
      framework
    };
  }

  if (files.includes('requirements.txt') || files.includes('pyproject.toml')) {
    return {
      language: 'python',
      packageManager: files.includes('pyproject.toml') ? 'poetry' : 'pip',
      testCommand: 'pytest',
      buildCommand: null,
      framework: detectPythonFramework(repoPath)
    };
  }

  if (files.includes('Cargo.toml')) {
    return { language: 'rust', packageManager: 'cargo', testCommand: 'cargo test', buildCommand: 'cargo build', framework: null };
  }

  if (files.includes('go.mod')) {
    return { language: 'go', packageManager: 'go', testCommand: 'go test ./...', buildCommand: 'go build', framework: null };
  }

  return { language: 'unknown', packageManager: null, testCommand: null, buildCommand: null, framework: null };
}
```

---

## 4. Component 2: Backend Server — Full Build

### 4.1 Server Entry Point — `src/index.ts`

```typescript
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import repoRoutes from './routes/repos';
import commandRoutes from './routes/commands';
import webhookRoutes from './routes/github-webhooks';
import billingRoutes from './routes/billing';
import { setupAgentSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, { cors: { origin: process.env.WEB_URL } });

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/commands', commandRoutes);
app.use('/api/webhooks/github', webhookRoutes);
app.use('/api/billing', billingRoutes);

setupAgentSocket(io);

connectDB().then(() => {
  httpServer.listen(process.env.PORT, () => console.log(`GitSpeak backend on :${process.env.PORT}`));
});
```

### 4.2 The Core Command Endpoint — `src/routes/commands.ts`

This is the single most important endpoint — every NLP command from the web app flows through here.

```typescript
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { classifyIntent } from '../services/llm/intentClassifier';
import { routeIntent } from '../services/router/intentRouter';
import { generateResponse } from '../services/llm/responseGenerator';
import CommandHistory from '../models/CommandHistory';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  const { input, repoId } = req.body;
  const userId = req.user.id;

  try {
    // Step 1: Classify intent
    const intent = await classifyIntent(input, { repoId, userId });
    // intent = { 
    //   category: 'local_git' | 'github_pr' | 'github_issue' | 'github_actions' | 'intelligence',
    //   operation: 'commit' | 'branch.create' | ... ,
    //   parameters: { message: '...', branch: '...', ... },
    //   requiresConfirmation: boolean
    // }

    // Step 2: Route and execute (local agent, GitHub API, or both)
    const executionResult = await routeIntent(intent, { repoId, userId });
    // executionResult = { 
    //   success: boolean, 
    //   steps: [{ type, result }], 
    //   requiresConfirmation?: boolean,
    //   preview?: {...}
    // }

    // Step 3: Generate natural language response
    const response = await generateResponse(intent, executionResult);
    // response = { message: "...", suggestedActions: [...] }

    // Step 4: Log to history
    await CommandHistory.create({
      userId, repoId, input, intent: intent.operation,
      executionPlan: executionResult.steps,
      response: response.message
    });

    res.json({ response, executionResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirmation endpoint — for destructive operations
router.post('/confirm', requireAuth, async (req, res) => {
  const { repoId, operation, parameters } = req.body;
  const executionResult = await routeIntent(
    { operation, parameters: { ...parameters, confirmed: true } },
    { repoId, userId: req.user.id }
  );
  const response = await generateResponse({ operation }, executionResult);
  res.json({ response, executionResult });
});

export default router;
```

### 4.3 Intent Router — `src/services/router/intentRouter.ts`

```typescript
import { sendToAgent } from '../agent/commandRelay';
import * as githubPRs from '../github/pullRequests';
import * as githubIssues from '../github/issues';
import * as githubActions from '../github/actions';

interface RoutedIntent {
  category: 'local_git' | 'github_pr' | 'github_issue' | 'github_actions' | 'intelligence' | 'sequential';
  operation: string;
  parameters: Record<string, any>;
  steps?: RoutedIntent[];  // for sequential operations
}

export async function routeIntent(intent: RoutedIntent, context: { repoId: string; userId: string }) {
  const steps = [];

  switch (intent.category) {
    case 'local_git':
      // Send to local agent via WebSocket relay
      const localResult = await sendToAgent(context.userId, context.repoId, intent.operation, intent.parameters);
      steps.push({ type: 'local_git', result: localResult });
      if (localResult.requiresConfirmation) {
        return { success: false, requiresConfirmation: true, preview: localResult.preview, steps };
      }
      break;

    case 'github_pr':
      const prResult = await githubPRs.execute(intent.operation, intent.parameters, context);
      steps.push({ type: 'github_api', result: prResult });
      break;

    case 'github_issue':
      const issueResult = await githubIssues.execute(intent.operation, intent.parameters, context);
      steps.push({ type: 'github_api', result: issueResult });
      break;

    case 'github_actions':
      const actionsResult = await githubActions.execute(intent.operation, intent.parameters, context);
      steps.push({ type: 'github_api', result: actionsResult });
      break;

    case 'sequential':
      // e.g., "push and open a PR" = local push THEN github PR creation
      for (const step of intent.steps!) {
        const stepResult = await routeIntent(step, context);
        steps.push(...stepResult.steps);
        if (!stepResult.success) return { success: false, steps };
      }
      break;
  }

  return { success: true, steps };
}
```

### 4.4 Agent Command Relay — `src/services/agent/commandRelay.ts`

```typescript
import { getAgentSocket } from './connectionManager';

// Sends a command to the user's local agent and waits for the result.
// Uses a request/response pattern over the persistent WebSocket.

const pendingRequests = new Map<string, (result: any) => void>();

export async function sendToAgent(
  userId: string, 
  repoId: string, 
  operation: string, 
  parameters: any
): Promise<any> {
  const socket = getAgentSocket(userId);
  if (!socket) throw new Error('Local agent not connected. Please start gitspeak-agent.');

  const repo = await RegisteredRepo.findById(repoId);
  const requestId = generateRequestId();

  return new Promise((resolve, reject) => {
    pendingRequests.set(requestId, resolve);
    
    socket.send(JSON.stringify({
      requestId,
      repoPath: repo.localPath,
      operation,
      params: parameters
    }));

    setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error('Agent did not respond in time'));
      }
    }, 10000);
  });
}

// Called when agent sends back a result
export function handleAgentResponse(requestId: string, result: any) {
  const resolver = pendingRequests.get(requestId);
  if (resolver) {
    resolver(result);
    pendingRequests.delete(requestId);
  }
}
```

---

## 5. Component 3: Web App — Full Build

### 5.1 App Shell Layout — `app/(app)/layout.tsx`

```tsx
import { Sidebar } from '@/components/Sidebar';
import { CommandBar } from '@/components/CommandBar/CommandBar';
import { AgentStatusIndicator } from '@/components/AgentStatusIndicator';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center px-4 py-2 border-b border-[#30363D]">
          <span className="font-mono text-sm">GitSpeak</span>
          <AgentStatusIndicator />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <CommandBar />
      </div>
    </div>
  );
}
```

### 5.2 The Command Bar — `components/CommandBar/CommandBar.tsx`

```tsx
'use client';
import { useState } from 'react';
import { useCommand } from '@/lib/hooks/useCommand';
import { ResponseCard } from './ResponseCard';
import { DestructivePreview } from './DestructivePreview';

export function CommandBar() {
  const [input, setInput] = useState('');
  const { sendCommand, history, isProcessing, pendingConfirmation, confirm } = useCommand();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendCommand(input);
    setInput('');
  };

  return (
    <div className="border-t border-[#30363D] p-4">
      {/* Response history */}
      <div className="max-h-96 overflow-y-auto mb-2 space-y-2">
        {history.map((item, i) => (
          <ResponseCard key={i} item={item} />
        ))}
      </div>

      {/* Destructive confirmation UI */}
      {pendingConfirmation && (
        <DestructivePreview 
          preview={pendingConfirmation.preview} 
          onConfirm={() => confirm(true)}
          onCancel={() => confirm(false)}
        />
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell GitSpeak what you want to do..."
          className="flex-1 bg-[#161B22] border border-[#30363D] rounded-md px-3 py-2 
                     font-mono text-sm focus:outline-none focus:border-[#58A6FF]"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          disabled={isProcessing}
          className="bg-[#238636] hover:bg-[#2ea043] rounded-md px-4 py-2 text-sm font-medium"
        >
          {isProcessing ? '...' : '↑'}
        </button>
      </form>
    </div>
  );
}
```

### 5.3 Command Hook — `lib/hooks/useCommand.ts`

```typescript
import { useState, useCallback } from 'react';
import { useRepoContext } from './useRepoContext';
import { api } from '@/lib/api';

export function useCommand() {
  const [history, setHistory] = useState<CommandResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<any>(null);
  const { activeRepoId } = useRepoContext();

  const sendCommand = useCallback(async (input: string) => {
    setIsProcessing(true);
    setHistory(prev => [...prev, { type: 'user', text: input }]);

    try {
      const result = await api.post('/commands', { input, repoId: activeRepoId });
      
      if (result.executionResult.requiresConfirmation) {
        setPendingConfirmation({
          operation: result.executionResult.steps[0].result.preview.operation,
          parameters: result.executionResult.steps[0].result.preview,
          preview: result.executionResult.steps[0].result.preview
        });
      } else {
        setHistory(prev => [...prev, { type: 'response', ...result.response }]);
      }
    } catch (error) {
      setHistory(prev => [...prev, { type: 'error', text: error.message }]);
    } finally {
      setIsProcessing(false);
    }
  }, [activeRepoId]);

  const confirm = useCallback(async (confirmed: boolean) => {
    if (!confirmed) {
      setHistory(prev => [...prev, { type: 'response', message: 'Cancelled.' }]);
      setPendingConfirmation(null);
      return;
    }

    setIsProcessing(true);
    const result = await api.post('/commands/confirm', {
      repoId: activeRepoId,
      operation: pendingConfirmation.operation,
      parameters: pendingConfirmation.parameters
    });
    setHistory(prev => [...prev, { type: 'response', ...result.response }]);
    setPendingConfirmation(null);
    setIsProcessing(false);
  }, [activeRepoId, pendingConfirmation]);

  return { sendCommand, history, isProcessing, pendingConfirmation, confirm };
}
```

### 5.4 Repo Dashboard — `app/(app)/dashboard/page.tsx`

```tsx
'use client';
import { useRepoState } from '@/lib/hooks/useRepoState';
import { LocalStatePanel } from '@/components/Dashboard/LocalStatePanel';
import { RemoteStatePanel } from '@/components/Dashboard/RemoteStatePanel';

export default function DashboardPage() {
  const { localState, remoteState, isLoading } = useRepoState();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-6 grid grid-cols-2 gap-4">
      <LocalStatePanel state={localState} />
      <RemoteStatePanel state={remoteState} />
    </div>
  );
}
```

### 5.5 Agent Setup / Pairing Page — `app/(app)/setup-agent/page.tsx`

```tsx
'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function SetupAgentPage() {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [agentConnected, setAgentConnected] = useState(false);

  useEffect(() => {
    api.post('/agent/generate-pairing-code').then(res => setPairingCode(res.code));

    // Poll for agent connection
    const interval = setInterval(async () => {
      const status = await api.get('/agent/status');
      if (status.connected) {
        setAgentConnected(true);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-medium">Connect the local agent</h1>
      <p className="text-[#8B949E]">
        GitSpeak needs a small local agent to run git commands on your machine. 
        Install it once:
      </p>

      <pre className="bg-[#161B22] border border-[#30363D] rounded-md p-4 font-mono text-sm">
        npm install -g gitspeak-agent
      </pre>

      <p className="text-[#8B949E]">Then pair it with this code:</p>
      <div className="font-mono text-3xl tracking-widest bg-[#161B22] border border-[#30363D] 
                      rounded-md p-4 text-center">
        {pairingCode || '------'}
      </div>
      <pre className="bg-[#161B22] border border-[#30363D] rounded-md p-4 font-mono text-sm">
        gitspeak-agent pair {pairingCode}
      </pre>

      {agentConnected && (
        <div className="bg-[#0D2818] border border-[#3FB950] rounded-md p-4 text-[#3FB950]">
          ✅ Agent connected! Now register your first repo:
          <pre className="mt-2 font-mono text-sm text-[#E6EDF3]">
            gitspeak-agent register ~/path/to/your/repo
          </pre>
        </div>
      )}
    </div>
  );
}
```

---

## 6. Component 4: NLP / LLM Integration Layer

### 6.1 Intent Classification — `src/services/llm/intentClassifier.ts`

```typescript
import OpenAI from 'openai';
import { INTENT_CLASSIFICATION_PROMPT } from './prompts/intentClassification';
import { getRepoContext } from '../repoContext';

const openai = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY });

export async function classifyIntent(input: string, context: { repoId: string; userId: string }) {
  const repoContext = await getRepoContext(context.repoId);

  const response = await openai.messages.create({
    model: 'openrouter-free-model',
    max_tokens: 500,
    system: INTENT_CLASSIFICATION_PROMPT(repoContext),
    messages: [{ role: 'user', content: input }],
    tools: [INTENT_TOOL_DEFINITION]  // structured output via tool calling
  });

  const toolUse = response.content.find(c => c.type === 'tool_use');
  return toolUse.input; // { category, operation, parameters, requiresConfirmation }
}

// Tool definition forces structured output
const INTENT_TOOL_DEFINITION = {
  name: 'classify_git_intent',
  description: 'Classify a user command into a git/GitHub operation',
  input_schema: {
    type: 'object',
    properties: {
      category: { 
        type: 'string', 
        enum: ['local_git', 'github_pr', 'github_issue', 'github_actions', 'intelligence', 'sequential'] 
      },
      operation: { type: 'string' },
      parameters: { type: 'object' },
      steps: { 
        type: 'array', 
        description: 'For sequential operations only',
        items: { type: 'object' }
      },
      requiresClarification: { type: 'boolean' },
      clarifyingQuestion: { type: 'string' }
    },
    required: ['category', 'operation', 'parameters']
  }
};
```

### 6.2 System Prompt — `src/services/llm/prompts/intentClassification.ts`

```typescript
export function INTENT_CLASSIFICATION_PROMPT(repoContext: RepoContext): string {
  return `You are the intent classification layer for GitSpeak, a conversational interface for git and GitHub.

Your job: classify the user's natural language input into a structured git/GitHub operation.

CURRENT REPO CONTEXT:
- Repo: ${repoContext.fullName}
- Current branch: ${repoContext.currentBranch}
- Branches: ${repoContext.branches.join(', ')}
- Uncommitted changes: ${repoContext.hasUncommittedChanges ? 'yes' : 'no'}
- Open PRs: ${repoContext.openPRs.map(pr => `#${pr.number} (${pr.branch})`).join(', ') || 'none'}
- Detected stack: ${repoContext.detectedStack.language} / ${repoContext.detectedStack.framework || 'none'}

AVAILABLE OPERATIONS:

local_git operations:
- status, commit, branch.create, branch.delete, branch.cleanup, branch.rename
- merge, rebase, rebase.continue, rebase.abort
- stash.save, stash.pop, stash.list
- log, diff, blame
- reset.soft, reset.hard, reflog.recover, cherry-pick, tag

github_pr operations:
- create, list, summarize, merge, close, update_description

github_issue operations:
- create, list, close, assign

github_actions operations:
- list_workflows, trigger, generate_yaml, explain_workflow, get_run_status, get_failure_logs

intelligence operations:
- tech_stack, setup_instructions, file_history, branch_safety_check, weekly_summary, changes_since

sequential: for multi-step commands (e.g. "commit and push and open a PR" = 
  [{category: local_git, operation: commit}, {category: local_git, operation: push}, 
   {category: github_pr, operation: create}])

DESTRUCTIVE OPERATIONS (set requiresClarification only if truly ambiguous; otherwise classify 
normally — the execution layer handles confirmation):
reset.hard, branch.delete, branch.cleanup, rebase, push.force

RULES:
1. If the user references "this branch" or "this PR" without specifying, use the current 
   repo context to resolve it.
2. If a command is ambiguous (e.g., "delete the branch" with multiple candidates), set 
   requiresClarification: true and ask which one.
3. For "push and open a PR" type commands, use category: "sequential".
4. Extract ALL parameters mentioned — branch names, commit messages, PR numbers, file paths.
5. If the user asks a question (not a command), classify as "intelligence".

Respond using the classify_git_intent tool only.`;
}
```

### 6.3 Response Generator — `src/services/llm/responseGenerator.ts`

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY });

export async function generateResponse(intent: any, executionResult: any) {
  const response = await openai.messages.create({
    model: 'openrouter-free-model',
    max_tokens: 400,
    system: `You are GitSpeak's response layer. Given the result of a git/GitHub operation, 
write a brief, friendly, natural language response to the user.

Rules:
- Be concise — 1-3 sentences for simple operations
- Use checkmarks (✅) for success, (❌) for failure
- For "status" type queries, summarize the key facts clearly
- Suggest 1-2 logical next actions where relevant
- Show actual data (branch names, commit hashes, numbers) — don't be vague
- If the operation failed, explain why in plain English and suggest a fix

Respond with JSON: { "message": "...", "suggestedActions": ["...", "..."] }`,
    messages: [{ 
      role: 'user', 
      content: `Intent: ${JSON.stringify(intent)}\nResult: ${JSON.stringify(executionResult)}` 
    }]
  });

  return JSON.parse(response.content[0].text);
}
```

### 6.4 YAML Generator — `src/services/llm/yamlGenerator.ts`

```typescript
export async function generateWorkflowYAML(
  description: string, 
  detectedStack: DetectedStack
): Promise<{ yaml: string; filename: string; explanation: string; requiredSecrets: string[] }> {
  
  const response = await openai.messages.create({
    model: 'openrouter-free-model',
    max_tokens: 1500,
    system: `You generate GitHub Actions YAML workflows. 

CONTEXT:
- Project language: ${detectedStack.language}
- Package manager: ${detectedStack.packageManager}
- Test command: ${detectedStack.testCommand}
- Framework: ${detectedStack.framework}

RULES:
1. Use current, non-deprecated action versions (actions/checkout@v4, actions/setup-node@v4, etc.)
2. Never hardcode secrets — use \${{ secrets.NAME }} syntax
3. Add a comment above each step explaining what it does
4. Use appropriate triggers based on the description
5. List any secrets the user needs to configure in GitHub repo settings

Respond with JSON: { 
  "yaml": "<full yaml content>", 
  "filename": "ci.yml", 
  "explanation": "<plain english explanation>",
  "requiredSecrets": ["SECRET_NAME", ...]
}`,
    messages: [{ role: 'user', content: description }]
  });

  return JSON.parse(response.content[0].text);
}
```

---

## 7. Feature-by-Feature Implementation Specs

### Feature: "What's the status of this repo?"

**Flow:**
1. User input → `classifyIntent` → `{ category: 'local_git', operation: 'status', parameters: {} }`
2. `routeIntent` → `sendToAgent(userId, repoId, 'status', {})`
3. Agent runs `git status`, `git log -10`, `git stash list` → returns structured data
4. Backend ALSO fetches GitHub remote state in parallel: open PRs, latest Action run
5. `generateResponse` combines both into natural language
6. Response: *"You're on `feature/payments`, 2 commits ahead of origin. 3 files changed but not committed. PR #12 for this branch is open with CI passing."*

**Implementation checklist:**
- [ ] Agent `status` operation returns local git state
- [ ] Backend fetches GitHub PR list filtered by current branch
- [ ] Backend fetches latest Actions run for current branch
- [ ] Response generator combines local + remote into one message
- [ ] Dashboard UI shows this as persistent panel (not just chat response)

---

### Feature: "Commit this as [message]"

**Flow:**
1. Classify → `{ category: 'local_git', operation: 'commit', parameters: { message: '...' } }`
2. Agent: `git add -A && git commit -m "..."`
3. Not destructive — executes immediately, no confirmation needed
4. Response: *"✅ Committed: '[message]' (3 files changed)"*

**Implementation checklist:**
- [ ] Agent `commit` operation: stages all changes, commits with message
- [ ] Edge case: nothing to commit → respond "Nothing to commit — your working directory is clean"
- [ ] Edge case: merge conflict markers present → refuse, explain why
- [ ] Optional parameter: specific files/paths instead of `-A`

---

### Feature: "Push and open a PR"

**Flow:**
1. Classify → `category: 'sequential'`, steps: `[push, github_pr.create]`
2. Step 1 (local_git, push): Agent runs `git push -u origin <current-branch>`
3. Step 2 (github_pr, create):
   - Fetch commits on this branch not in base branch (via agent or GitHub API)
   - Send commit messages + diff stat to LLM → generate title + description
   - `POST /repos/{owner}/{repo}/pulls` with generated content
4. Response: *"✅ Pushed `feature/payments`. Created PR #14: 'Add Stripe payment integration'. CI is now running."*

**Implementation checklist:**
- [ ] Agent `push` operation (handle case where remote branch doesn't exist yet → `-u`)
- [ ] PR description generator: fetch commit log for branch, pass to LLM
- [ ] GitHub PR creation via Octokit
- [ ] Auto-detect base branch (default branch of repo)
- [ ] Handle case: PR already exists for this branch → update instead of create

---

### Feature: "Set up CI for this project"

**Flow:**
1. Classify → `{ category: 'github_actions', operation: 'generate_yaml', parameters: { description: 'CI that runs tests' } }`
2. Backend requests `detectedStack` from agent (or from cached `RegisteredRepo.detectedStack`)
3. `generateWorkflowYAML(description, detectedStack)` → LLM generates YAML
4. Backend returns YAML + explanation to frontend — **does NOT commit yet**
5. Frontend shows YAML in Monaco preview modal with [Create] / [Edit] / [Cancel]
6. On [Create]: 
   - Agent writes `.github/workflows/ci.yml` to local repo
   - Agent commits + pushes
7. Response: *"✅ CI workflow created and pushed. Required secrets to add in GitHub: none for this workflow. It'll run on your next push to main."*

**Implementation checklist:**
- [ ] Stack detection runs on repo registration AND can be re-triggered
- [ ] YAML generation prompt includes few-shot examples for common stacks (Node, Python, Go)
- [ ] Frontend Monaco YAML preview component
- [ ] Agent file-write operation (with path validation — only within repo, only `.github/workflows/`)
- [ ] After commit+push, optionally trigger the workflow immediately for validation

---

### Feature: "Why did my build fail?"

**Flow:**
1. Classify → `{ category: 'github_actions', operation: 'get_failure_logs', parameters: { workflow: 'latest' } }`
2. Backend: `GET /repos/.../actions/runs` (filter: status=completed, conclusion=failure, most recent)
3. Backend: `GET /repos/.../actions/runs/{id}/jobs` → get failed job
4. Backend: fetch job logs (GitHub API returns log archive — need to download + extract relevant portion)
5. Pass failed step + relevant log lines to LLM
6. LLM: explain failure in plain English + suggest fix

**Implementation checklist:**
- [ ] GitHub Actions logs API returns a zip — need extraction logic
- [ ] Truncate logs intelligently (last 100 lines of failed step, not entire log)
- [ ] LLM prompt: "explain this CI failure and suggest a fix" with log excerpt
- [ ] If fix involves a code change, offer: "Want me to show you the relevant file?"

---

### Feature: "Undo my last commit but keep changes"

**Flow:**
1. Classify → `{ category: 'local_git', operation: 'reset.soft', parameters: { target: 'HEAD~1' } }`
2. `reset.soft` is in DESTRUCTIVE set? — **No** (soft reset doesn't lose data, only un-commits) — but still show preview for clarity
3. Agent: `git reset --soft HEAD~1`
4. Response: *"✅ Undone. Your changes from that commit are now back in your staging area, ready to re-commit."*

**Implementation checklist:**
- [ ] Distinguish soft reset (safe, no backup needed) from hard reset (destructive, backup needed)
- [ ] Agent operation: `reset.soft` with target (default `HEAD~1`, but support `HEAD~N`)
- [ ] Response should clarify what state things are in afterward

---

### Feature: "Clean up branches that have been merged"

**Flow:**
1. Classify → `{ category: 'local_git', operation: 'branch.cleanup', parameters: {} }` — DESTRUCTIVE
2. Agent: 
   - `git branch --merged main` → list of local branches merged into main
   - Filter out `main`/`master`/current branch
   - Return preview: list of branches that would be deleted
3. Backend returns `requiresConfirmation: true` with preview
4. Frontend shows: *"These branches are merged and safe to delete: feature/login, fix/typo, feature/old-nav. Delete them?"*
5. On confirm: Agent runs `git branch -d` for each

**Implementation checklist:**
- [ ] Agent: identify merged branches (exclude protected branches: main, master, develop)
- [ ] Cross-check with GitHub: also delete remote branches if merged via PR? (ask user preference)
- [ ] Preview UI: checklist of branches, user can deselect individual ones before confirming

---

### Feature: "I think I messed up my rebase" (Recovery)

**Flow:**
1. Classify → `{ category: 'intelligence', operation: 'recovery_assist', parameters: {} }`
2. Agent: check `git status` for rebase-in-progress state (`.git/rebase-merge` exists)
3. Agent: `git reflog` to find pre-rebase HEAD position
4. Return state: `{ inRebase: true, conflictedFiles: [...], preRebaseCommit: 'a1b2c3' }`
5. LLM generates response with options: abort / show conflicts / continue
6. Each option maps to a follow-up operation (`rebase.abort`, etc.)

**Implementation checklist:**
- [ ] Agent: detect rebase/merge-in-progress states
- [ ] Agent: `rebase.abort` operation
- [ ] Agent: conflict file listing with conflict markers parsed
- [ ] Response includes actionable buttons, not just text

---

## 8. Database Schema — Full Definitions

### MongoDB Collections (Mongoose Schemas)

```typescript
// models/User.ts
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  githubId: { type: String, unique: true, required: true },
  githubLogin: String,
  githubAccessToken: { type: String, required: true }, // encrypted via field-level encryption
  plan: { type: String, enum: ['free', 'pro'], default: 'free' },
  stripeCustomerId: String,
  commandsUsedThisMonth: { type: Number, default: 0 },
  commandsResetAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default model('User', UserSchema);
```

```typescript
// models/RegisteredRepo.ts
const RegisteredRepoSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  localPath: { type: String, required: true },
  githubFullName: String,        // 'owner/repo', null if no remote
  defaultBranch: { type: String, default: 'main' },
  detectedStack: {
    language: String,
    packageManager: String,
    testCommand: String,
    buildCommand: String,
    framework: String
  },
  webhookId: Number,
  lastSyncedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

RegisteredRepoSchema.index({ userId: 1, localPath: 1 }, { unique: true });

export default model('RegisteredRepo', RegisteredRepoSchema);
```

```typescript
// models/CommandHistory.ts
const CommandHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  repoId: { type: Schema.Types.ObjectId, ref: 'RegisteredRepo', required: true },
  input: { type: String, required: true },
  intent: String,
  executionPlan: [{
    type: { type: String, enum: ['local_git', 'github_api', 'file_write'] },
    operation: String,
    success: Boolean,
    result: Schema.Types.Mixed
  }],
  response: String,
  createdAt: { type: Date, default: Date.now, expires: 7776000 } // auto-delete after 90 days
});

export default model('CommandHistory', CommandHistorySchema);
```

```typescript
// models/AgentSession.ts
const AgentSessionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  machineId: String,         // hashed machine identifier
  agentVersion: String,
  os: String,
  status: { type: String, enum: ['connected', 'disconnected'], default: 'connected' },
  lastPingAt: Date,
  connectedAt: { type: Date, default: Date.now }
});

export default model('AgentSession', AgentSessionSchema);
```

```typescript
// models/PairingCode.ts
const PairingCodeSchema = new Schema({
  code: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true, expires: 0 } // TTL index, expires after 10 min
});

export default model('PairingCode', PairingCodeSchema);
```

---

## 9. Security Implementation

### 9.1 GitHub Token Encryption

```typescript
// utils/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')), 
    decipher.final()
  ]);
  return decrypted.toString('utf8');
}

// Use Mongoose middleware to encrypt/decrypt githubAccessToken transparently
```

### 9.2 Agent Authentication

- Agent authenticates via JWT issued during pairing
- JWT scoped to: `{ userId, machineId }` — cannot be used to impersonate web sessions
- WebSocket connection requires valid JWT in handshake headers
- JWT expires after 30 days — agent must re-pair (or auto-refreshes via separate refresh token)

### 9.3 Path Validation (Agent-Side)

Critical: the agent must never execute operations outside registered repo paths, and file writes must be restricted.

```typescript
// agent: src/git/safety.ts (additional function)
import path from 'path';

export function validatePath(repoPath: string, targetPath: string): boolean {
  const resolvedRepo = path.resolve(repoPath);
  const resolvedTarget = path.resolve(repoPath, targetPath);
  return resolvedTarget.startsWith(resolvedRepo);
}

// For file writes (e.g., committing generated YAML):
export function validateWorkflowPath(repoPath: string, filename: string): boolean {
  const allowedDir = path.join(repoPath, '.github', 'workflows');
  const resolved = path.resolve(allowedDir, filename);
  return resolved.startsWith(allowedDir) && filename.endsWith('.yml');
}
```

### 9.4 Rate Limiting

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const commandRateLimit = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 30,                     // 30 commands per minute max (prevents runaway loops)
  keyGenerator: (req) => req.user.id,
  message: 'Too many commands — please slow down.'
});

// Monthly usage check (middleware, before command processing)
export async function checkMonthlyLimit(req, res, next) {
  const user = await User.findById(req.user.id);
  if (user.plan === 'free' && user.commandsUsedThisMonth >= 30) {
    return res.status(402).json({ 
      error: 'Monthly command limit reached. Upgrade to Pro for unlimited commands.' 
    });
  }
  next();
}
```

---

## 10. Day-by-Day Build Plan (8 Weeks)

### Week 1: Foundation

| Day | Tasks |
|---|---|
| **Day 1** | Monorepo setup, package.json workspaces, GitHub OAuth app creation, MongoDB setup (Atlas or Docker local) |
| **Day 2** | Backend: Express server skeleton, DB connection, User model, GitHub OAuth flow (Passport) |
| **Day 3** | Local agent: CLI skeleton (commander), config management (~/.gitspeak/config.json), `register`/`list` commands |
| **Day 4** | Local agent: `git/executor.ts` core + `operations/status.ts` — test `gitspeak-agent` can run `git status` on a repo |
| **Day 5** | Pairing flow: backend pairing code generation, agent `pair` command, JWT issuance |
| **Day 6** | WebSocket connection: agent ↔ backend persistent connection (Socket.IO or raw ws) |
| **Day 7** | Web app: Next.js shell, landing page, GitHub OAuth login flow, agent setup/pairing page |

**End of Week 1 milestone:** Agent installs, pairs with web app, `git status` data flows from local machine to web app (displayed as raw JSON is fine for now).

---

### Week 2: Core NLP — Local Git Operations

| Day | Tasks |
|---|---|
| **Day 8** | LLM integration: `intentClassifier.ts`, system prompt, tool-calling setup. Test classification accuracy manually with 20 sample inputs |
| **Day 9** | Agent operations: `commit.ts`, `branch.ts` (create/delete/list) |
| **Day 10** | Agent operations: `history.ts` (log, diff), `stash.ts` |
| **Day 11** | Backend: `intentRouter.ts`, `commandRelay.ts` — wire classification → agent execution |
| **Day 12** | `responseGenerator.ts` — natural language responses for status/commit/branch operations |
| **Day 13** | Web app: Command Bar component, `useCommand` hook, response card UI |
| **Day 14** | End-to-end test: "What's my status?", "Commit this as X", "Create a branch for Y" all working |

**End of Week 2 milestone:** Core conversational loop works for local git — status, commit, branching, basic history.

---

### Week 3: Destructive Operations & Safety

| Day | Tasks |
|---|---|
| **Day 15** | Agent: `safety.ts` — destructive operation detection, backup tag creation |
| **Day 16** | Agent: `recovery.ts` — reset.soft, reset.hard with preview, reflog recovery |
| **Day 17** | Agent: `merge.ts`, `rebase.ts` (including conflict detection, abort/continue) |
| **Day 18** | Backend: confirmation flow — `requiresConfirmation` handling, `/commands/confirm` endpoint |
| **Day 19** | Web app: `DestructivePreview` component — visual before/after, confirm/cancel UI |
| **Day 20** | Web app: Commit graph visualization component (basic version — branch lines + nodes via SVG) |
| **Day 21** | Testing: deliberately create messy git states (failed rebases, conflicts) and verify recovery flows |

**End of Week 3 milestone:** Safe handling of destructive operations with previews; recovery flows for common "oh no" scenarios.

---

### Week 4: GitHub Layer — Repos, PRs, Issues

| Day | Tasks |
|---|---|
| **Day 22** | Backend: Octokit client setup, `github/client.ts`, repo metadata fetching |
| **Day 23** | Backend: `github/pullRequests.ts` — create, list, merge operations |
| **Day 24** | Backend: PR description auto-generation — fetch commits + diff, LLM generates title/description |
| **Day 25** | Backend: `github/issues.ts` — create, list, close, assign |
| **Day 26** | Agent: `push.ts` operation (handle new branch with `-u`, existing branch) |
| **Day 27** | Intent classification: extend for `sequential` category — "push and open a PR" |
| **Day 28** | Web app: Repo Dashboard — Local State Panel + Remote State Panel (PRs, issues display) |

**End of Week 4 milestone:** "Push and open a PR", "Merge my PR", "Create an issue" all functional. Dashboard shows combined local+remote state.

---

### Week 5: GitHub Actions / CI-CD

| Day | Tasks |
|---|---|
| **Day 29** | Agent: `detector.ts` — stack detection (Node, Python, Go, Rust) |
| **Day 30** | Backend: `yamlGenerator.ts` — LLM-based YAML generation with few-shot examples per stack |
| **Day 31** | Web app: YAML Preview Modal (Monaco editor, syntax highlighting) |
| **Day 32** | Agent: file write operation for `.github/workflows/*.yml` with path validation |
| **Day 33** | Backend: `github/actions.ts` — trigger workflow, list runs, get run status |
| **Day 34** | Backend: webhook handler for `workflow_run` events — real-time status updates via Socket.IO |
| **Day 35** | Web app: real-time CI status indicators (live updates while workflow runs) |

**End of Week 5 milestone:** "Set up CI for this project" generates and commits working YAML. "Run tests" triggers and shows live status.

---

### Week 6: CI Failure Analysis + Repo Intelligence

| Day | Tasks |
|---|---|
| **Day 36** | Backend: GitHub Actions logs extraction (download zip, parse, extract failed step logs) |
| **Day 37** | LLM prompt: "explain this CI failure" — test with real failure examples |
| **Day 38** | Backend: `intelligence` category operations — tech_stack, setup_instructions (read README + package files) |
| **Day 39** | Backend: `changes_since`, `file_history`, `branch_safety_check` |
| **Day 40** | Web app: Visual Diff Viewer (Monaco diff mode) for commit/branch comparisons |
| **Day 41** | Web app: Commit Graph Explorer — full interactive version (clickable nodes → diff) |
| **Day 42** | Polish pass: error states, loading states, empty states across all features |

**End of Week 6 milestone:** Full feature set complete. "Why did my build fail?" gives useful answers. Visual history exploration works.

---

### Week 7: Onboarding, Monetisation, Polish

| Day | Tasks |
|---|---|
| **Day 43** | Onboarding flow: first-run experience, sample commands, agent install walkthrough |
| **Day 44** | Stripe integration: Free/Pro plans, checkout flow, webhook for subscription events |
| **Day 45** | Usage limits: command counting, monthly reset, upgrade prompts at 80%/100% |
| **Day 46** | Settings page: repo management (add/remove repos), account settings, billing portal link |
| **Day 47** | "Show git command" toggle — reveal underlying git commands for learning users |
| **Day 48** | Performance pass: response time optimization, caching repo context, reduce LLM calls where possible |
| **Day 49** | Cross-platform testing: agent on macOS, Linux, Windows (WSL) |

**End of Week 7 milestone:** Monetisation live, onboarding polished, cross-platform verified.

---

### Week 8: Launch Preparation

| Day | Tasks |
|---|---|
| **Day 50** | Landing page: hero, replacement-map table, demo video embed, pricing |
| **Day 51** | Demo video production: record split-screen "old way vs GitSpeak" for 5 key commands |
| **Day 52** | Write Show HN post + Product Hunt listing copy |
| **Day 53** | Security review: token encryption verified, path validation tested, audit log review |
| **Day 54** | Open-source the local agent repo (separate public GitHub repo) with clear README |
| **Day 55** | Soft launch: share with 10–15 developers for feedback, fix critical issues |
| **Day 56** | **Public launch**: Show HN + Product Hunt + Twitter/X |

**End of Week 8 milestone:** Public launch complete.

---

## 11. Testing Strategy

### Agent Testing (Critical — runs real git commands)

```
- Unit tests for each operation module using a temporary test git repo
  (created/destroyed per test via `simple-git` + tmpdir)
- Test matrix: clean repo, repo with uncommitted changes, repo with conflicts,
  repo mid-rebase, repo with stashes
- Safety tests: verify backup tags are created before every destructive operation
- Path validation tests: attempt path traversal, verify rejection
```

### Backend Testing

```
- Intent classification: maintain a golden set of 100+ example inputs with 
  expected classifications, run against LLM regularly to catch prompt drift
- Integration tests: mock GitHub API (using `nock`) for PR/issue/Actions operations
- Load testing: command endpoint under concurrent requests
```

### Web App Testing

```
- Component tests for CommandBar, DestructivePreview, Dashboard panels
- E2E tests (Playwright): full flow from login → agent pairing → first command
- Visual regression tests for commit graph rendering
```

### Manual QA Checklist (run before each release)

```
[ ] Fresh agent install on clean machine — pairing works
[ ] "What's my status" on a repo with no GitHub remote configured
[ ] Destructive operation preview shows correct affected commits
[ ] Backup tag created and recoverable after hard reset
[ ] PR creation with auto-generated description reads naturally
[ ] CI YAML generation produces valid, runnable YAML for Node/Python/Go
[ ] Real-time CI status updates appear without page refresh
[ ] Free tier command limit triggers upgrade prompt correctly
[ ] Agent reconnects automatically after network interruption
```

---

## 12. Deployment Plan

### Infrastructure

| Component | Platform | Notes |
|---|---|---|
| Backend (Express + Socket.IO) | Railway or Render | Needs persistent WebSocket support |
| Web app (Next.js) | Vercel | Standard Next.js deployment |
| MongoDB | MongoDB Atlas (free tier → M10 as scale) | |
| Agent npm package | npm registry | Public package: `gitspeak-agent` |

### Environment Promotion

```
Local dev → Staging (staging.gitspeak.dev) → Production (gitspeak.dev)
```

- Staging environment uses a separate MongoDB database and separate GitHub OAuth app
- Agent supports `GITSPEAK_ENV` env var to point at staging backend during testing

### Monitoring (Post-Launch)

- Error tracking: Sentry (backend + web app)
- Uptime monitoring: for backend WebSocket endpoint specifically (agents depend on it)
- LLM API usage dashboard: track cost per command, alert on anomalies
- Agent telemetry (opt-in): anonymized command category distribution, for the "command category health" metric from the PRD

---

## 13. Post-Launch Iteration Plan

### Week 1 post-launch: Watch & Fix
- Monitor agent install success rate (target > 70%)
- Fix any intent classification failures surfaced by real usage (expand golden test set)
- Address any security reports immediately (especially around agent — it's running on people's machines)

### Week 2-4 post-launch: Based on usage data
- If local git commands < 20% of usage → investigate why agent value isn't landing, consider onboarding changes emphasizing local commands
- If "intelligence" queries are heavily used → expand that command category
- If CI/Actions generation has low success rate → expand few-shot examples for failing stack types

### Month 2+: Feature expansion candidates (in priority order based on user requests)
1. CLI mode (`gitspeak` terminal command) — likely highest-requested by power users
2. VS Code extension — major distribution opportunity
3. GitLab support — if significant portion of users request it
4. AI PR review (deferred from v2 scope) — revisit once core loop is validated

---

*Document ends.*

*This is a living document — update the day-by-day plan as actual velocity becomes clear. The Week 1-2 milestones are the most important to hit on schedule, as they validate the core architectural bet (local agent + conversational interface). If Week 1-2 takes significantly longer than planned, reassess scope before continuing.*
