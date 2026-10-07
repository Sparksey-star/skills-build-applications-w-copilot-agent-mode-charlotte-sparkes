import app, { port } from './server.js';
import { connectDatabase } from './config/database.js';

async function startServer(): Promise<void> {
  await connectDatabase();
  app.listen(port, '0.0.0.0', () => {
    console.log(`Octofit API listening on port ${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start Octofit API:', error);
  process.exitCode = 1;
});
