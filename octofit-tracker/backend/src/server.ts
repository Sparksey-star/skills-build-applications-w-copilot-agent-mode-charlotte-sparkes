import express, { type RequestHandler } from 'express';
import { activity } from './models/activity.js';
import { leaderboard } from './models/leaderboard.js';
import { team } from './models/team.js';
import { user } from './models/user.js';
import { workout } from './models/workout.js';

export const port = Number(process.env.PORT || 8000);
const codespaceName = process.env.CODESPACE_NAME;
export const baseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

const app = express();
const listCollection = (findRecords: () => Promise<unknown[]>): RequestHandler => {
  return async (_request, response, next) => {
    try {
      response.json(await findRecords());
    } catch (error) {
      next(error);
    }
  };
};

app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/users/', listCollection(() => user.find().sort({ displayName: 1 }).lean()));
app.get('/api/teams/', listCollection(() => team.find().sort({ name: 1 }).lean()));
app.get('/api/activities/', listCollection(() => activity.find().sort({ completedAt: -1 }).lean()));
app.get('/api/leaderboard/', listCollection(() => leaderboard.find().sort({ rank: 1 }).lean()));
app.get('/api/workouts/', listCollection(() => workout.find().sort({ title: 1 }).lean()));

app.use(
  (error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error('API request failed:', error);
    response.status(500).json({ error: 'Unable to retrieve the requested data' });
  },
);

export default app;
