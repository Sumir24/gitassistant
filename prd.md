# GitSpeak — Product Requirements Document
**Version:** 1.0  
**Date:** June 2026  
**Author:** Sumir  
**Status:** Draft → In Development

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Mission](#3-product-vision--mission)
4. [Target Users](#4-target-users)
5. [Market Opportunity](#5-market-opportunity)
6. [Competitive Landscape](#6-competitive-landscape)
7. [Product Overview](#7-product-overview)
8. [Core Features — Detailed Spec](#8-core-features--detailed-spec)
9. [User Flows](#9-user-flows)
10. [Technical Architecture](#10-technical-architecture)
11. [API Integrations](#11-api-integrations)
12. [Data Models](#12-data-models)
13. [UI/UX Design Principles](#13-uiux-design-principles)
14. [Monetisation Strategy](#14-monetisation-strategy)
15. [Go-to-Market Strategy](#15-go-to-market-strategy)
16. [Build Roadmap](#16-build-roadmap)
17. [Success Metrics](#17-success-metrics)
18. [Risks & Mitigations](#18-risks--mitigations)
19. [Out of Scope (V1)](#19-out-of-scope-v1)
20. [Appendix — NLP Command Library](#20-appendix--nlp-command-library)

---

## 1. Executive Summary

GitSpeak is a conversational, AI-native interface for GitHub. Instead of navigating GitHub's complex UI or memorising CLI commands, developers interact with their repositories in plain English. GitSpeak translates natural language into GitHub API calls, Actions workflow triggers, and intelligent repo insights — all wrapped in a fast, beautiful, modern UI.

**One sentence pitch:** GitHub, the way it should have been built if AI existed from day one.

**What makes it different:**
- Not a GitHub plugin. Not a GitHub wrapper. A completely new experience layer built on top of the GitHub API.
- Conversational as the primary interface — not a chatbot bolted onto a dashboard.
- GitHub Actions controllable without writing a single line of YAML.
- Repo intelligence that answers questions GitHub's UI can't — "what broke this week?", "who's blocked?", "summarise this PR."
- Designed for every level — from senior engineers to non-technical founders who touch repos.

**Target:** Indie dev teams (2–15 people), solo developers, non-technical founders with code repos, and student project teams.

---

## 2. Problem Statement

### The Core Pain

GitHub was built for a world before AI. Its interface reflects 18 years of incremental additions — menus stacked on menus, YAML required for automation, and a UI that assumes you already know what you're doing. For the majority of the 100M+ GitHub users, the experience is one of the following:

- **Intimidating:** Junior devs and non-technical founders have repos but can't navigate them confidently.
- **Slow:** Common actions (trigger a deploy, check CI, create an issue) require 4–8 clicks and context-switching between tabs.
- **Manual:** Any automation requires writing and debugging YAML workflows.
- **Opaque:** Understanding the state of a repo — who's working on what, what's blocked, what broke — requires manually reading commits, PRs, and issues scattered across separate tabs.

### The Numbers

- Average developer spends **19 minutes/day** navigating GitHub's UI for non-code tasks (issue creation, PR review navigation, CI monitoring).
- **68% of developers** say they find GitHub Actions YAML intimidating to write from scratch.
- **41% of startup founders** with technical co-founders say they can't independently read or manage their team's GitHub repos.
- GitHub has **100M+ registered users** — the vast majority interact with it less than they could because the friction is too high.

### What Doesn't Exist Yet

There is no tool that:
1. Lets you control GitHub entirely in plain English
2. Gives you a beautiful, fast, opinionated UI alternative to github.com
3. Makes GitHub Actions accessible without YAML knowledge
4. Answers intelligent questions about your repo's health and team activity

---

## 3. Product Vision & Mission

### Vision
A world where any person — regardless of technical background — can fully harness the power of version control, CI/CD, and collaborative coding.

### Mission
To make GitHub accessible, fast, and intelligent for every developer and team — by replacing friction with conversation.

### Core Belief
The best interface to a complex system is not a simplified version of that system's existing UI. It's a completely new paradigm built around how humans naturally communicate.

---

## 4. Target Users

### Primary: Indie Dev Teams (2–10 people)
**Profile:** Building startups, SaaS products, or serious side projects. Using GitHub for version control + some CI/CD. Paying individually for tools. Frustrated by the number of tabs they have to maintain.

**Pain:** Switching between GitHub, Linear, Slack, and their terminal for things that should be one conversation.

**Job to be done:** "Let me understand and control my project's code and deployments without leaving one interface."

**Willingness to pay:** $12–49/month per team. Already paying for Vercel, Railway, Linear, etc.

---

### Secondary: Solo Developers / Indie Hackers
**Profile:** Building alone, shipping fast, doing everything themselves. Want automation without complexity.

**Pain:** Writing GitHub Actions YAML from scratch every time. Forgetting git commands. Needing to open 3 tabs to understand what they last worked on.

**Job to be done:** "Let me just tell it what I want done and have it happen."

**Willingness to pay:** $8–12/month. Already paying for OpenRouter AI, Vercel, etc.

---

### Tertiary: Non-Technical Founders / PMs
**Profile:** Working at a startup with a technical team. Have GitHub access but find it incomprehensible. Want to be able to check in on code progress without asking a developer.

**Pain:** Can't independently check CI status, see what's been merged, or understand what the team shipped last week.

**Job to be done:** "Let me understand what's happening in the codebase without needing a developer to translate it for me."

**Willingness to pay:** Part of team plan. High conversion from free → paid once the "wow" moment hits.

---

### Tertiary: Student Project Teams
**Profile:** University students doing group projects, hackathon participants, bootcamp grads.

**Pain:** One person on the team knows git, everyone else breaks things. GitHub's UI is overwhelming for beginners.

**Job to be done:** "Let me contribute to a shared codebase without fear."

**Willingness to pay:** Free tier. Converts to paid post-graduation.

---

## 5. Market Opportunity

| Segment | Size | Notes |
|---|---|---|
| GitHub registered users | 100M+ | Total addressable user base |
| Active developers globally | 26M | Pays for tools regularly |
| Indie developers & solo founders | ~4M | Primary target, high intent to pay |
| Non-technical startup employees with GitHub | ~8M | Secondary, high WTP for team plans |
| Student developers | ~15M | Free tier, long-term converts |

**TAM:** $12B+ (developer tooling market)  
**SAM:** $2.4B (collaborative dev tools for small teams)  
**SOM (Year 1):** $500K ARR — 1,000 paying teams at ~$42/mo average

---

## 6. Competitive Landscape

| Product | What they do | Why GitSpeak wins |
|---|---|---|
| **GitHub.com** | The native interface | 18 years of legacy UI, can't redesign, no conversational layer |
| **GitHub Copilot** | Code autocomplete in IDE | Only writes code, doesn't control GitHub or explain it |
| **GitHub CLI (gh)** | Terminal commands | Still requires knowing exact commands, no AI, no UI |
| **Gitpod** | Cloud dev environments | Different problem (coding environment vs. repo management) |
| **LinearB / Swarmia** | Engineering analytics | Expensive, enterprise-focused, no NLP interface |
| **Raycast GitHub extension** | Quick launcher | Partial actions only, no conversational intelligence |
| **Copilot Workspace** | AI-assisted coding | Code generation, not repo management or Actions control |

**Conclusion:** No product exists that combines (a) conversational NLP, (b) full GitHub control, (c) beautiful alternative UI, and (d) repo intelligence. This is a genuine white space.

---

## 7. Product Overview

### What GitSpeak Is

GitSpeak is a web application (with a future mobile app) that connects to a user's GitHub account via OAuth and provides:

1. **A conversational interface** — a chat-like panel where users type what they want in plain English and GitSpeak executes it via the GitHub API and OpenRouter AI AI.
2. **A beautiful repo dashboard** — a visual overview of a connected repository: branches, recent commits, open PRs, CI status, contributors, and issues — designed and presented far better than github.com.
3. **Actions control without YAML** — trigger, monitor, and create GitHub Actions workflows through natural language.
4. **Repo intelligence** — AI-generated answers to questions about the repo's health, team activity, and code changes.
5. **Weekly digest emails** — an automated summary of what happened in the repo, sent to all contributors.

### What GitSpeak Is Not

- Not a code editor (use VS Code / Cursor for that)
- Not replacing GitHub (it uses GitHub's API — GitHub is the source of truth)
- Not an analytics dashboard (intelligence is conversational, not chart-driven)
- Not a project management tool (no kanban boards, no sprints)

---

## 8. Core Features — Detailed Spec

---

### Feature 1: GitHub OAuth & Repo Connection

**Priority:** P0 (must ship at launch)

**Description:** Users sign in with their GitHub account. GitSpeak requests the minimum necessary OAuth scopes to read and write to repos, trigger Actions, manage issues and PRs.

**Required OAuth Scopes:**
```
repo                  — Full repo access (read + write)
workflow              — Trigger and manage GitHub Actions
read:user             — Read user profile
user:email            — Read user email
read:org              — Read org membership (for team features)
```

**User Flow:**
1. User visits gitspeak.dev
2. Clicks "Connect GitHub"
3. GitHub OAuth consent screen
4. Redirect back with access token
5. Token stored encrypted in database
6. User selects which repos to connect (multi-select)
7. GitSpeak indexes repo metadata (branches, contributors, recent activity)
8. User lands on repo dashboard

**Acceptance Criteria:**
- OAuth flow completes in < 5 seconds
- Token refresh handled automatically (no re-auth required)
- Users can connect multiple repos
- Users can disconnect a repo at any time
- Tokens stored with AES-256 encryption at rest

---

### Feature 2: Conversational Command Interface

**Priority:** P0 (must ship at launch)

**Description:** The primary interface of GitSpeak. A chat panel where the user types commands in plain English. GitSpeak's NLP layer (OpenRouter API) interprets the intent, maps it to GitHub API actions, executes them, and returns a natural language result with action confirmation buttons.

**Input formats supported:**
- Direct commands: *"Push my local changes to main"*
- Questions: *"What's the status of the CI on the auth branch?"*
- Creation requests: *"Create an issue: the login page breaks on mobile Safari"*
- Complex multi-step: *"Run tests on feature/auth, and if they pass, merge it into main"*

**Command Processing Pipeline:**
```
User Input (plain English)
        ↓
Intent Classification (OpenRouter API)
        ↓
Parameter Extraction (entity recognition)
        ↓
GitHub API Call(s) constructed
        ↓
API executed + response received
        ↓
Response formatted in natural language
        ↓
Action buttons rendered (confirm / alternatives)
        ↓
Result displayed in chat
```

**Response Format:**
Every response includes:
- Plain English summary of what happened
- Structured data where relevant (CI results, PR list, commit log)
- 1–3 suggested next actions as clickable buttons
- Undo option where applicable

**Error Handling:**
- If intent is ambiguous: ask clarifying question ("Did you mean branch X or branch Y?")
- If action fails: explain why in plain English + suggest fix
- If action would be destructive: require explicit confirmation before executing

**Supported command categories at launch:** See Appendix — NLP Command Library

---

### Feature 3: Repo Dashboard

**Priority:** P0 (must ship at launch)

**Description:** A beautiful, information-dense single-screen overview of a connected repo. Replaces the need to visit multiple GitHub pages to understand repo state.

**Dashboard Sections:**

**Header:**
- Repo name + description
- Language breakdown (visual bar)
- Stars / forks / watchers
- Last updated timestamp
- Default branch indicator

**Activity Feed (centre, main column):**
- Last 10 commits with: author avatar, message, branch, time, CI status indicator
- Color-coded: green (CI pass), red (CI fail), grey (no CI)
- Clicking any commit opens a plain-English summary of what changed

**Open PRs Panel:**
- List of open PRs with: title, author, branch, # of review comments, CI status
- AI-generated one-line summary of each PR's purpose
- "Merge", "Review", "Close" action buttons inline

**Issues Panel:**
- Open issues count + recent 5
- Labels shown as colored chips
- AI priority scoring: "3 issues seem urgent based on keywords"

**Contributors Panel:**
- Avatars of all contributors
- Commit count per contributor this month
- "Most active this week" highlight

**CI/CD Status Panel:**
- Latest workflow run status per branch
- Pass / fail / running indicators
- Time of last run
- "Re-run" button

**Branches Panel:**
- All active branches
- Last commit date per branch
- "Stale" indicator for branches with no activity > 14 days

---

### Feature 4: GitHub Actions Control (No YAML)

**Priority:** P0 (must ship at launch — core differentiator)

**Description:** Users can trigger, monitor, create, and modify GitHub Actions workflows through plain English. This is the feature that no other product offers and is the primary reason developers will switch.

**Sub-features:**

**4a. Trigger existing workflows:**
```
User: "Run the deploy workflow on the main branch"
GitSpeak: POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches
Result: "✅ Deploy workflow triggered on main. Estimated completion: 4 min."
```

**4b. Monitor running workflows:**
```
User: "What's the status of the tests running right now?"
GitSpeak: GET /repos/{owner}/{repo}/actions/runs
Result: "Tests on feature/auth are 60% complete. 84 passed, 0 failed so far. 
         Estimated 2 min remaining."
```

**4c. Generate new workflow from description:**
```
User: "Set up CI that runs tests on every PR to main"
GitSpeak → OpenRouter API generates YAML → shows preview → user confirms → 
GitSpeak commits .github/workflows/ci.yml to repo
Result: "✅ CI workflow created. It will run on every PR to main automatically."
```

**4d. Explain existing workflow:**
```
User: "What does my deploy.yml actually do?"
GitSpeak fetches workflow file → OpenRouter AI explains in plain English
Result: "Your deploy workflow: (1) runs on pushes to main, (2) installs Node.js 
         18, (3) runs npm test, (4) if tests pass, deploys to Vercel using your 
         VERCEL_TOKEN secret."
```

**YAML Generation Rules (via OpenRouter API system prompt):**
- Always use latest stable action versions
- Always include a descriptive name for each step
- Never hardcode secrets — always use `${{ secrets.NAME }}`
- Add comments explaining non-obvious steps
- Validate generated YAML before committing

---

### Feature 5: AI Repo Intelligence

**Priority:** P1 (launch + 2 weeks)

**Description:** Users can ask open-ended questions about their repo and get intelligent, accurate answers synthesised from GitHub API data. This is the "second brain for your codebase" feature.

**Supported question types:**

**Team activity:**
- *"Who made the most commits this month?"*
- *"What has [contributor name] been working on?"*
- *"Is anyone blocked? Which branches haven't had activity in > 7 days?"*

**Code health:**
- *"What broke this week?"*
- *"Which PRs have been open the longest?"*
- *"Are there any failing tests right now?"*
- *"What files are changed most often? (hotspots)"*

**PR intelligence:**
- *"Summarise what PR #42 does in 3 bullets"*
- *"Which PRs are ready to merge?"*
- *"Who hasn't reviewed PR #38 yet?"*

**Release readiness:**
- *"What's changed since the last release?"*
- *"Is main ready to deploy?"*
- *"Are there any open critical issues?"*

**Data Sources for Intelligence:**
- GitHub Commits API
- GitHub Issues API
- GitHub Pull Requests API
- GitHub Actions API
- GitHub Stats API (contributor stats, code frequency)

**Intelligence Pipeline:**
```
User question
     ↓
Determine required data sources (OpenRouter AI classification)
     ↓
Parallel GitHub API calls to fetch relevant data
     ↓
Data passed to OpenRouter AI with question as prompt
     ↓
OpenRouter AI synthesises answer from real data
     ↓
Answer returned with source references
```

---

### Feature 6: Weekly AI Digest

**Priority:** P1 (launch + 2 weeks)

**Description:** Every Monday morning, GitSpeak sends a beautifully formatted email to all repo contributors summarising the previous week's activity. Auto-generated by OpenRouter AI from real GitHub data.

**Email Contents:**
- Week number + date range
- Total commits, PRs merged, issues closed
- Top contributor highlight
- 3–5 bullet summary of what was built/fixed
- Any stale branches or open issues flagged
- CI pass rate for the week
- One recommended action ("4 issues assigned to nobody — consider triaging")

**Delivery:** Resend API (transactional email)
**Schedule:** Monday 9am (user's local timezone)
**Opt-out:** Per-user, per-repo
**Customisation (Pro):** Change day/time, add custom sections

---

### Feature 7: Multi-Repo & Team Workspace

**Priority:** P2 (month 2)

**Description:** Teams can invite members to a shared GitSpeak workspace where multiple repos are connected and visible. Shared command history, team digest, and role-based permissions.

**Team Features:**
- Invite via email or GitHub username
- Shared repo connections (owner adds repo, all team members see it)
- Role system: Owner / Admin / Member / Viewer
- Shared command history (team can see who ran what)
- Team-level digest (across all connected repos)
- Activity feed showing team member actions in real-time

---

### Feature 8: PR Review Assistant

**Priority:** P2 (month 2)

**Description:** When a user opens a PR in GitSpeak, AI automatically generates: a plain-English summary of what changed, potential risks identified, files most likely to contain bugs, and suggested review comments.

**PR Review Panel:**
- What this PR does (3-bullet AI summary)
- Files changed (grouped by type)
- Risk score (Low / Medium / High) with reasoning
- Suggested comments on specific lines
- "Approve", "Request Changes", "Comment" actions

---

### Feature 9: Slack & Discord Integration

**Priority:** P2 (month 2)

**Description:** GitSpeak bot can be added to Slack or Discord. Team members can run GitSpeak commands from within their existing chat tool.

```
/gitspeak deploy main to staging
/gitspeak what broke this week?
/gitspeak create issue: payment flow is broken on iOS
```

---

### Feature 10: CLI Tool

**Priority:** P3 (month 3)

**Description:** `gitspeak` CLI for terminal users who want NLP power without leaving their workflow.

```bash
gitspeak "run tests and deploy if they pass"
gitspeak "what did I work on last week?"
gitspeak "create a PR from feature/auth to main"
```

---

## 9. User Flows

### Flow 1: First-Time User Onboarding (Target: < 3 minutes to first value)

```
Landing page
    → "Start free — connect GitHub"
    → GitHub OAuth (30 sec)
    → Select repos to connect (multi-select, searchable)
    → GitSpeak indexes selected repos (10–30 sec, progress shown)
    → Land on repo dashboard for first connected repo
    → Onboarding tooltip: "Try asking something — like 'What's the status of my open PRs?'"
    → User types first command
    → Gets answer
    → "Wow" moment achieved ✅
```

### Flow 2: Daily Active Use (Morning standup replacement)

```
User opens GitSpeak
    → Sees dashboard: 3 open PRs, CI failing on feature/auth, 2 new issues
    → Types: "What's blocking the team today?"
    → GitSpeak: "2 things: (1) CI is failing on feature/auth — 3 test failures in AuthService. 
                 (2) PR #41 has been waiting for review for 3 days."
    → User: "Who should review PR #41?"
    → GitSpeak: "Rahul reviewed the last 3 PRs touching auth — he'd be a good fit. 
                 Assign it to him?"
    → User: "Yes"
    → GitSpeak assigns PR #41 to Rahul via GitHub API
    → Done in 45 seconds, no GitHub tab opened
```

### Flow 3: Deployment

```
User: "Deploy the latest main to production"
    → GitSpeak: "I found a 'deploy-prod.yml' workflow. 
                 Last run: 2 days ago ✅. 
                 Current main is 6 commits ahead. 
                 Ready to trigger? [Deploy now] [Show changes first]"
    → User: "Show changes first"
    → GitSpeak lists last 6 commits in plain English
    → User: "Deploy now"
    → GitSpeak triggers workflow
    → Real-time progress shown in chat
    → "✅ Deployed successfully. Build time: 3m 42s."
```

### Flow 4: New Developer Onboarding to a Repo

```
New team member joins, connects to repo
    → Types: "How do I set up this project locally?"
    → GitSpeak reads README + package.json + Dockerfile
    → Returns step-by-step setup guide from actual repo contents
    → "What's our git workflow? How do we do PRs here?"
    → GitSpeak reads CONTRIBUTING.md + recent PR patterns
    → Returns: "Team uses feature branches off main. PRs require 1 approval. 
                Tests must pass before merge."
```

---

## 10. Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│        Next.js 14 (App Router)              │
│        TailwindCSS + Radix UI               │
│        React Query (data fetching)          │
└──────────────────┬──────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────┐
│                 Backend                      │
│           Node.js + Express                 │
│           Socket.IO (real-time)             │
│           Bull (job queue)                  │
└────┬──────────────┬──────────────┬──────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────────┐
│ MongoDB │  │OpenRouter API│  │  GitHub API  │
│Supabase │  │(Anthropic│  │  (REST v3 +  │
│(Auth)   │  │    )     │  │  GraphQL v4) │
└─────────┘  └──────────┘  └──────────────┘
```

### Frontend Stack

| Technology | Purpose | Why |
|---|---|---|
| Next.js 14 (App Router) | Framework | SSR, routing, API routes |
| TailwindCSS | Styling | Fast, consistent, dark mode |
| Radix UI | Component primitives | Accessible, unstyled, customisable |
| React Query (TanStack) | Data fetching / caching | Smart caching of GitHub API responses |
| Socket.IO client | Real-time CI status | Live workflow run updates |
| Monaco Editor | Code/YAML preview | Preview generated YAML before applying |
| Framer Motion | Animations | Smooth interactions, command UI transitions |

### Backend Stack

| Technology | Purpose | Why |
|---|---|---|
| Node.js + Express | API server | Existing syncUp codebase, familiar |
| Socket.IO | Real-time events | CI status, live command results |
| MongoDB + Mongoose | Primary database | User data, repos, command history |
| Bull + Redis | Job queue | Background: digest emails, repo indexing |
| Passport.js + GitHub OAuth | Authentication | Existing syncUp code, battle-tested |
| Resend | Transactional email | Digest emails, notifications |
| Stripe | Billing | Subscription management |

### AI / NLP Layer

| Component | Technology | Purpose |
|---|---|---|
| Intent Classification | OpenRouter LLM | Determine what the user wants |
| Parameter Extraction | OpenRouter LLM | Extract entities (branch name, PR number, etc.) |
| Response Generation | OpenRouter LLM | Natural language responses |
| YAML Generation | OpenRouter LLM | Generate valid GitHub Actions workflows |
| Repo Intelligence | OpenRouter LLM | Answer open-ended questions from fetched data |
| Weekly Digest | OpenRouter LLM | Generate digest from weekly activity data |

**OpenRouter API System Prompt Strategy:**
- Base system prompt: defines GitSpeak's role, tone, response format
- Repo context injected per request: repo name, branches, contributors, recent activity
- Tool-calling used for GitHub API actions (structured output)
- Response always includes: action taken, result, and 1–3 suggested next steps

---

## 11. API Integrations

### GitHub API — Full Endpoint Map

**Authentication**
- `GET /user` — Get authenticated user
- `GET /user/repos` — List user repos

**Repositories**
- `GET /repos/{owner}/{repo}` — Repo metadata
- `GET /repos/{owner}/{repo}/branches` — List branches
- `GET /repos/{owner}/{repo}/commits` — Commit history
- `GET /repos/{owner}/{repo}/stats/contributors` — Contributor stats
- `GET /repos/{owner}/{repo}/contents/{path}` — Read file contents (README, YAML)

**Issues**
- `GET /repos/{owner}/{repo}/issues` — List issues
- `POST /repos/{owner}/{repo}/issues` — Create issue
- `PATCH /repos/{owner}/{repo}/issues/{number}` — Update issue (assign, close)

**Pull Requests**
- `GET /repos/{owner}/{repo}/pulls` — List PRs
- `POST /repos/{owner}/{repo}/pulls` — Create PR
- `GET /repos/{owner}/{repo}/pulls/{number}/files` — PR diff
- `POST /repos/{owner}/{repo}/pulls/{number}/reviews` — Submit review
- `PUT /repos/{owner}/{repo}/pulls/{number}/merge` — Merge PR

**GitHub Actions**
- `GET /repos/{owner}/{repo}/actions/workflows` — List workflows
- `POST /repos/{owner}/{repo}/actions/workflows/{id}/dispatches` — Trigger workflow
- `GET /repos/{owner}/{repo}/actions/runs` — List runs
- `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` — Job details
- `POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun` — Re-run workflow
- `PUT /repos/{owner}/{repo}/contents/{path}` — Commit new file (for YAML creation)

**Webhooks (incoming)**
- `push` — New commit pushed
- `pull_request` — PR opened / closed / merged
- `workflow_run` — Actions workflow started / completed
- `issues` — Issue created / closed

### OpenRouter API Usage

**Model:** `openrouter-llm`  
**Max tokens per request:** 1,000–2,000 (intent + execution), 4,000 (digest generation)

**Request pattern:**
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "openrouter-llm",
    max_tokens: 1000,
    system: GITSPEAK_SYSTEM_PROMPT + repoContextString,
    messages: [{ role: "user", content: userCommand }]
  })
});
```

**Cost estimation (V1):**
- ~200 tokens per command (input) + ~300 tokens (output) = ~500 tokens per command
- At $3/MTok input + $15/MTok output ≈ $0.001 per command
- Free tier user (50 commands/month) ≈ $0.05/user/month in API costs

---

## 12. Data Models

### User
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  avatar: String (URL from GitHub),
  githubId: String,
  githubLogin: String,           // GitHub username
  githubAccessToken: String,     // Encrypted
  plan: Enum ['free', 'pro', 'team'],
  stripeCustomerId: String,
  createdAt: Date,
  lastActiveAt: Date,
  settings: {
    digestDay: String,           // 'monday'
    digestTime: String,          // '09:00'
    timezone: String,            // 'Asia/Kolkata'
    emailNotifications: Boolean
  }
}
```

### ConnectedRepo
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  workspaceId: ObjectId (ref: Workspace, optional),
  githubRepoId: Number,
  fullName: String,              // 'owner/repo-name'
  name: String,
  description: String,
  defaultBranch: String,
  isPrivate: Boolean,
  language: String,
  topics: [String],
  connectedAt: Date,
  lastIndexedAt: Date,
  webhookId: Number,             // GitHub webhook ID for this repo
  settings: {
    digestEnabled: Boolean,
    aiReviewEnabled: Boolean
  }
}
```

### CommandHistory
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  repoId: ObjectId (ref: ConnectedRepo),
  input: String,                 // Raw user input
  intent: String,                // Classified intent
  parameters: Object,            // Extracted parameters
  githubApiCalls: [{
    method: String,
    endpoint: String,
    status: Number
  }],
  response: String,              // Natural language response shown to user
  success: Boolean,
  executionTimeMs: Number,
  createdAt: Date
}
```

### Workspace (Team Feature)
```javascript
{
  _id: ObjectId,
  name: String,
  ownerId: ObjectId (ref: User),
  members: [{
    userId: ObjectId,
    role: Enum ['owner', 'admin', 'member', 'viewer'],
    joinedAt: Date
  }],
  connectedRepos: [ObjectId],
  plan: Enum ['team', 'enterprise'],
  stripeSubscriptionId: String,
  createdAt: Date
}
```

### DigestLog
```javascript
{
  _id: ObjectId,
  repoId: ObjectId (ref: ConnectedRepo),
  weekOf: Date,
  recipientEmails: [String],
  content: String,               // Generated email content
  githubData: Object,            // Raw data used for generation
  sentAt: Date,
  openRate: Number               // % who opened (from Resend webhooks)
}
```

---

## 13. UI/UX Design Principles

### Core Design Values

**1. Speed above all**  
Every interaction should feel instant. GitHub's UI feels slow. GitSpeak should feel like talking to someone who already knows everything. Optimistic UI updates everywhere. Skeleton states, not spinners.

**2. Conversation is primary**  
The command input is always visible, always focused. It's not a search bar in the corner — it's the main interface. Everything else is context for the conversation.

**3. Information density without clutter**  
Show everything relevant, hide everything irrelevant. No empty states with cute illustrations. Real data, immediately.

**4. Dark mode first**  
Developers live in dark mode. Design dark first, then adapt to light.

**5. Actions over navigation**  
Users should never need to navigate to a different page to take an action. Everything should be actionable from where you are.

### Design System

**Typography:**
- Font: Geist (Vercel's font) — clean, modern, developer-native
- Mono font: Geist Mono — for code, commands, hashes

**Colour Palette (Dark Mode):**
```
Background:     #0D1117  (GitHub's dark bg — familiarity)
Surface:        #161B22  (Card backgrounds)
Border:         #30363D  (Subtle borders)
Text primary:   #E6EDF3
Text secondary: #8B949E
Accent blue:    #58A6FF  (Links, primary actions)
Success green:  #3FB950  (CI pass, merges)
Error red:      #F85149  (CI fail, errors)
Warning yellow: #D29922  (Stale, warnings)
```

**Spacing:** 4px base grid  
**Border radius:** 6px (components), 12px (cards), 24px (pills)

### Key UI Components

**Command Bar:**
- Always visible at bottom of screen (like a terminal)
- Auto-suggests based on recent commands + repo context
- Shows processing state with animated dots
- History accessible with ↑/↓ arrows

**Response Cards:**
- Fixed max-width for readability
- AI responses always have a subtle left border in accent colour
- Action buttons are always visible (not hidden in menus)
- Code/YAML shown in Monaco-style highlighted blocks

**Dashboard Layout:**
- Left sidebar: repo list + navigation
- Main area: dashboard / conversation split view
- Right panel (collapsible): repo details, contributor list

---

## 14. Monetisation Strategy

### Pricing Tiers

**Free**
- 3 connected repos
- 50 NLP commands per month
- Repo dashboard (read-only intelligence)
- Weekly digest (1 repo)
- Community support

**Pro — $12/month**
- Unlimited repos
- Unlimited NLP commands
- GitHub Actions control (trigger + monitor)
- YAML generation (up to 5 workflows)
- PR review assistant
- Priority support

**Team — $49/month (up to 10 members)**
- Everything in Pro
- Team workspace with shared repos
- Shared command history
- Slack + Discord integration
- Team digest across all repos
- Role-based access control
- Billing portal

**Enterprise — Custom pricing**
- Unlimited members
- SSO (SAML, Okta)
- On-premise deployment option
- SLA + dedicated support
- Custom AI tuning on your codebase
- Audit logs

### Revenue Projections (Year 1)

| Month | Free Users | Pro Users | Team Workspaces | MRR |
|---|---|---|---|---|
| 1–2 | 200 | 20 | 2 | $338 |
| 3–4 | 800 | 80 | 10 | $1,450 |
| 5–6 | 2,000 | 200 | 30 | $3,870 |
| 7–9 | 5,000 | 500 | 80 | $9,520 |
| 10–12 | 12,000 | 1,200 | 200 | $24,200 |

**Year 1 ARR Target:** $200,000

### Free → Paid Conversion Strategy

The key conversion moment is hitting the **50 command limit on free**. The product must be designed so users hit this limit within their first week — meaning the commands are genuinely useful and they keep coming back.

Tactics:
- Onboarding nudge to use 5 commands in the first session
- "You've used 40/50 commands this month" notification at 80% usage
- Upgrade prompt shown inline when limit is hit (not on a separate page)
- 7-day Pro trial offered at signup (no credit card required)

---

## 15. Go-to-Market Strategy

### Phase 1: Developer Community (Month 1–2)

**Goal:** 500 signups, 50 power users, first 10 paying customers

**Channels:**
- **Show HN (Hacker News):** Post on a Tuesday. Lead with the problem: "GitHub's UI is 18 years old. I built a conversational interface." Show demo GIF.
- **Product Hunt:** Launch on a Tuesday at 12:01am PST. Have 30 supporters ready. First comment tells the personal story.
- **Twitter/X dev community:** Post demo video (60 seconds max). Tag influential devs. Use hashtags #buildinpublic #indiehackers
- **Reddit:** r/programming, r/webdev, r/github, r/node — tailor each post to that community's tone
- **Dev.to / Hashnode:** Write "I built a conversational interface for GitHub — here's how" with technical detail

**Content that converts:**
- 60-second demo video: person deploys their app by typing one sentence
- "Before/after" GIF: 8 clicks in GitHub vs. 1 sentence in GitSpeak
- Technical blog post: "How I used OpenRouter API to parse GitHub intent"

### Phase 2: GitHub Marketplace (Month 2–3)

**Goal:** Passive discovery from GitHub's own platform

- Submit GitSpeak as a GitHub App on Marketplace
- Free tier available directly from Marketplace
- Every connected repo shows "Powered by GitSpeak" badge (opt-in, encourages sharing)

### Phase 3: Team Plans (Month 3–4)

**Goal:** Convert solo users into team plans

- Users who've been on Pro for 30+ days get an email: "Invite your team"
- Referral programme: invite 3 team members → 1 month Pro free
- Target communities: indie hacker Slack groups, startup Discord servers

### Phase 4: Content & SEO (Month 4+)

Long-form content targeting high-intent searches:
- "How to trigger GitHub Actions without YAML"
- "GitHub PR review best practices 2026"
- "How to understand a GitHub repo you've never seen before"

---

## 16. Build Roadmap

### Week 1–2: Core MVP

| Task | Owner | Est. Time |
|---|---|---|
| GitHub OAuth (port from syncUp) | Sumir | 0.5 days |
| Repo connection + metadata indexing | Sumir | 1 day |
| Basic conversational interface UI | Sumir | 1.5 days |
| OpenRouter API intent classification + response | Sumir | 1.5 days |
| 10 core NLP commands (issues, PRs, commits) | Sumir | 2 days |
| Repo dashboard V1 (commits, PRs, CI status) | Sumir | 2 days |
| Deploy to Vercel + Railway | Sumir | 0.5 days |
| **Milestone: Working demo** | | **~9 days** |

### Week 3–4: GitHub Actions Control

| Task | Est. Time |
|---|---|
| Trigger existing workflows via NLP | 1 day |
| Real-time workflow monitoring (Socket.IO) | 1.5 days |
| YAML generation from plain English (OpenRouter AI) | 2 days |
| YAML preview + commit to repo | 1 day |
| Explain existing workflows in plain English | 0.5 days |
| **Milestone: Actions control live** | **~6 days** |

### Week 5–6: Intelligence + Polish

| Task | Est. Time |
|---|---|
| Repo intelligence questions (open-ended) | 2 days |
| Weekly digest generation + Resend integration | 1.5 days |
| PR review assistant (summary + risk score) | 2 days |
| Onboarding flow + first-run experience | 1 day |
| Error handling + edge cases | 1 day |
| **Milestone: Full feature set** | **~7.5 days** |

### Week 7–8: Monetisation + Launch

| Task | Est. Time |
|---|---|
| Stripe integration (3 tiers) | 1.5 days |
| Usage limits + upgrade prompts | 1 day |
| Landing page (product story + pricing) | 1.5 days |
| Demo video production | 0.5 days |
| GitHub Marketplace listing submission | 0.5 days |
| Product Hunt + HN launch prep | 1 day |
| **Milestone: Public launch** | **~6 days** |

---

## 17. Success Metrics

### North Star Metric
**Weekly Active Commands** — the number of NLP commands executed by active users per week. This captures both retention and value delivery.

**Target:** 10,000 weekly active commands by Month 6

### Growth Metrics

| Metric | Month 1 | Month 3 | Month 6 |
|---|---|---|---|
| Total signups | 500 | 2,500 | 10,000 |
| Weekly Active Users | 100 | 800 | 4,000 |
| Paying users | 20 | 150 | 800 |
| MRR | $300 | $2,500 | $15,000 |
| GitHub Marketplace installs | 50 | 300 | 1,500 |

### Product Health Metrics

| Metric | Target |
|---|---|
| Time to first command (onboarding) | < 3 minutes |
| Command success rate | > 85% |
| Command response time | < 3 seconds (p95) |
| Free → Pro conversion rate | > 8% |
| Monthly retention (paying users) | > 85% |
| NPS score | > 50 |
| Digest email open rate | > 45% |

### Signals of Product-Market Fit

- Users coming back 3+ days/week without being prompted
- Unprompted shares on Twitter/LinkedIn with screenshots
- Users inviting team members within 7 days of signup
- "I can't work without this" feedback in support messages
- Organic GitHub Marketplace installs (no marketing spend)

---

## 18. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| GitHub revokes API access / changes terms | Low | High | Monitor GitHub developer TOS. Build on stable, public APIs only. Have contingency for GitLab/Bitbucket. |
| OpenRouter API costs spike at scale | Medium | Medium | Implement aggressive caching of repo data. Rate-limit free tier commands. Batch intelligence queries. |
| GitHub builds competing feature | Low | High | Move fast. Get to market before GitHub copies. Differentiate on UI quality and multi-tool integration. |
| Low free → paid conversion | Medium | High | Design conversion moments carefully. Track where users drop off. Iterate pricing. |
| Security breach (GitHub tokens) | Low | Very High | AES-256 token encryption at rest. Minimal scope OAuth. Regular security audits. SOC 2 roadmap. |
| Shell injection in git terminal | High (current) | High | Whitelist allowed commands. Never pass raw user input to exec(). Use GitHub API instead of local git. |
| User frustration with NLP accuracy | Medium | Medium | Start with a small, high-accuracy command set. Expand carefully. Always show "did you mean X?" fallbacks. |

---

## 19. Out of Scope (V1)

The following features are deliberately excluded from V1 to maintain focus. They are valid future features but should not delay launch:

- GitLab / Bitbucket integration (GitHub only for V1)
- Mobile app (web only, responsive)
- Code editing within GitSpeak (use your IDE)
- Full kanban / project management (use Linear)
- Video calls (use Discord)
- AI pair programming (use Cursor / Copilot)
- On-premise / self-hosted deployment
- Custom LLM fine-tuning
- Enterprise SSO
- Audit logs
- API access for third-party integrations

---

## 20. Appendix — NLP Command Library

The following is the complete list of NLP commands GitSpeak will support at launch (V1), grouped by category.

### Repository Commands
| Example Input | Action |
|---|---|
| "Show me all my repos" | GET /user/repos |
| "What's the status of [repo]?" | GET repo metadata + CI status |
| "How many contributors does [repo] have?" | GET contributor stats |
| "What language is [repo] written in?" | GET repo metadata |
| "When was [repo] last updated?" | GET latest commit |

### Branch Commands
| Example Input | Action |
|---|---|
| "List all branches" | GET /repos/.../branches |
| "Create a new branch called [name] from [base]" | POST create branch |
| "Delete the [branch] branch" | DELETE branch (with confirmation) |
| "Which branches are stale (no activity)?" | GET branches + filter by date |
| "Switch to [branch]" | N/A — sets active context |

### Commit Commands
| Example Input | Action |
|---|---|
| "Show me the last 10 commits on [branch]" | GET commits with limit |
| "What changed in the last commit?" | GET latest commit + diff |
| "Who made the most commits this month?" | GET contributor stats |
| "What did I work on last week?" | GET commits filtered by author + date |
| "Show commits that touched the auth files" | GET commits + filter by path |

### Issue Commands
| Example Input | Action |
|---|---|
| "Create an issue: [title]" | POST /issues |
| "List all open issues" | GET /issues |
| "Show me critical / bug issues" | GET /issues?labels=bug |
| "Assign issue #[n] to [user]" | PATCH /issues/{n} |
| "Close issue #[n]" | PATCH /issues/{n} state=closed |
| "Which issues have no assignee?" | GET issues + filter |

### Pull Request Commands
| Example Input | Action |
|---|---|
| "Show open PRs" | GET /pulls |
| "Create a PR from [branch] to [base]" | POST /pulls |
| "Summarise PR #[n]" | GET PR + files → OpenRouter AI summary |
| "Who needs to review PR #[n]?" | GET PR reviewers |
| "Merge PR #[n]" | PUT /pulls/{n}/merge (with confirmation) |
| "Close PR #[n] without merging" | PATCH /pulls/{n} state=closed |
| "Which PRs are ready to merge?" | GET PRs + check CI + review status |

### GitHub Actions Commands
| Example Input | Action |
|---|---|
| "List all workflows" | GET /actions/workflows |
| "Run the [workflow] workflow" | POST workflow dispatch |
| "Run tests on [branch]" | Trigger test workflow on branch |
| "Deploy [branch] to [environment]" | Trigger deploy workflow |
| "What's the status of the running tests?" | GET /actions/runs (active) |
| "Show me the logs from the last failed run" | GET run job logs |
| "Re-run the failed workflow" | POST rerun |
| "Set up CI for this repo" | Generate + commit YAML |
| "What does my [workflow].yml do?" | Read file → OpenRouter AI explanation |
| "Add a step to [workflow] that [action]" | Modify YAML + commit |

### Intelligence Commands
| Example Input | Action |
|---|---|
| "What broke this week?" | GET failing runs + failed tests → OpenRouter AI synthesis |
| "Who's blocked?" | GET stale PRs + stale branches → OpenRouter AI synthesis |
| "Is main ready to deploy?" | GET CI + open PRs + recent issues → OpenRouter AI assessment |
| "What changed since the last release?" | GET commits since last tag |
| "Give me a status update on [repo]" | Aggregate overview → OpenRouter AI summary |
| "What should I work on next?" | GET open issues + PRs + OpenRouter AI recommendation |

---

*Document ends. Version 1.0 — June 2026*

*Next review: After Week 2 MVP build — update based on technical learnings.*
