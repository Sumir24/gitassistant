const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('../modules/auth/auth.routes');

const createServer = () => {
  const app = express();

  // Middleware
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  
  // Session setup (required by Passport for OAuth state)
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_session_secret',
    resave: false,
    saveUninitialized: false
  }));

  // Passport initialization
  app.use(passport.initialize());
  app.use(passport.session());

  // Mount Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/repos', require('../modules/repos/repo.routes'));
  app.use('/api/dashboard', require('../modules/dashboard/dashboard.routes'));
  app.use('/api/ai', require('../modules/ai/ai.routes'));

  // Healthcheck Route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'GitSpeak API is running' });
  });

  return app;
};

module.exports = createServer;
