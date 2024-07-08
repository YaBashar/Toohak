import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { adminQuizInfo } from './quiz';
import { clear } from '../src/other.js';
import { getUserIdFromToken } from './helper';
import { adminQuizCreate, adminQuizRemove } from './quiz';
import { adminAuthRegister, adminAuthLogin } from './auth';
import { adminQuizDescriptionUpdate } from './quiz';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const result = echo(req.query.echo as string);
  if ('error' in result) {
    res.status(400);
  }
  return res.json(result);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid as string);

  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json({ error: 'Invalid token' }); // Updated to return a proper JSON object
  }
  const quizInfo = adminQuizInfo(authUserId, quizId);

  if ('error' in quizInfo) {
    if (quizInfo.error === 'Invalid User id') {
      return res.status(401).json(quizInfo);
    } else if (quizInfo.error === 'Invalid Quiz id' || quizInfo.error === 'This Quiz Id does not refer to a quiz that this user owns') {
      return res.status(403).json(quizInfo);
    }
  }
  res.status(200).json(quizInfo);
});

app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const result = (adminAuthRegister(email, password, nameFirst, nameLast));

  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = adminAuthLogin(email, password);

  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }
  const result = adminQuizCreate(authUserId, name, description);
  if ('error' in result) {
    if ( result.error === 'Invalid user id') {
      return res.status(401).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.json(result);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const token = req.query.token as string;  
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }
  const result = adminQuizRemove(authUserId, quizid);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  return res.json(result);
});

// My PUT route for updating quiz description
app.put('/v1/admin/quiz/:quizId/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const { quizId } = req.params;
  const authUserId = getUserIdFromToken(token);
  const quizIdNum = parseInt(quizId);
  if (isNaN(quizIdNum)) {
    return res.status(400).json({ error: 'Invalid Quiz id' });
  }
  const result = adminQuizDescriptionUpdate(authUserId, quizIdNum, description);
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.status(404).json({ error });
});

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
