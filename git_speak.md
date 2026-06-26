# GitSpeak — Product Requirements Document
**Version:** 2.0 — GitHub-Native Focus  
**Date:** June 2026  
**Author:** Sumir  
**Status:** Draft → In Development

> **Positioning shift from v1:** This version removes all team/Slack/multiplayer features. GitSpeak is now strictly defined as **a new way to use Git and GitHub** — a conversational, intelligent replacement for the GitHub UI and CLI, built for a single developer's daily workflow. Every feature must answer one question: *"Does this make using git/GitHub fundamentally better for one person working on their repo?"*

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Core Thesis: What "New Way to Use Git" Means](#2-core-thesis-what-new-way-to-use-git-means)
3. [Problem Statement](#3-problem-statement)
4. [Target User](#4-target-user)
5. [Product Overview](#5-product-overview)
6. [Core Features — Detailed Spec](#6-core-features--detailed-spec)
7. [The Replacement Map — GitHub UI → GitSpeak](#7-the-replacement-map--github-ui--gitspeak)
8. [User Flows](#8-user-flows)
9. [Technical Architecture](#9-technical-architecture)
10. [GitHub API Integration Map](#10-github-api-integration-map)
11. [Data Models](#11-data-models)
12. [UI/UX Design Principles](#12-uiux-design-principles)
13. [Monetisation Strategy](#13-monetisation-strategy)
14. [Go-to-Market Strategy](#14-go-to-market-strategy)
15. [Build Roadmap](#15-build-roadmap)
16. [Success Metrics](#16-success-metrics)
17. [Risks & Mitigations](#17-risks--mitigations)
18. [Out of Scope](#18-out-of-scope)
19. [Appendix — Full NLP Command Library](#19-appendix--full-nlp-command-library)

---

## 1. Executive Summary

GitSpeak is a conversational interface that replaces how a developer interacts with Git and GitHub. Instead of using `git` CLI commands, navigating GitHub's web UI, or writing GitHub Actions YAML, the developer simply describes what they want in plain English — to their entire repository, branches, commits, PRs, issues, and CI/CD pipelines.

**One sentence pitch:** Git and GitHub, rebuilt around conversation instead of commands and clicks.

**What it is NOT:**
- Not a team collaboration tool
- Not a Slack/Discord bot
- Not a project management tool
- Not multiplayer-first

**What it IS:**
- A single-player power tool — one developer, their repos, a radically faster interface
- A complete alternative surface to github.com for daily git operations
- The layer between "what I want to happen to my code" and "the API calls that make it happen"

**Core insight:** Git has ~150 commands and flags. GitHub's UI has hundreds of buttons across dozens of pages. A developer uses maybe 15 of these regularly — but constantly relearns where things are, what the right flag is, or how to phrase a YAML step. GitSpeak collapses all of this into one conversation.

---

## 2. Core Thesis: What "New Way to Use Git" Means

This section defines the philosophy that every feature decision must align with.

### 2.1 Git was designed for a world without AI

Git's interface — staging, committing, branching, rebasing, pushing — was designed in 2005 for command-line use by people who think in terms of trees, diffs, and pointers. This is powerful but unintuitive. Most developers use a small, repetitive subset of commands and constantly Google the rest.

### 2.2 GitHub's UI is a filing cabinet, not an assistant

GitHub.com organizes information the way a database organizes tables — repos, issues, PRs, actions, settings, all in separate views. A developer's actual mental model is task-based: *"I want to ship this feature"* — not *"I want to navigate to Settings > Branches > Protection Rules."*

### 2.3 The new paradigm: intent-first, not navigation-first

GitSpeak inverts the model. The developer states **intent** — what they want to be true about their repo — and GitSpeak figures out the sequence of git/GitHub operations to get there, explains what it's doing, and executes it.

```
Old way:  git checkout -b feature/payments
          git add .
          git commit -m "add payment integration"
          git push -u origin feature/payments
          [open github.com] → New Pull Request → select branches → 
          write title → write description → Create

New way:  "Create a PR for my payment integration changes"
```

### 2.4 The three pillars of "new way to use git"

| Pillar | Old way | GitSpeak way |
|---|---|---|
| **Understanding state** | `git status`, `git log`, browsing GitHub tabs | "What's the state of my repo right now?" |
| **Taking action** | Memorize commands/flags, click through UI | Describe the outcome you want |
| **Automation (CI/CD)** | Write and debug YAML | Describe the pipeline in English |

### 2.5 Why this is git-native, not just "GitHub with chat"

GitSpeak operates on two layers simultaneously:
- **Local git layer:** reads/writes to the developer's local repository (via a lightweight local agent or CLI companion) for staging, committing, branching, merging
- **GitHub remote layer:** via GitHub API for PRs, issues, Actions, releases

This dual-layer approach is what makes it "a new way to use git" rather than just a nicer GitHub dashboard — it touches the actual git workflow, not just the hosted platform.

---

## 3. Problem Statement

### The friction points (concrete, git-specific)

1. **Command amnesia** — Developers forget exact git syntax constantly: `git reset --soft HEAD~1` vs `--hard`, `git rebase -i`, `git cherry-pick`, stash operations. This causes Stack Overflow visits multiple times per week even for experienced devs.

2. **Context-switching tax** — To go from "I finished this feature" to "it's in production" requires: terminal (commit, push) → browser (open PR, fill description, request review, wait for CI, merge) → potentially another tool (trigger deploy). Each switch costs focus.

3. **YAML is a second language** — GitHub Actions requires learning YAML syntax, action names, versions, and trigger conditions — a separate skill from writing application code. 68% of developers report avoiding or copy-pasting Actions configs rather than writing from scratch.

4. **State opacity** — "What's actually going on with my repo right now?" requires checking: local git status, remote branch status, open PRs, CI status, recent issues — five different views to answer one question.

5. **Destructive operation anxiety** — Force pushes, rebases, hard resets, branch deletions are all things developers fear because the consequences are hard to preview and undo. This causes over-caution (never cleaning up branches) or under-caution (data loss).

### Why this matters for a solo developer specifically (not teams)

A solo developer is the **sole bottleneck** for every git/GitHub operation on their project. There's no one to ask "how do I do X again?" — they either remember, search, or get stuck. GitSpeak being a single-player tool means **100% of the friction reduction is felt by the one person using it** — there's no diluted team benefit, it's direct and immediate.

---

## 4. Target User

### Primary: The Solo Developer / Indie Hacker

**Profile:** Builds and ships their own projects. Owns the entire git/GitHub workflow — no one else to delegate to. Values speed and frictionless tooling. Already pays for developer tools (Vercel, OpenRouter AI, GitHub Copilot, etc.)

**Current workflow pain:**
- Switches between terminal, GitHub.com, and sometimes a GUI git client (GitHub Desktop, Sourcetree, lazygit)
- Re-Googles git commands they "should know by now"
- Avoids writing GitHub Actions from scratch — copies from old projects or tutorials
- Loses track of which branches are stale, which PRs need attention

**What "new way to use git" means for them:**
Replace 3 tools (terminal git, GitHub.com, GUI git client) with one conversational interface that does everything those three did, faster.

**Willingness to pay:** $8–15/month — comparable to GitHub Copilot pricing, which this audience already accepts as normal spend.

---

### Secondary: The Learning Developer

**Profile:** Junior developers, students, bootcamp grads who find git's mental model genuinely difficult. They know *what* they want to happen but not the git incantation to make it happen.

**Current workflow pain:**
- Afraid of git — avoid branching, rebasing, anything beyond add/commit/push
- GitHub's UI for PRs and Actions is overwhelming
- Make mistakes (force push to main, lose commits) due to unfamiliarity

**What "new way to use git" means for them:**
GitSpeak becomes a **safe, explainable interface** to git — it not only does the action but explains what it did in git terms, gradually building their understanding. Every destructive action gets a plain-English preview before execution.

**Willingness to pay:** Free tier primarily; converts to paid as they become professional developers.

---

## 5. Product Overview

### What GitSpeak Is

A desktop-companion web app + lightweight local CLI agent that together provide a single conversational interface for:

1. **Local git operations** — staging, committing, branching, merging, rebasing, stashing — all via natural language, executed on the developer's actual local repository
2. **GitHub remote operations** — PRs, issues, releases, branch protection — via GitHub API
3. **GitHub Actions / CI-CD** — describing pipelines in English, generating and managing YAML
4. **Repo state intelligence** — answering "what's going on with my repo" questions instantly

### How it works (high level)

```
┌─────────────────────────────────────┐
│         GitSpeak Web App              │
│   (conversational UI + dashboard)     │
└──────────────┬────────────────────────┘
               │
       ┌───────┴────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────────┐
│ GitSpeak     │   │   GitHub API      │
│ Local Agent  │   │ (PRs, Issues,     │
│ (CLI, runs   │   │  Actions, repo    │
│  on your     │   │  metadata)        │
│  machine)    │   │                   │
│              │   │                   │
│ Executes git │   │                   │
│ commands     │   │                   │
│ locally      │   │                   │
└──────────────┘   └──────────────────┘
```

The **local agent** is the key architectural difference from v1. It's a small CLI tool (`gitspeak-agent`) that runs in the background on the developer's machine, with access to their local git repositories. The web app sends parsed intents to the agent (via a secure local WebSocket), which executes actual `git` commands and returns results.

This is what makes GitSpeak **git-native** rather than **GitHub-native-only** — it can do things github.com fundamentally cannot, like local commits, stashing, interactive rebase, and branch cleanup.

### What GitSpeak Is Not

- Not a hosted git server (GitHub remains the remote)
- Not a code editor
- Not a team tool (v2 focus is explicitly single-player)
- Not a generic chatbot — every response maps to a real git/GitHub operation

---

## 6. Core Features — Detailed Spec

---

### Feature 1: Conversational Command Interface (Core)

**Priority:** P0

**Description:** The single entry point to GitSpeak. A persistent command bar where the developer types intent in plain English. GitSpeak classifies the intent, determines whether it's a **local git operation**, **GitHub API operation**, or **both**, executes accordingly, and responds in natural language.

**Examples spanning local + remote:**

```
"Commit my changes with a message about the new login flow"
  → local: git add -A && git commit -m "..."

"Create a PR for this branch"
  → local: git push -u origin <branch>
  → remote: POST /repos/.../pulls

"Undo my last commit but keep the changes"
  → local: git reset --soft HEAD~1

"Clean up branches that have already been merged"
  → local: git branch --merged | filter | git branch -d
  → remote: check if merged via GitHub API too

"Show me what changed in the last 3 commits"
  → local: git log -p -3 (summarized by OpenRouter AI)
```

**Processing pipeline:**
```
User Input
    ↓
Intent Classification (OpenRouter API)
    ↓
Route Decision: [local-only | remote-only | both | sequential]
    ↓
┌─────────────────┐         ┌──────────────────┐
│ Local Agent      │         │ GitHub API        │
│ (git commands)   │         │ (REST/GraphQL)    │
└────────┬─────────┘         └────────┬──────────┘
         └───────────┬───────────────┘
                      ↓
         Result aggregation + NL response
                      ↓
         Action confirmation buttons
```

**Safety rule for destructive operations:**
Any command that can cause data loss (`reset --hard`, `push --force`, `branch -D`, `clean -fd`, rebase) triggers a **preview-first flow**:
1. GitSpeak shows exactly what will change (diff, list of commits that would be lost, etc.)
2. Requires explicit "Yes, do it" confirmation
3. Offers to create a backup branch/tag automatically before executing

---

### Feature 2: Local Git Agent

**Priority:** P0 — this is the architectural core that makes GitSpeak "git-native"

**Description:** A lightweight CLI tool installed once (`npm install -g gitspeak-agent` or a single binary). Runs as a background process. Maintains a secure local WebSocket connection to the GitSpeak web app. Has read/write access only to git repositories the user explicitly registers.

**Capabilities:**
- Execute any git command (status, add, commit, branch, checkout, merge, rebase, stash, log, diff, reset, cherry-pick, tag)
- Read working directory file state (for context — e.g., "what files have I changed?")
- Stream real-time output back to the web UI (e.g., live merge conflict resolution)
- Operate fully offline for local-only commands (no internet required for `git status`, `git commit`, etc.)

**Security model:**
- Agent only operates on repos the user explicitly adds via `gitspeak-agent register <path>`
- No remote network access from the agent itself except to localhost (web app) and the system's existing git remotes
- All commands logged locally in an audit file the user can inspect
- Web app never receives raw file contents unless explicitly requested (e.g., for diff summaries)

**Installation flow:**
```
1. User signs up on gitspeak.dev
2. Prompted: "Install the local agent to enable git operations"
3. Copy-paste install command (npm/brew/curl)
4. Agent starts, generates pairing code
5. User enters pairing code on web app
6. Agent ↔ Web app connected (persistent local WebSocket)
7. User registers their first repo: gitspeak-agent register ~/projects/my-app
8. Repo appears in GitSpeak dashboard
```

---

### Feature 3: Repo State Dashboard

**Priority:** P0

**Description:** A single screen that answers "what's the state of this repo right now?" — combining local git state and GitHub remote state. This replaces `git status` + `git log` + browsing github.com tabs.

**Sections:**

**Local State (from agent):**
- Current branch + tracking status (ahead/behind remote)
- Uncommitted changes (staged/unstaged file count)
- Stash list
- Local branches with last commit date
- Last 10 local commits

**Remote State (from GitHub API):**
- Open PRs for this repo (with CI status)
- Open issues
- Latest Actions runs + status
- Releases / tags

**Unified view example:**
```
┌─────────────────────────────────────────┐
│  my-app  •  branch: feature/payments     │
│  ↑ 2 commits ahead of origin             │
│  📝 3 files changed (uncommitted)         │
├─────────────────────────────────────────┤
│  Recent commits:                          │
│  • a1b2c3 Add Stripe webhook handler      │
│  • d4e5f6 Update payment schema           │
├─────────────────────────────────────────┤
│  GitHub:                                  │
│  • PR #12 (this branch) — CI: ✅ passing  │
│  • 2 open issues tagged "bug"             │
│  • Last deploy: 2 hours ago ✅            │
└─────────────────────────────────────────┘
```

---

### Feature 4: Natural Language Git Operations

**Priority:** P0

**Description:** The complete set of local git operations expressible in plain English. This is the direct "new way to use git CLI" feature.

**Categories:**

**Staging & Committing:**
- "Commit everything with message X"
- "Commit only the files in src/auth"
- "Undo my last commit but keep changes" (soft reset)
- "Completely discard my last commit" (hard reset, with preview + confirmation)
- "Show me what I'm about to commit"

**Branching:**
- "Create a new branch for [feature] off main"
- "Switch to [branch]"
- "Delete branches that have already been merged"
- "Rename this branch to [name]"
- "What branches haven't been touched in 2 weeks?"

**History & Inspection:**
- "What changed in the last commit?"
- "Show me the history of this file"
- "Who last touched this function?" (git blame, summarized)
- "Find the commit where [bug] was introduced" (bisect assistance)

**Merging & Rebasing:**
- "Merge main into my branch"
- "Rebase my branch onto main" (with conflict walkthrough if needed)
- "Squash my last 4 commits into one"
- "Cherry-pick that fix from main into my branch"

**Stashing:**
- "Save my changes for later, I need to switch branches"
- "Bring back my stashed changes"
- "What's in my stash?"

**Undo / Recovery:**
- "I made a mistake, can you undo that?" (context-aware — looks at reflog)
- "Recover the branch I just deleted"
- "Go back to how things were before my last rebase"

---

### Feature 5: Natural Language PRs & Issues (GitHub Layer)

**Priority:** P0

**Description:** Create, manage, and understand PRs and issues without visiting github.com.

**Commands:**
- "Push this branch and open a PR" — pushes local branch, creates PR via API, auto-generates title/description from commit messages
- "Summarise this PR" — fetches diff, OpenRouter AI generates plain-English summary
- "What's the CI status on my PR?"
- "Merge my PR if CI passes" — polls CI status, merges automatically when green
- "Create an issue: [description]"
- "What issues are assigned to me?"
- "Close issue #X, it's fixed in my last commit" — closes issue + links commit

**PR description auto-generation:**
When creating a PR, GitSpeak reads the commit messages and diff on the branch, and generates:
- Title (concise, conventional-commit style if the repo uses that convention)
- Description: what changed, why (inferred from commit messages), how to test
- Suggested labels based on file paths changed (e.g., changes to `/docs` → "documentation" label)

---

### Feature 6: GitHub Actions Without YAML

**Priority:** P0

**Description:** Full CI/CD pipeline management through natural language — the most differentiated feature for solo developers who avoid writing Actions YAML.

**Commands:**

- "Set up CI that runs my tests on every push"
  → OpenRouter AI generates appropriate YAML based on detected language/framework (reads `package.json`, `requirements.txt`, etc. via local agent)
  → Shows preview → commits `.github/workflows/ci.yml`

- "Add a step that deploys to Vercel after tests pass"
  → Modifies existing YAML, adds deploy job with proper `needs:` dependency

- "Run the deploy workflow now"
  → Triggers `workflow_dispatch`

- "What's my CI doing right now?"
  → Real-time status of running workflows

- "Why did my last build fail?"
  → Fetches failed job logs, OpenRouter AI explains the failure in plain English with suggested fix

- "Explain my CI pipeline to me"
  → Reads existing YAML files, OpenRouter AI explains step-by-step what happens on push/PR

**YAML generation principles:**
- Detect project type automatically (Node, Python, Go, Rust, etc.) via local agent reading repo files
- Use current, non-deprecated action versions
- Never hardcode secrets — always reference `${{ secrets.NAME }}` and tell user which secrets need to be added in GitHub settings
- Generated YAML is always shown in a preview (Monaco editor) before committing — user can edit before confirming

---

### Feature 7: Repo Intelligence (Single-Repo Focus)

**Priority:** P1

**Description:** Answers questions about a single repo's history, structure, and current state — scoped to "your project," not team analytics.

**Commands:**
- "What's this project's tech stack?" — reads package files, summarizes
- "How do I run this project locally?" — reads README + config files, generates setup steps
- "What's the most frequently changed file?" — code churn analysis
- "Is this branch safe to delete?" — checks if merged, checks for unpushed commits
- "What's changed since I last worked on this?" — diff between last local activity and current HEAD
- "Summarize what I did this week" — git log filtered by date/author, OpenRouter AI summary

---

### Feature 8: Visual Diff & History Explorer

**Priority:** P1

**Description:** A visual, navigable commit graph and diff viewer — replacing `git log --graph` and GitHub's commit history page with something more legible.

**Capabilities:**
- Interactive commit graph (branches, merges visualized)
- Click any commit → see diff with syntax highlighting
- "Show me how this file evolved over time" — file history view
- Side-by-side diff for any two commits/branches via natural language: "What's different between my branch and main?"

---

### Feature 9: CLI Mode

**Priority:** P2 (month 2–3)

**Description:** For developers who prefer staying in the terminal, the same NLP capabilities available via `gitspeak` CLI command (separate from the always-running agent).

```bash
gitspeak "commit my changes and push"
gitspeak "what's the status of my PR?"
gitspeak "set up CI for this project"
```

Output is plain text/colored terminal output rather than the web UI — same backend, different presentation layer.

---

## 7. The Replacement Map — GitHub UI → GitSpeak

This table explicitly maps every common github.com / git CLI task to its GitSpeak equivalent, demonstrating the "new way to use git" positioning concretely.

| Task | Old way (clicks/commands) | GitSpeak way |
|---|---|---|
| Check what's changed | `git status` + `git diff` | "What have I changed?" |
| Commit | `git add -A && git commit -m "..."` | "Commit this as [description]" |
| New branch | `git checkout -b name` | "Start a new branch for [feature]" |
| Open a PR | push → github.com → New PR → fill form | "Open a PR for this" |
| Check CI status | github.com → Actions tab → find run | "Is my build passing?" |
| Merge PR | github.com → PR page → Merge button | "Merge my PR" |
| Set up CI | Write YAML from scratch/template | "Set up CI for [language]" |
| Trigger deploy | github.com → Actions → Run workflow | "Deploy to production" |
| Clean old branches | `git branch -d` × N, manually identify | "Clean up merged branches" |
| Undo a commit | Remember reset flags | "Undo my last commit" |
| Resolve "what changed in v1.2" | `git log v1.1..v1.2` + read | "What changed since v1.1?" |
| Debug failed build | github.com → Actions → click run → read logs | "Why did my build fail?" |
| Stash work to switch tasks | `git stash` / `git stash pop` | "Save this for later" / "Bring back my changes" |

---

## 8. User Flows

### Flow 1: First-Time Setup (Target: < 5 minutes)

```
1. Sign up at gitspeak.dev (GitHub OAuth — for remote operations)
2. Prompted to install local agent (one command, copy-pasted)
3. Agent installs, generates 6-digit pairing code
4. Enter pairing code in web app → agent connected
5. Run: gitspeak-agent register ~/projects/my-app
6. Repo appears in dashboard with full local + remote state
7. Onboarding prompt: "Try: 'What's the status of this repo?'"
8. First response demonstrates combined local+remote intelligence
   → "Wow" moment: user sees their actual local git state AND
     GitHub PR/CI status in one place, instantly
```

### Flow 2: Daily Workflow — Feature to Production

```
Morning:
  "What's the status of my repo?"
  → GitSpeak: "You're on main, up to date. No uncommitted changes.
     1 open PR (#12, payments) — CI passing, ready to merge."

  "Merge PR 12"
  → GitSpeak merges via API
  → "✅ Merged. Want me to pull the latest main locally?"

  "Yes, and create a branch for the next feature - user settings page"
  → git pull (local agent)
  → git checkout -b feature/user-settings (local agent)
  → "✅ You're now on feature/user-settings, up to date with main."

[... developer writes code ...]

  "Commit this as: add user settings form"
  → git add -A && git commit -m "add user settings form" (local agent)

  "Push and open a PR"
  → git push -u origin feature/user-settings (local agent)
  → POST /pulls (GitHub API) with auto-generated description
  → "✅ PR #13 created: 'Add user settings form'.
     CI is running — I'll let you know when it's done."

[CI completes in background, agent receives webhook]

  → Push notification: "✅ CI passed on PR #13. Ready to merge whenever you are."
```

### Flow 3: "Oh no" Recovery Flow

```
Developer: "I think I just messed up my rebase"

GitSpeak: "Let me check your reflog... 
  Before the rebase, your branch 'feature/auth' was at commit a1b2c3.
  Your rebase is currently in progress with 2 conflicts in:
    - src/auth/login.js
    - src/auth/middleware.js
  
  Options:
    [Abort rebase — back to a1b2c3]
    [Show me the conflicts]
    [Continue resolving]"

Developer: "Abort it"

GitSpeak: git rebase --abort (local agent)
  → "✅ Rebase aborted. You're back to commit a1b2c3, exactly where 
     you were before. Nothing was lost."
```

### Flow 4: Setting Up CI From Scratch

```
Developer: "Set up CI for this project"

GitSpeak (local agent reads repo): "I see this is a Node.js project using 
  npm, with a 'test' script in package.json. Here's what I'll set up:

  - Trigger: on every push and PR to main
  - Steps: checkout → setup Node 20 → npm install → npm test

  [Show YAML preview] [Looks good, create it] [Modify first]"

Developer: "Looks good, create it"

GitSpeak: 
  → Writes .github/workflows/ci.yml (local agent, file write)
  → git add, commit, push (local agent)
  → "✅ CI workflow created and pushed. It'll run on your next push.
     Want me to trigger it now on the current branch to test it?"
```

---

## 9. Technical Architecture

### System Overview

```
┌──────────────────────────────────────────────┐
│              GitSpeak Web App                  │
│         Next.js 14 + TailwindCSS               │
│      Conversational UI + Repo Dashboard         │
└───────────┬──────────────────────┬─────────────┘
            │                      │
   Local WebSocket          HTTPS (GitHub API)
            │                      │
            ▼                      ▼
┌────────────────────┐    ┌──────────────────────┐
│ GitSpeak Local      │    │   Backend Server      │
│ Agent (Node.js CLI) │    │   Node.js + Express   │
│                     │    │                        │
│ - Runs git commands │    │  - OpenRouter API calls    │
│ - File system read  │    │  - GitHub API proxy    │
│ - Watches repo state│    │  - Webhook receiver    │
│ - Local-only, no    │    │  - User/session mgmt   │
│   cloud git access  │    │                        │
└─────────────────────┘    └──────────┬─────────────┘
                                       │
                          ┌────────────┼────────────┐
                          ▼            ▼            ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │ MongoDB  │ │OpenRouter API│ │GitHub API│
                    │(metadata,│ │(NLP, gen)│ │(remote   │
                    │ history) │ │          │ │ ops)     │
                    └──────────┘ └──────────┘ └──────────┘
```

### Why a local agent (vs. pure web app)

| Without local agent | With local agent |
|---|---|
| Can only act on GitHub's hosted state | Can act on local working directory state |
| Can't see uncommitted changes | Sees uncommitted changes, stashes, local branches |
| Can't run `git commit`, `rebase`, `stash` | Full git CLI capability |
| "GitHub dashboard with chat" | "New way to use git itself" |

This is the architectural decision that justifies the "new way to use git" positioning — without it, GitSpeak would just be a nicer GitHub.com.

### Frontend Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Web app framework |
| TailwindCSS | Styling |
| Radix UI | Accessible component primitives |
| React Query | GitHub API data caching |
| Socket.IO client | Real-time agent communication + CI status |
| Monaco Editor | YAML preview, diff viewer |
| Framer Motion | Smooth conversational UI transitions |

### Local Agent Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime (cross-platform: Mac/Linux/Windows) |
| `simple-git` or direct `child_process` + git CLI | Execute git operations |
| `chokidar` | Watch repo for file changes (for live status) |
| `ws` (WebSocket) | Persistent connection to web app |
| `commander` | CLI command parsing (for CLI mode) |

### Backend Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| Socket.IO | Real-time relay between agent ↔ web app |
| MongoDB + Mongoose | User data, repo metadata, command history |
| Passport.js + GitHub OAuth | Authentication |
| OpenRouter API (openrouter-llm) | Intent classification, NLP, YAML generation, summaries |

---

## 10. GitHub API Integration Map

Scoped strictly to single-repo, single-user operations (no org/team endpoints).

### Authentication
- `GET /user` — authenticated user info
- `GET /user/repos` — list user's repos for selection

### Repository
- `GET /repos/{owner}/{repo}` — metadata
- `GET /repos/{owner}/{repo}/branches` — branch list (cross-referenced with local branches)
- `GET /repos/{owner}/{repo}/commits` — remote commit history
- `GET /repos/{owner}/{repo}/contents/{path}` — read files (package.json, YAML, README) for context

### Pull Requests
- `GET /repos/{owner}/{repo}/pulls`
- `POST /repos/{owner}/{repo}/pulls` — create PR (after local push)
- `GET /repos/{owner}/{repo}/pulls/{number}/files` — for AI summary
- `PUT /repos/{owner}/{repo}/pulls/{number}/merge`

### Issues
- `GET /repos/{owner}/{repo}/issues`
- `POST /repos/{owner}/{repo}/issues`
- `PATCH /repos/{owner}/{repo}/issues/{number}`

### GitHub Actions
- `GET /repos/{owner}/{repo}/actions/workflows`
- `POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches`
- `GET /repos/{owner}/{repo}/actions/runs`
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`
- `PUT /repos/{owner}/{repo}/contents/{path}` — commit generated YAML (alternative: done via local agent + push)

### Webhooks (incoming, per registered repo)
- `push`
- `pull_request`
- `workflow_run`
- `status` (CI status changes)

### Local Agent → Git Operations (no API, direct CLI)
```
git status, git diff, git add, git commit, git branch, git checkout,
git merge, git rebase, git stash, git log, git reset, git cherry-pick,
git tag, git reflog, git push, git pull, git fetch
```

---

## 11. Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String,
  githubId: String,
  githubLogin: String,
  githubAccessToken: String,    // encrypted, scopes: repo, workflow
  plan: Enum ['free', 'pro'],
  stripeCustomerId: String,
  agentPairingCode: String,     // temporary, used during agent setup
  createdAt: Date
}
```

### RegisteredRepo
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  localPath: String,             // path on user's machine (reported by agent)
  githubFullName: String,        // 'owner/repo' — null if no remote configured
  defaultBranch: String,
  lastSyncedAt: Date,
  detectedStack: {
    language: String,            // 'javascript', 'python', etc.
    packageManager: String,      // 'npm', 'pip', 'cargo'
    testCommand: String,         // detected from package.json etc.
    hasCI: Boolean
  },
  webhookId: Number              // null until GitHub remote PR/Actions features used
}
```

### CommandHistory
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  repoId: ObjectId,
  input: String,
  intent: String,
  executionPlan: [{
    type: Enum ['local_git', 'github_api', 'file_write'],
    command: String,             // e.g., 'git commit -m "..."' or 'POST /pulls'
    result: String,
    success: Boolean
  }],
  response: String,
  createdAt: Date
}
```

### AgentSession
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  agentVersion: String,
  os: String,
  connectedAt: Date,
  lastPingAt: Date,
  status: Enum ['connected', 'disconnected']
}
```

---

## 12. UI/UX Design Principles

### 1. The command bar is the product
Unlike v1, there is no separate "dashboard mode" vs "chat mode" — the command bar is persistent and primary on every screen. The dashboard is *context* for the conversation, not a separate destination.

### 2. Local-first feel, even though it's a web app
Responses for local git operations (status, commit, branch) should feel instant — under 200ms — because they don't require network round trips beyond the local agent. This reinforces "this is how git should feel."

### 3. Show the git, don't hide it
For learning developers especially, every action should optionally reveal "here's the actual git command I ran" — building understanding rather than creating a black box.

```
GitSpeak: "✅ Committed your changes."
          [▾ Show git command]
              git add -A
              git commit -m "add user settings form"
```

### 4. Destructive = visual preview, always
Any operation that rewrites history or deletes data shows a **before/after diagram** of the commit graph — not just text — so the consequence is immediately visual.

### 5. Dark mode, monospace-friendly, git-graph aesthetic
Visual language borrows from git graph visualizers (like `git log --graph`, GitKraken, Sourcetree) — branches as colored lines, commits as nodes — but rendered cleanly and minimally.

**Colour Palette:**
```
Background:     #0D1117
Surface:        #161B22
Border:         #30363D
Text primary:   #E6EDF3
Text secondary: #8B949E
Branch colors:  #58A6FF, #3FB950, #D29922, #BC8CFF, #F778BA (rotating per branch)
Success:        #3FB950
Error/destructive: #F85149
Warning:        #D29922
```

---

## 13. Monetisation Strategy

### Pricing — simplified for solo focus

**Free**
- 1 registered repo
- 30 NLP commands/month
- Local git operations (status, commit, branch — unlimited, since these are "free" computationally)
- Basic repo dashboard

**Pro — $9/month**
- Unlimited repos
- Unlimited NLP commands
- GitHub Actions / CI-CD generation and control
- PR/issue management via NLP
- Visual diff & history explorer
- Priority OpenRouter API processing

**Pro Annual — $79/year** (≈ $6.60/month, ~27% discount)

No team tier in this version — explicitly single-player, priced like a personal productivity tool (comparable to GitHub Copilot Individual at $10/month).

### Why local git operations are free/unlimited

Local git commands (status, commit, branch, log) don't require OpenRouter API calls for execution — only for the NLP parsing layer, which is cheap (~$0.001/command). Making these unlimited even on free tier removes friction from daily use and makes the agent indispensable, driving the upgrade decision toward GitHub-layer features (PRs, Actions, CI).

### Revenue Projection (Year 1, solo-focus)

| Month | Free Users | Pro Users | MRR |
|---|---|---|---|
| 1–2 | 300 | 15 | $135 |
| 3–4 | 1,200 | 90 | $810 |
| 5–6 | 3,500 | 280 | $2,520 |
| 7–9 | 8,000 | 700 | $6,300 |
| 10–12 | 18,000 | 1,800 | $16,200 |

**Year 1 ARR Target:** ~$100,000 (intentionally conservative for solo-focused tool — expansion to team tier in Year 2 is the real growth lever, but out of scope for this PRD)

---

## 14. Go-to-Market Strategy

### Core message: "A new way to use git"

Every piece of marketing should reinforce that this is not "GitHub but with AI chat" — it's a fundamentally different daily workflow.

### Phase 1: Developer tools community (Month 1–2)

- **Show HN**: "I rebuilt my git workflow around plain English — local agent + GitHub API + OpenRouter AI" — emphasize the local agent as the technical differentiator (HN audience respects "this actually touches your filesystem" over "this is a GitHub wrapper")
- **Demo video (60 sec)**: Split screen — left side shows old workflow (terminal + browser tabs), right side shows the same outcome via one sentence in GitSpeak. Time both.
- **r/git, r/programming, r/commandline**: communities specifically interested in git workflow improvements (not just "GitHub tools")
- **Twitter/X**: target the "build in public" and terminal/CLI tool enthusiast community — `lazygit`, `tig`, and similar tool users are a strong early-adopter signal

### Phase 2: "Git command translator" SEO play (Month 2–3)

Many developers search "[git command] explained" or "how to [git task]." Create content:
- "How to undo a git commit (3 ways, explained)"
- "Git rebase vs merge — what's the difference and when to use each"
- Each piece ends with: "Or just tell GitSpeak what you want — try it free"

### Phase 3: VS Code / terminal integration (Month 3–4)

- VS Code extension that surfaces GitSpeak's command bar inside the editor (huge distribution — VS Code marketplace)
- Terminal integration so `gitspeak` feels like a natural extension of existing CLI muscle memory

---

## 15. Build Roadmap

### Week 1–2: Local Agent + Core Git NLP

| Task | Est. Time |
|---|---|
| Build local agent CLI (Node.js, git command execution wrapper) | 2 days |
| Agent ↔ web app pairing & WebSocket connection | 1 day |
| Web app shell (Next.js, command bar UI) | 1.5 days |
| OpenRouter AI intent classification for local git commands | 1.5 days |
| Implement core local commands: status, commit, branch, log, diff | 2 days |
| **Milestone: "What's my repo status?" + "Commit this" working end-to-end** | **~8 days** |

### Week 3–4: GitHub Layer (PRs, Issues)

| Task | Est. Time |
|---|---|
| GitHub OAuth + repo connection | 1 day |
| PR creation flow (push via agent + create PR via API) | 1.5 days |
| PR summary generation (OpenRouter AI) | 1 day |
| Issue commands (create, list, close) | 1 day |
| Merge/CI-status-aware merge command | 1.5 days |
| **Milestone: Full feature → PR → merge loop via NLP** | **~6 days** |

### Week 5–6: GitHub Actions Without YAML

| Task | Est. Time |
|---|---|
| Repo stack detection (local agent reads package.json etc.) | 1 day |
| YAML generation from description (OpenRouter AI) | 2 days |
| YAML preview + commit via agent | 1 day |
| Workflow trigger + real-time status (Socket.IO) | 1.5 days |
| "Why did my build fail" log analysis | 1.5 days |
| **Milestone: "Set up CI" → working pipeline, no manual YAML** | **~7 days** |

### Week 7: Advanced Git Operations + Safety

| Task | Est. Time |
|---|---|
| Rebase, merge, stash, cherry-pick NLP commands | 2 days |
| Destructive operation preview UI (commit graph diagrams) | 2 days |
| Reflog-based recovery ("undo my mistake") | 1.5 days |
| **Milestone: Safe handling of advanced/destructive git ops** | **~5.5 days** |

### Week 8: Polish, Monetisation, Launch

| Task | Est. Time |
|---|---|
| Visual diff & commit graph explorer | 1.5 days |
| Stripe integration (Free/Pro) | 1 day |
| Onboarding flow polish | 1 day |
| Landing page + demo video | 1.5 days |
| Show HN / Product Hunt launch prep | 1 day |
| **Milestone: Public launch** | **~6 days** |

---

## 16. Success Metrics

### North Star Metric
**Daily commands per active user** — directly measures whether GitSpeak has become the primary git interface (vs. an occasional novelty).

**Target:** 8+ commands/day per weekly-active user by Month 3 (roughly matching natural git command frequency for an active developer)

### Key Metrics

| Metric | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| Signups | 400 | 2,000 | 8,000 |
| Agent installs (activation) | 250 (62%) | 1,500 (75%) | 6,500 (81%) |
| Weekly Active Users | 80 | 700 | 3,200 |
| Pro conversions | 15 | 90 | 600 |
| MRR | $135 | $810 | $5,400 |

### Critical activation metric: Agent install rate

Because the local agent is what makes this "a new way to use git" (vs. a GitHub dashboard), the percentage of signups who successfully install and connect the agent is the single most important early metric. Low agent adoption = product is being used as "GitHub viewer," not "git replacement" — signals positioning failure.

**Target agent install rate:** > 70% of signups within 24 hours

### Command category distribution (health signal)

A healthy product shows usage across all three layers:
- Local git operations: ~50% of commands
- GitHub PR/Issue operations: ~30% of commands
- Actions/CI operations: ~20% of commands

If local git operations are < 20% of usage, the product is being used as a GitHub tool only — indicates the local agent value isn't landing.

---

## 17. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Local agent install friction kills activation | High | Critical | Make install a single copy-paste command; support npm/brew/direct binary; show clear value before requiring install (e.g., demo mode with sample repo) |
| Users don't trust an agent running git commands on their machine | Medium | High | Open-source the local agent (builds trust — code is auditable); local audit log of every command run; "dry run" mode that shows commands without executing |
| Destructive operation causes data loss | Low (with safeguards) | Very High | Mandatory preview + confirmation for all destructive ops; automatic backup branch/tag creation before risky operations; reflog-based undo always available |
| OpenRouter AI misclassifies intent for ambiguous commands | Medium | Medium | Always show "Here's what I'm about to do" for non-trivial operations before executing; easy correction flow ("No, I meant...") |
| GitHub API rate limits for active users | Low | Medium | Cache repo metadata aggressively; use webhooks instead of polling for CI status |
| Competing with free, well-known tools (lazygit, GitHub Desktop) | Medium | Medium | These tools are command/UI-based, not conversational — differentiate clearly on the NLP layer and CI/Actions generation, which neither offers |

---

## 18. Out of Scope

Explicitly excluded from this version to maintain the "new way to use git, solo-first" focus:

- Team workspaces, member invites, shared repos
- Slack/Discord integration
- Real-time multiplayer features
- Project management / kanban / sprints
- Code editing (use your existing editor)
- Mobile app
- Org-level GitHub features (org settings, team permissions)
- Weekly digest emails (team-oriented feature, removed)
- Non-GitHub remotes (GitLab, Bitbucket) — GitHub only
- AI code review / PR review assistant — deferred (it's valuable but is a "team quality" feature, not core to "new way to use git" for solo use; revisit in v3)

---

## 19. Appendix — Full NLP Command Library

### Local Git — Status & Inspection
- "What's the status of this repo?"
- "What have I changed?"
- "Show me the diff"
- "What's in my staging area?"
- "Show me the last [N] commits"
- "What changed in the last commit?"
- "Who last touched this file?"
- "Show me the commit history for [file]"
- "What's changed since [date/commit/tag]?"
- "Am I ahead or behind the remote?"

### Local Git — Committing
- "Commit everything with message [X]"
- "Commit only [files/folder]"
- "Amend my last commit message to [X]"
- "Undo my last commit but keep the changes"
- "Completely remove my last commit" (hard reset, with preview)
- "Show me what I'm about to commit"

### Local Git — Branching
- "Create a branch for [feature] off [base]"
- "Switch to [branch]"
- "Rename this branch to [name]"
- "Delete the [branch] branch"
- "Clean up branches that have been merged"
- "What branches haven't been touched recently?"
- "Compare this branch to main"

### Local Git — Merging, Rebasing, History Editing
- "Merge [branch] into this branch"
- "Rebase this branch onto main"
- "Squash my last [N] commits"
- "Cherry-pick commit [hash] from [branch]"
- "Resolve this conflict for me" (with explanation of both sides)
- "Continue the rebase"
- "Abort the rebase"

### Local Git — Stashing & Undo
- "Save my changes for later"
- "Bring back my stashed changes"
- "What's in my stash?"
- "Undo my last action"
- "Recover the branch I just deleted"
- "Go back to before my rebase"

### GitHub — Pull Requests
- "Push and open a PR"
- "Summarise this PR"
- "What's the CI status on my PR?"
- "Merge my PR if CI passes"
- "Update the PR description"
- "Close this PR without merging"
- "What PRs do I have open?"

### GitHub — Issuess
- "Create an issue: [description]"
- "What issues are assigned to me?"
- "Close issue #[N], fixed in this commit"
- "List open bugs"

### GitHub Actions — CI/CD
- "Set up CI for this project"
- "Add a deploy step after tests pass"
- "Run the [workflow] now"
- "What's my CI doing right now?"
- "Why did my last build fail?"
- "Explain my CI pipeline"
- "Add a step that [does X]"
- "Remove the [step] step from CI"

### Repo Intelligence
- "What's this project's tech stack?"
- "How do I run this locally?"
- "What's the most-changed file in this project?"
- "Is this branch safe to delete?"
- "What did I work on this week?"
- "What's changed since I last worked on this?"

---

*Document ends. Version 2.0 — June 2026*

*Core positioning: GitSpeak is a new way to use git — a conversational, local-agent-powered replacement for the git CLI and GitHub UI, built for one developer's daily workflow. No teams, no Slack, no multiplayer. Just a better way to work with your own code.*
