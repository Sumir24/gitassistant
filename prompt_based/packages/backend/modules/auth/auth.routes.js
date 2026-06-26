const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');
const User = require('./User.model');

const router = express.Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'dummy_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'dummy_secret';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/api/auth/github/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: GITHUB_CALLBACK_URL,
    scopeSeparator: ' '
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Find existing user or create a new one
      let user = await User.findOne({ githubId: profile.id });
      
      if (!user) {
        user = new User({
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName || profile.username,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
          avatarUrl: profile._json.avatar_url,
          accessToken: accessToken,
          refreshToken: refreshToken
        });
        await user.save();
      } else {
        // Update access token if it changed
        user.accessToken = accessToken;
        if (refreshToken) user.refreshToken = refreshToken;
        await user.save();
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize/Deserialize for sessions (required by Passport, even if we mostly rely on JWT later)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Routes
// 1. Initiate GitHub Login
router.get('/github',
  passport.authenticate('github', { scope: [ 'user:email', 'repo', 'read:org' ] })
);

// 2. GitHub Callback
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${FRONTEND_URL}/login?error=auth_failed` }),
  function(req, res) {
    // Successful authentication, generate JWT
    const token = jwt.sign(
      { id: req.user._id, githubId: req.user.githubId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${FRONTEND_URL}/login?token=${token}`);
  }
);

// 3. Get Current User (Frontend calls this with JWT)
// Note: In a real app, you'd add a verifyToken middleware here
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
