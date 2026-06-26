const fetchGitHubEvents = async (username, token, page = 1) => {
  const response = await fetch(`https://api.github.com/users/${username}/events?per_page=100&page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub events');
  }
  return response.json();
};

const fetchGitHubCommits = async (username, token) => {
  const response = await fetch(`https://api.github.com/search/commits?q=author:${username}&sort=author-date&order=desc&per_page=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.cloak-preview+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub commits');
  }
  return response.json();
};

const fetchGitHubFollowers = async (username, token) => {
  const response = await fetch(`https://api.github.com/users/${username}/followers?per_page=100`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Cache-Control': 'no-cache'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub followers');
  }
  return response.json();
};

const callOpenRouter = async (messages, freeModelsList) => {
  let answer = null;
  let lastError = null;
  const maxAttempts = Math.min(10, freeModelsList.length);

  for (let i = 0; i < maxAttempts; i++) {
    const selectedModel = freeModelsList[i];
    console.log(`Attempt ${i + 1}: Using OpenRouter model: ${selectedModel}`);

    const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: messages
      })
    });

    if (openrouterRes.ok) {
      const aiData = await openrouterRes.json();
      if (aiData.choices && aiData.choices.length > 0) {
        answer = aiData.choices[0].message.content;
        break;
      } else {
        lastError = JSON.stringify(aiData);
      }
    } else {
      lastError = await openrouterRes.text();
    }
  }

  if (!answer) {
    throw new Error(`Failed to fetch from OpenRouter after ${maxAttempts} attempts. Last error: ${lastError}`);
  }
  return answer;
};

const formatTimeAgo = (dateString) => {
  const diffInMs = new Date() - new Date(dateString);
  const diffInMins = Math.floor(diffInMs / 60000);
  if (diffInMins < 60) return `${diffInMins}m ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
};

const fetchGitHubContributions = async (username, token) => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        followers {
          totalCount
        }
        repositories(first: 50, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
          totalCount
          nodes {
            name
            stargazerCount
            languages(first: 3, orderBy: {field: SIZE, direction: DESC}) {
              edges {
                size
                node {
                  name
                  color
                }
              }
            }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GitSpeak-App'
    },
    body: JSON.stringify({
      query,
      variables: { username }
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub contributions');
  }
  return response.json();
};

exports.getActivityFeed = async (req, res) => {
  try {
    const { username, accessToken } = req.user;

    const [page1, page2, page3, commitsData] = await Promise.all([
      fetchGitHubEvents(username, accessToken, 1).catch(() => []),
      fetchGitHubEvents(username, accessToken, 2).catch(() => []),
      fetchGitHubEvents(username, accessToken, 3).catch(() => []),
      fetchGitHubCommits(username, accessToken).catch(() => ({ items: [] }))
    ]);

    const events = [...(Array.isArray(page1) ? page1 : []), ...(Array.isArray(page2) ? page2 : []), ...(Array.isArray(page3) ? page3 : [])];

    let activities = events.map((event, index) => {
      let icon = 'ph-git-commit';
      let title = 'Performed an action';
      let hash = null;

      if (event.type === 'PushEvent') {
        icon = 'ph-git-commit';
        title = `Pushed ${event.payload.commits?.length || 0} commit(s) to ${event.repo.name}`;
        hash = event.payload.commits?.[0]?.sha?.substring(0, 7) || 'HEAD';
      } else if (event.type === 'PullRequestEvent') {
        icon = 'ph-git-pull-request';
        title = `${event.payload.action === 'closed' && event.payload.pull_request.merged ? 'Merged' : event.payload.action === 'opened' ? 'Opened' : 'Updated'} pull request #${event.payload.number}`;
        hash = `PR #${event.payload.number}`;
      } else if (event.type === 'IssuesEvent') {
        icon = 'ph-check-circle';
        title = `${event.payload.action === 'closed' ? 'Closed' : 'Opened'} issue: ${event.payload.issue.title}`;
        hash = `Issue #${event.payload.issue.number}`;
      } else if (event.type === 'CreateEvent') {
        icon = 'ph-folder-plus';
        title = `Created ${event.payload.ref_type} ${event.payload.ref || ''} in ${event.repo.name}`;
      } else if (event.type === 'WatchEvent') {
        icon = 'ph-star';
        title = `Starred repository ${event.repo.name}`;
      }

      return {
        id: event.id || index,
        type: event.type,
        icon,
        title,
        repo: event.repo.name,
        time: formatTimeAgo(event.created_at),
        rawDate: new Date(event.created_at).getTime(),
        hash
      };
    });

    const commitActivities = (commitsData.items || []).map((item) => {
      return {
        id: item.sha,
        type: 'CommitSearchResult',
        icon: 'ph-git-commit',
        title: item.commit.message.split('\n')[0],
        repo: item.repository.full_name,
        time: formatTimeAgo(item.commit.author.date),
        rawDate: new Date(item.commit.author.date).getTime(),
        hash: item.sha.substring(0, 7)
      };
    });

    const existingHashes = new Set(activities.map(a => a.hash).filter(Boolean));
    const uniqueCommits = commitActivities.filter(c => !existingHashes.has(c.hash));

    activities = [...activities, ...uniqueCommits].sort((a, b) => b.rawDate - a.rawDate);

    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activity feed' });
  }
};

exports.getAiDigest = async (req, res) => {
  try {
    const { username, accessToken } = req.user;
    const [events, graphqlRes] = await Promise.all([
      fetchGitHubEvents(username, accessToken),
      fetchGitHubContributions(username, accessToken)
    ]);

    let mergedPrs = 0;
    const activeRepos = new Set();

    events.forEach(event => {
      activeRepos.add(event.repo.name);
      if (event.type === 'PullRequestEvent' && event.payload.action === 'closed' && event.payload.pull_request?.merged) {
        mergedPrs++;
      }
    });

    const userData = graphqlRes.data?.user || {};
    const followers = userData.followers?.totalCount || 0;
    const totalRepos = userData.repositories?.totalCount || 0;
    const repoNodes = userData.repositories?.nodes || [];
    const totalStars = repoNodes.reduce((sum, repo) => sum + repo.stargazerCount, 0);
    const repoCount = activeRepos.size;

    const digestText = `You recently modified <span className="text-[#F2F4F7] font-bold">${repoCount} repos</span> and merged <span className="text-[#F2F4F7] font-bold">${mergedPrs} PR(s)</span>. Keep up the good work!`;

    const digest = {
      followers,
      totalRepos,
      totalStars,
      text: digestText
    };

    res.json({ success: true, digest });
  } catch (error) {
    console.error('Error fetching AI digest:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch AI digest' });
  }
};

exports.getInsights = async (req, res) => {
  try {
    const { username, accessToken } = req.user;

    // Fetch events and contributions in parallel
    const [events, contributionsData] = await Promise.all([
      fetchGitHubEvents(username, accessToken),
      fetchGitHubContributions(username, accessToken)
    ]);

    const attentionItems = [];

    events.forEach(event => {
      if (event.type === 'IssuesEvent' && event.payload.action === 'opened') {
        attentionItems.push({
          id: event.id,
          type: 'warning',
          color: 'bg-yellow-500',
          title: `Open Issue: ${event.payload.issue.title.substring(0, 30)}...`,
          subtitle: `${event.repo.name} • ${formatTimeAgo(event.created_at)}`
        });
      } else if (event.type === 'PullRequestEvent' && event.payload.action === 'opened') {
        attentionItems.push({
          id: event.id,
          type: 'review',
          color: 'bg-amber-500',
          title: `Pending PR: #${event.payload.number}`,
          subtitle: `${event.repo.name} • ${formatTimeAgo(event.created_at)}`
        });
      }
    });

    let heatmapData = [];
    let velocity = { value: '+0%', window: '7D Window', sparkline: [0, 0, 0, 0, 0, 0, 0], isPositive: true };
    let languageData = [];

    try {
      const weeks = contributionsData.data.user.contributionsCollection.contributionCalendar.weeks;
      const last21Weeks = weeks.slice(-21);
      heatmapData = last21Weeks.flatMap(week => week.contributionDays.map(day => day.contributionCount));

      // Calculate velocity
      const last14Days = last21Weeks.flatMap(week => week.contributionDays).slice(-14);
      if (last14Days.length === 14) {
        const previousWeek = last14Days.slice(0, 7).reduce((a, b) => a + b.contributionCount, 0);
        const currentWeek = last14Days.slice(7, 14).reduce((a, b) => a + b.contributionCount, 0);
        let pct = 0;
        if (previousWeek === 0 && currentWeek > 0) pct = 100;
        else if (previousWeek > 0) pct = ((currentWeek - previousWeek) / previousWeek) * 100;

        velocity.value = `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
        velocity.isPositive = pct >= 0;
        velocity.sparkline = last14Days.slice(7, 14).map(d => d.contributionCount);
      }

      // Ensure exactly 147 cells
      while (heatmapData.length < 147) {
        heatmapData.unshift(0);
      }
      if (heatmapData.length > 147) {
        heatmapData = heatmapData.slice(-147);
      }

      // Calculate languages
      const repos = contributionsData.data.user.repositories.nodes || [];
      const langMap = {};
      repos.forEach(repo => {
        (repo.languages?.edges || []).forEach(edge => {
          if (!langMap[edge.node.name]) {
            langMap[edge.node.name] = { size: 0, color: edge.node.color };
          }
          langMap[edge.node.name].size += edge.size;
        });
      });
      const totalSize = Object.values(langMap).reduce((a, b) => a + b.size, 0);
      languageData = Object.keys(langMap)
        .map(key => ({
          name: key,
          color: langMap[key].color || '#8B949E',
          percentage: totalSize > 0 ? ((langMap[key].size / totalSize) * 100) : 0
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3); // Top 3 languages
    } catch (e) {
      console.error('Error parsing contribution data:', e);
      heatmapData = Array(147).fill(0);
    }

    const insights = {
      velocity,
      attentionItems: attentionItems.slice(0, 3), // Top 3 critical items
      heatmap: heatmapData,
      languages: languageData
    };

    res.json({ success: true, insights });
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch insights' });
  }
};

exports.askAi = async (req, res) => {
  try {
    const { question } = req.body;
    const username = req.user.username;

    const token = req.user.accessToken;

    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    // 1. Get Free Models List
    let freeModelsList = ["huggingfaceh4/zephyr-7b-beta:free"];
    try {
      const modelsRes = await fetch("https://openrouter.ai/api/v1/models");
      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        const freeModels = modelsData.data.filter(m => m.id.endsWith(':free'));
        if (freeModels.length > 0) {
          freeModelsList = freeModels.map(m => m.id).sort((a, b) => {
            if (a.includes('google/') || a.includes('meta-llama/')) return -1;
            if (b.includes('google/') || b.includes('meta-llama/')) return 1;
            return 0;
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch model list, using fallback:", e);
    }
    // 2. Fetch all data simultaneously (Single Pass)
    const [commitsData, eventsData, contribsData, followersData] = await Promise.all([
      fetchGitHubCommits(username, token).catch(() => ({ items: [] })),
      fetchGitHubEvents(username, token).catch(() => []),
      fetchGitHubContributions(username, token).catch(() => ({})),
      fetchGitHubFollowers(username, token).catch(() => [])
    ]);

    // 3. Parse and format into plain English Text
    let plainTextContext = `--- USER GITHUB PROFILE CONTEXT ---\n`;
    
    // Followers
    if (followersData && followersData.length > 0) {
      const followerNames = followersData.map(f => f.login).join(', ');
      plainTextContext += `* Followers (${followersData.length}): ${followerNames}\n`;
    }

    // Profile & Repos
    if (contribsData.data && contribsData.data.user) {
      const user = contribsData.data.user;
      plainTextContext += `* Total Repositories: ${user.repositories?.totalCount || 0}\n`;
      plainTextContext += `* Total Contributions (last year): ${user.contributionsCollection?.contributionCalendar?.totalContributions || 0}\n`;
      
      plainTextContext += `* Repositories Details:\n`;
      (user.repositories?.nodes || []).slice(0, 15).forEach(repo => {
        const repoLangs = {};
        (repo.languages?.edges || []).forEach(edge => {
          repoLangs[edge.node.name] = edge.size;
        });
        const langString = Object.entries(repoLangs)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(l => `${l[0]} (${l[1]} bytes)`)
          .join(', ');
        
        plainTextContext += `  - Repository Name: "${repo.name || 'Unknown'}" | Languages Used: ${langString || 'None'}\n`;
      });
    }

    // Commits
    const commits = (commitsData.items || []).slice(0, 10);
    if (commits.length > 0) {
      plainTextContext += `* Recent Commits:\n`;
      commits.forEach(item => {
        plainTextContext += `  - Committed to repository "${item.repository.full_name}" on ${new Date(item.commit.author.date).toLocaleDateString()}: "${item.commit.message.split('\\n')[0]}"\n`;
      });
    }

    // Events
    const events = eventsData.slice(0, 10);
    if (events.length > 0) {
      plainTextContext += `* Recent Activity Events:\n`;
      events.forEach(event => {
        plainTextContext += `  - Performed ${event.type} in repository "${event.repo.name}" on ${new Date(event.created_at).toLocaleDateString()}.\n`;
      });
    }

    // 4. Generate Final Answer
    const systemPrompt = `You are GitSpeak, an AI coding assistant integrated into a developer's GitHub dashboard.
You have full access to the user's explicit GitHub activity, repositories, commits, and followers.

<RULES>
1. EXPLICIT NAMING: When referring to repositories, users, languages, or commits, ALWAYS use their exact explicit names or hashes from the context. NEVER refer to them vaguely as "the first repository" or "the second one".
2. You are friendly and conversational. You can chat about general topics, but always pivot back to how you can help them with their code or GitHub activity when appropriate.
3. GITHUB ACHIEVEMENTS: The GitHub API does not officially expose Profile Achievements (e.g., Pull Shark, YOLO, Quickdraw) to third-party integrations. If the user asks about their achievements or badges, politely explain this API limitation.
</RULES>

When the user asks about their activity, use the provided plain text context below to accurately answer. Read the context carefully.

${plainTextContext}`;

    const finalAnswer = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ], freeModelsList);

    res.json({ success: true, answer: finalAnswer });
  } catch (error) {
    console.error('Error in askAi:', error);
    res.status(500).json({ success: false, error: 'Failed to process AI request. The free tier might be fully congested right now.' });
  }
};

