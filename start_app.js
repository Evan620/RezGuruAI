const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("Starting RezGuruAI application...");

// Ensure we're in the right directory
const appDir = path.join(__dirname, 'RezGuruAI');
process.chdir(appDir);

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.error('Error: .env file not found!');
  process.exit(1);
}

// Load environment variables from .env file
require('dotenv').config();

console.log("Environment variables loaded.");
console.log("DATABASE_URL is set:", !!process.env.DATABASE_URL);
console.log("AZURE_OPENAI_API_KEY is set:", !!process.env.AZURE_OPENAI_API_KEY);
console.log("SESSION_SECRET is set:", !!process.env.SESSION_SECRET);

// Start the application
const appProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: process.env
});

appProcess.on('error', (err) => {
  console.error('Failed to start application:', err);
});

appProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`Application exited with code ${code} and signal ${signal}`);
  }
});

console.log("Application started on port 5000");