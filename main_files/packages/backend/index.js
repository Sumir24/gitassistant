require('dotenv').config();
const http = require('http');
const connectDB = require('./core/db');
const createServer = require('./core/server');

const PORT = process.env.PORT || 4000;

const start = async () => {
  // Connect to MongoDB
  await connectDB();

  // Create Express App
  const app = createServer();
  
  // Create HTTP Server (useful later when we add Socket.io)
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

start();
