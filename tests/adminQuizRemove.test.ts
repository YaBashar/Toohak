import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5*1000;

describe('DELETE /v1/admin/quiz/:quizid', () => {
let uid, u2id, qid, q2id;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  uid = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh'}});
  qid = request('POST', SERVER_URL + '/v1/admin/quiz/create', { json: { authUserId: uid.authUserId, name: 'validQuiz', description: 'valid description'}});
  u2id = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5555555@unsw.edu.au', password: 'abs@#$234', nameFirst: 'brim', nameLast: 'johnson'}});  
  q2id = request('POST', SERVER_URL + '/v1/admin/quiz/create', { json: { authUserId: u2id.authUserId, name: 'validQuiz2', description: 'valid description2'}});
});

// test to check if the authUserId is invalid
test('AuthUserId is invalid', () => {
  const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/:quizid', {
    json: {
      authUserId: 'invalidAuthUserId',
      name: 'Sidak',
      description: 'valid description'
    },
    timeout: TIMEOUT_MS
  });
  expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toBe(400);
});

// test to check quiz Id does not refer to a valid quiz
test('Quiz Id does not refer to a valid quiz', () => {
  const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/:quizid', {
    json: {
      authUserId: uid.authUserId,
      quizId: 'invalidQuizId'
    },
    timeout: TIMEOUT_MS
  });
  expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toBe(400);
});
// test to check if quiz ID does not refer to a quiz that this user owns
test('Quiz ID does not refer to a quiz that this user owns', () => {
  const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/:quizid', {
    json: {
      authUserId: u2id.authUserId,
      quizId: qid.quizId
    },
    timeout: TIMEOUT_MS
  });
  expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toBe(400);
});

// test to check if the quiz is removed from the list of quizzes
test('Quiz is removed from the list of quizzes', () => {
  const res = request('DELETE', SERVER_URL + '/v1/admin/quiz/:quizid', {
    json: {
      authUserId: uid.authUserId,
      quizId: qid.quizId
    },
    timeout: TIMEOUT_MS
  });
  expect(JSON.parse(res.body.toString())).toStrictEqual({ 
    quizzes: [
      {
        quizId: q2id.quizId,
        name: 'validQuiz2',
      }
   ] 
    });
  expect(res.statusCode).toBe(200);
  });
});