// Fallback bootstrap for Windows PowerShell environment
require('dotenv/config');
// Register tsx transpilation
require('tsx/cjs');
require('./src/server.ts');
