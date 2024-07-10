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
import { getUserIdFromToken } from './helper';
import { adminQuizNameUpdate, adminQuizTransfer } from './quiz';
import { clear } from '../src/other.js';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate, adminAuthLogout } from './auth';
import { adminQuizCreate, adminQuizRemove, adminQuizList, adminQuizDescriptionUpdate, adminQuizInfo, adminQuizQuestionCreate, adminQuizTrashView } from './quiz';

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

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token } = req.body;
  const authUserId = getUserIdFromToken(token);

  if (!authUserId) {
    return res.status(401).json(authUserId);
  }

  const result = adminUserDetails(authUserId);
  if ('error' in result) {
    return res.status(401).json(result);
  }

  return res.status(200).json(result);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }
  const result = adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast);

  if ('error' in result) {
    if (result.error === 'invalid userId' || result.error === 'userId does not exist') {
      return res.status(401).json(result);
    } else if ('error' in result) {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const token = req.query.token as string;
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const result = adminQuizRemove(authUserId, quizid);

  if ('error' in result) {
    if (result.error === 'Invalid user id') {
      return res.status(401).json(result);
    } else if (result.error === 'Invalid quiz Id entered' || result.error === 'Quiz Id not owned by the user') {
      return res.status(403).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminUserPasswordUpdate route
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const result = adminUserPasswordUpdate(authUserId, oldPassword, newPassword);
  if ('error' in result) {
    if (result.error === 'invalid userId') {
      return res.status(401).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizList route
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const { token } = req.body;
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }
  const result = adminQuizList(authUserId);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  return res.status(200).json(result);
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
    if (result.error === 'Invalid User id') {
      return res.status(401).json(result);
    } else if (result.error === 'This Quiz Id does not refer to a quiz that this user owns' || result.error === 'Quiz Id not found') {
      return res.status(403).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizNameUpdate server route
app.put('/v1/admin/quiz/:quizid/name', (req : Request, res: Response) => {
  const { token, name } = req.body;
  const quizid = parseInt(req.params.quizid as string);
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }
  const quizNameUpdate = adminQuizNameUpdate(authUserId, quizid, name);
  // Check if the quizNameUpdate contains an error
  if (quizNameUpdate.error) {
    if (quizNameUpdate.error === 'Invalid User id') {
      return res.status(401).json({ error: quizNameUpdate.error });
    } else if (quizNameUpdate.error === 'Quiz Id not owned by the user' || quizNameUpdate.error === 'Invalid Quiz id') {
      return res.status(403).json({ error: quizNameUpdate.error });
    } else if (quizNameUpdate.error === 'Name is already used' ||
      quizNameUpdate.error === 'Name cannot be empty' ||
      quizNameUpdate.error === 'Name is too short' ||
      quizNameUpdate.error === 'Name is too long' ||
      quizNameUpdate.error === 'Quiz name cannot have symbols'
    ) {
      return res.status(400).json({ error: quizNameUpdate.error });
    }
  }

  res.json(quizNameUpdate);
  return res.status(200).json(quizNameUpdate);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminAuthLogout(token);

  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// adminQuizTransfer server route
app.post('/v1/admin/quiz/:quizid/transfer', (req : Request, res: Response) => {
  const { token, email } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }

  const quizTransfer = adminQuizTransfer(authUserId, quizId, email);
  if (quizTransfer.error) {
    if (quizTransfer.error === 'Invalid User id') {
      return res.status(401).json({ error: quizTransfer.error });
    } else if (quizTransfer.error === 'Quiz Id not owned by the user' || quizTransfer.error === 'Invalid Quiz id') {
      return res.status(403).json({ error: quizTransfer.error });
    } else if (quizTransfer.error === 'Target user email is not a real user' ||
      quizTransfer.error === 'Target user email is the same as currently logged in user' ||
      quizTransfer.error === 'Quiz name already in use by target user'
    ) {
      return res.status(400).json({ error: quizTransfer.error });
    }
  }
  return res.status(200).json(quizTransfer);
});

app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminAuthLogout(token);

  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// adminQuizQuestionCreate
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizid = parseInt(req.params.quizid as string);
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const result = adminQuizQuestionCreate(authUserId, quizid, questionBody);
  if ('error' in result) {
    if (result.error === 'Invalid Token') {
      return res.status(401).json(result);
    } else if (result.error === 'Quiz Id not owned by the user' || result.error === 'Quiz does not exist') {
      return res.status(403).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizTrashView

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const check = getUserIdFromToken(token);

  if (typeof check !== 'number') {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }

  const result = adminQuizTrashView(token);
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

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const authUserId = getUserIdFromToken(token);
  if (!authUserId) {
    return res.status(401).json(authUserId);
  }
  const result = adminQuizCreate(authUserId, name, description);
  if ('error' in result) {
    if (result.error === 'UserId doesn\'t exist') {
      return res.status(401).json(result);
    } else if ('error' in result) {
      return res.status(400).json(result);
    }
  }
  return res.json(result);
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
