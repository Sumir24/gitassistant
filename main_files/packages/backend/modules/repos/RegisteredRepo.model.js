const mongoose = require('mongoose');

const registeredRepoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: false
  },
  githubRepoId: {
    type: Number,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  defaultBranch: {
    type: String,
    default: 'main'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: ''
  },
  topics: [{
    type: String
  }],
  connectedAt: {
    type: Date,
    default: Date.now
  },
  lastIndexedAt: {
    type: Date
  },
  webhookId: {
    type: Number
  },
  settings: {
    digestEnabled: {
      type: Boolean,
      default: true
    },
    aiReviewEnabled: {
      type: Boolean,
      default: true
    }
  }
});

module.exports = mongoose.model('RegisteredRepo', registeredRepoSchema);
