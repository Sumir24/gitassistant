const express = require('express');
const { requireAuth } = require('../auth/auth.middleware');
const OpenAI = require('openai');
const GitHubService = require('../../core/github.service');
const RegisteredRepo = require('../repos/RegisteredRepo.model');

const router = express.Router();

let openai = null;
let defaultModel = "gpt-4o-mini";

if (process.env.OPENROUTER_API_KEY) {
  openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
      "X-Title": "GitAssistant",
    }
  });
  defaultModel = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";
} else if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  defaultModel = process.env.AI_MODEL || "gpt-4o-mini";
}

// POST /api/ai/chat
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!openai) {
      // Mock response if no API key is set
      return res.json({
        reply: "I am an AI assistant. Please set up your OpenAI API key in the backend to enable real chat."
      });
    }

    const tools = [
      {
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
      }
    ];

    const freeModels = [
      process.env.OPENROUTER_MODEL,
      "google/gemma-4-31b-it:free",
      "google/gemma-4-26b-a4b-it:free",
      "cohere/north-mini-code:free",
      "poolside/laguna-m.1:free"
    ].filter(Boolean);

    let completion = null;
    let lastError = null;
    
    for (const model of freeModels) {
      try {
        completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: "You are a helpful AI assistant integrated into a tool called GitAssistant. You help users manage their GitHub repositories and answer their questions. You have tools available to create repositories directly." },
            ...messages
          ],
          tools: tools,
          tool_choice: "auto"
        });
        break;
      } catch (err) {
        console.warn(`Model ${model} failed: ${err.message}. Trying next...`);
        lastError = err;
      }
    }

    if (!completion) throw lastError;

    const responseMessage = completion.choices[0].message;

    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      if (toolCall.function.name === 'create_repository') {
        const args = JSON.parse(toolCall.function.arguments);
        try {
          let newRepo;
          let wasExisting = false;
          try {
            newRepo = await GitHubService.createRepository(req.user.accessToken, {
              name: args.name,
              description: args.description || '',
              private: args.private || false,
              auto_init: true // Always auto-init so the repo is not empty (needed for Blob API)
            });
          } catch (err) {
            if (err.message.includes('422')) {
              // Repository might already exist
              const repos = await GitHubService.getUserRepositories(req.user.accessToken);
              const existing = repos.find(r => r.name.toLowerCase() === args.name.toLowerCase());
              if (existing) {
                wasExisting = true;
                const owner = existing.fullName.split('/')[0];
                newRepo = {
                  id: existing.id,
                  name: existing.name,
                  full_name: existing.fullName,
                  description: existing.description,
                  private: existing.isPrivate,
                  default_branch: existing.defaultBranch || 'main',
                  language: existing.language,
                  topics: existing.topics,
                  owner: { login: owner }
                };
              } else {
                throw err;
              }
            } else {
              throw err; // Re-throw if it's a different error
            }
          }

          if (!wasExisting) {
            const registered = new RegisteredRepo({
              userId: req.user._id,
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
          }

          let uploadMsg = '';
          if (args.localPath) {
            await GitHubService.uploadLocalFolderToGitHub(req.user.accessToken, newRepo.owner.login, newRepo.name, args.localPath, newRepo.default_branch || 'main');
            uploadMsg = ` and successfully uploaded the contents of ${args.localPath}`;
          }

          const actionWord = wasExisting ? 'found the existing repository' : 'created the repository';
          return res.json({ reply: `I have successfully ${actionWord} **${newRepo.full_name}**${uploadMsg}! You can now see it in your dashboard.` });
        } catch (err) {
          return res.json({ reply: `I encountered an error: ${err.message}` });
        }
      }
    }

    const reply = responseMessage.content || "I couldn't generate a response.";
    res.json({ reply });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request', details: error.message });
  }
});

// POST /api/ai/generate-repo-config
router.post('/generate-repo-config', requireAuth, async (req, res) => {
  try {
    const { prompt, fileContent } = req.body;

    if (!openai) {
      // Mock response
      return res.json({
        config: {
          name: 'generated-repo',
          description: 'This is a mocked generated repository description based on your input.',
          private: false,
          has_issues: true,
          has_projects: true,
          has_wiki: true,
          auto_init: true
        }
      });
    }

    let userMessage = "Analyze the following input and generate a GitHub repository configuration.";
    if (prompt) {
      userMessage += `\n\nUser Description: ${prompt}`;
    }
    if (fileContent) {
      userMessage += `\n\nFile Content Provided by User:\n${fileContent}`;
    }

    const freeModels = [
      process.env.OPENROUTER_MODEL,
      "google/gemma-4-31b-it:free",
      "google/gemma-4-26b-a4b-it:free",
      "cohere/north-mini-code:free",
      "poolside/laguna-m.1:free"
    ].filter(Boolean);

    let completion = null;
    let lastError = null;

    for (const model of freeModels) {
      try {
        completion = await openai.chat.completions.create({
          model: model,
          messages: [
            { 
              role: "system", 
              content: "You are a repository generation assistant. Output a JSON object matching GitHub's create repository API payload. Include at least 'name' and 'description'. Additional optional fields: 'private' (boolean), 'has_issues' (boolean), 'has_projects' (boolean), 'has_wiki' (boolean), 'auto_init' (boolean). Only output the JSON object without markdown formatting or other text." 
            },
            { role: "user", content: userMessage }
          ]
        });
        break;
      } catch (err) {
        console.warn(`Model ${model} failed: ${err.message}. Trying next...`);
        lastError = err;
      }
    }

    if (!completion) throw lastError;

    const content = completion.choices[0].message.content.trim();
    let configObj = {};
    try {
      configObj = JSON.parse(content);
    } catch (e) {
      // If parsing fails, try to strip markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        configObj = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse JSON from AI response.");
      }
    }

    // Enforce basic validation
    if (!configObj.name) {
      configObj.name = 'new-repository';
    }

    res.json({ config: configObj });
  } catch (error) {
    console.error('AI Generate Repo Config Error:', error);
    res.status(500).json({ error: 'Failed to generate repository config', details: error.message });
  }
});

module.exports = router;
