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
import { clear } from '../src/other';
import {
  adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate,
  adminUserPasswordUpdate, adminAuthLogout
} from './auth';

import {
  adminQuizCreate, adminQuizRemove, adminQuizList, adminQuizDescriptionUpdate,
  adminQuizInfo, adminQuizTrashEmpty, adminQuizTrashRestore, adminQuizTrashView, adminQuizNameUpdate,
  adminQuizTransfer
} from './quiz';

import {
  adminQuizQuestionCreate, adminQuizQuestionDelete,
  adminQuizQuestionMove, adminQuizQuestionUpdate, adminQuizQuestionDuplicate
} from './question';

// Set up app
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
app.use('/docs', sui.serve, sui.setup(YAML.parse(file),
  { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

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

// clear
app.delete('/v1/clear', (req: Request, res: Response) => {
  const result = clear();
  if ('error' in result) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// adminAuthRegister
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  try {
    const token = adminAuthRegister(email, password, nameFirst, nameLast);
    res.json({ token: token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// adminAuthLogin
app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const token = adminAuthLogin(email, password);
    res.json({ token: token });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// adminQuizTrashView
app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const check = getUserIdFromToken(token);

  if (check === -1) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }
  const result = adminQuizTrashView(token);
  return res.json(result);
});

// adminAuthUserDetails
app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const userId = getUserIdFromToken(token);
  try {
    res.json(adminUserDetails(userId));
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

// adminAuthUpdateUserDetails
app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const { token, email, nameFirst, nameLast } = req.body;
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'invalid token' });
  }
  const result = adminUserDetailsUpdate(userId, email, nameFirst, nameLast);

  if ('error' in result) {
    if (result.error === 'invalid userId' ||
      result.error === 'userId does not exist') {
      return res.status(401).json(result);
    } else if ('error' in result) {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizRemove
app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizid = parseInt(req.params.quizid as string);
  const token = req.query.token as string;
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const result = adminQuizRemove(userId, quizid);

  if ('error' in result) {
    if (result.error === 'Invalid user id') {
      return res.status(401).json(result);
    } else if (result.error === 'Invalid quiz Id entered' ||
      result.error === 'Quiz Id not owned by the user') {
      return res.status(403).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminUserPasswordUpdate
app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const result = adminUserPasswordUpdate(userId, oldPassword, newPassword);
  if ('error' in result) {
    if (result.error === 'invalid userId') {
      return res.status(401).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizList
app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'invalid user id' });
  }
  const result = adminQuizList(userId);
  if ('error' in result) {
    return res.status(401).json(result);
  }
  return res.status(200).json(result);
});

// adminQuizDescriptionUpdate
app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const { token, description } = req.body;
  const { quizid } = req.params;
  const quizIdNum = parseInt(quizid, 10);
  if (isNaN(quizIdNum)) {
    return res.status(400).json({ error: 'Invalid Quiz id' });
  }
  const userId = getUserIdFromToken(token);
  const result = adminQuizDescriptionUpdate(userId, quizIdNum, description);
  if ('error' in result) {
    if (result.error === 'Invalid User id') {
      return res.status(401).json(result);
    } else if (result.error === 'This Quiz Id does not refer to a quiz that this user owns' ||
               result.error === 'Quiz Id not found') {
      return res.status(403).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json({});
});

// adminQuizNameUpdate
app.put('/v1/admin/quiz/:quizid/name', (req : Request, res: Response) => {
  const { token, name } = req.body;
  const quizid = parseInt(req.params.quizid as string);
  const userId = getUserIdFromToken(token);

  try {
    const quizNameUpdate = adminQuizNameUpdate(userId, quizid, name);
    res.json(quizNameUpdate);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid User id') {
        return res.status(401).json({ error: error.message });
      } else if (error.message === 'Quiz Id not owned by the user' ||
        error.message === 'Invalid Quiz id') {
        return res.status(403).json({ error: error.message });
      } else if (error.message === 'Name is already used' ||
        error.message === 'Name cannot be empty' ||
        error.message === 'Name is too short' ||
        error.message === 'Name is too long' ||
        error.message === 'Quiz name cannot have symbols'
      ) {
        return res.status(400).json({ error: error.message });
      }
    }
  }
});

// adminQuizQuestionMove
app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const { token, newPosition } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const userId = getUserIdFromToken(token);

  if (userId === -1) {
    return res.status(401).json({ error: 'invalid token' });
  } else if (!quizId) {
    return res.status(403).json({ error: 'quiz does not exist for this user' });
  } else if (!questionId) {
    return res.status(400).json({ error: 'question id does not exist in this quiz' });
  }

  const result = adminQuizQuestionMove(userId, quizId, questionId, newPosition);

  if ('error' in result) {
    if (result.error === 'invalid token') {
      return res.status(401).json(result);
    } else if (result.error === 'quiz does not exist for this user') {
      return res.status(403).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizQuestionUpdate
app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizid = parseInt(req.params.quizid as string);
  const questionid = parseInt(req.params.questionid as string);
  const userId = getUserIdFromToken(token);

  if (userId === -1) {
    return res.status(401).json({ error: 'invalid token' });
  }
  if (!quizid) {
    return res.status(403).json({ error: 'quiz does not exist for this user' });
  }
  if (!questionid) {
    return res.status(400).json({ error: 'question id does not exist in this quiz' });
  }
  const result = adminQuizQuestionUpdate(userId, quizid, questionid, questionBody);

  if ('error' in result) {
    if (result.error === 'quiz does not exist for this user') {
      return res.status(403).json(result);
    } else if (result.error === 'invalid token' || result.error === 'empty token') {
      return res.status(401).json(result);
    } else if ('error' in result) {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminAuthLogout
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const { token } = req.body;
  const result = adminAuthLogout(token);

  if ('error' in result) {
    return res.status(401).json(result);
  }

  res.json(result);
});

// adminQuizTrashEmpty
app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizids = JSON.parse(req.query.quizIds as string);
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Token is empty or invalid' });
  }
  const result = adminQuizTrashEmpty(userId, quizids);
  if ('error' in result) {
    if (result.error === 'Some quizzes do not exist') {
      return res.status(400).json({ error: result.error });
    } else if (result.error === 'Some quizzes are not in the trash') {
      return res.status(400).json({ error: result.error });
    } else if (result.error === 'Some quizzes are not owned by the user') {
      return res.status(403).json({ error: result.error });
    } else {
      return res.status(400).json({ error: 'Unknown error' });
    }
  }
  return res.status(200).json({});
});

// adminQuizTransfer
app.post('/v1/admin/quiz/:quizid/transfer', (req : Request, res: Response) => {
  const { token, email } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'invalid token' });
  }

  const quizTransfer = adminQuizTransfer(userId, quizId, email);
  if (quizTransfer.error) {
    if (quizTransfer.error === 'Invalid User id') {
      return res.status(401).json({ error: quizTransfer.error });
    } else if (quizTransfer.error === 'Quiz Id not owned by the user' ||
      quizTransfer.error === 'Invalid Quiz id') {
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

// adminQuizQuestionCreate
app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const { token, questionBody } = req.body;
  const quizid = parseInt(req.params.quizid as string);
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
  const result = adminQuizQuestionCreate(userId, quizid, questionBody);
  if ('error' in result) {
    if (result.error === 'Invalid Token') {
      return res.status(401).json(result);
    } else if (result.error === 'Quiz Id not owned by the user' ||
      result.error === 'Quiz does not exist') {
      return res.status(403).json(result);
    } else {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizQuestiondDuplicate
app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizId = parseInt(req.params.quizid as string);
  const questionId = parseInt(req.params.questionid as string);
  const userId = getUserIdFromToken(token);

  try {
    const result = adminQuizQuestionDuplicate(userId, quizId, questionId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error caught in route:', error);
    if (error instanceof Error) {
      if (error.message === 'Invalid User id') {
        return res.status(401).json({ error: error.message });
      } else if (error.message === 'Invalid Quiz id') {
        return res.status(403).json({ error: error.message });
      } else if (error.message === 'Quiz Id not owned by the user') {
        return res.status(403).json({ error: error.message });
      } else if (error.message === 'Question id does not refer to valid question in quiz') {
        return res.status(400).json({ error: error.message });
      }
    }
  }
});

// adminQuizInfo
app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizId = parseInt(req.params.quizid as string);

  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Invalid token' }); // Updated to return a proper JSON object
  }

  try {
    const quizInfo = adminQuizInfo(userId, quizId);
    res.status(200).json(quizInfo);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid User id') {
        return res.status(401).json({ error: error.message });
      } else if (error.message === 'Invalid Quiz id' ||
        error.message === 'This Quiz Id does not refer to a quiz that this user owns') {
        return res.status(403).json({ error: error.message });
      }
    }
  }
});

// adminQuizCreate
app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const result = adminQuizCreate(userId, name, description);
  if ('error' in result) {
    if (result.error === 'Invalid token') {
      return res.status(401).json(result);
    } else if ('error' in result) {
      return res.status(400).json(result);
    }
  }
  return res.json(result);
});

// adminQuizQuestionDelete
app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizid = parseInt(req.params.quizid as string);
  const questionid = parseInt(req.params.questionid as string);
  const userId = getUserIdFromToken(token);
  if (userId === -1) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  const result = adminQuizQuestionDelete(userId, quizid, questionid);
  if ('error' in result) {
    if (result.error === 'Invalid Token') {
      return res.status(401).json(result);
    } else if (result.error === 'Quiz Id not owned by the user' ||
      result.error === 'Invalid Quiz Id') {
      return res.status(403).json(result);
    } else if (result.error === 'Invalid Question Id') {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json(result);
});

// adminQuizTrashRestore
app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const { token } = req.body;
  const quizid = parseInt(req.params.quizid as string, 10);
  const userId = getUserIdFromToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'invalid token' });
  }
  const result = adminQuizTrashRestore(userId, quizid);
  if ('error' in result) {
    if (result.error === 'invalid token') {
      return res.status(401).json(result);
    } else if (result.error === 'quiz does not exist for this user' || result.error === 'Quiz Id not owned by the user') {
      return res.status(403).json(result);
    } else if (result.error === 'Quiz ID refers to a quiz that is not currently in the trash') {
      return res.status(400).json(result);
    }
  }
  return res.status(200).json({});
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
