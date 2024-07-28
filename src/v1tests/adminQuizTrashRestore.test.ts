import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const createQuiz = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description } });
  return JSON.parse(res.body.toString());
};

const moveQuizToTrash = (token: string, quizId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/trash`,
    { json: { token } });
  return JSON.parse(res.body.toString());
};

const restoreQuiz = (token: string, quizId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/restore`,
    { json: { token } });
  return JSON.parse(res.body.toString());
};

/// /////////////////////////////////////////////////////////////
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear');
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizTrashRestore Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: { email: 'user@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'Test', nameLast: 'User' }
      });
      token = JSON.parse(user.body.toString()).token;
      const createdQuiz = createQuiz(token, 'Test Quiz', 'Test Description');
      quizId = createdQuiz.quizId;
      moveQuizToTrash(token, quizId);
    });

    test('Token is empty', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token: '' } });
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    });

    test('Token is invalid', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token: 'invalid_token' } });
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz ID does not exist', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 2}/restore`, { json: { token } });
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    });

    test('Quiz ID refers to a quiz that is not currently in the trash', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId + 1}/restore`, { json: { token } });
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    });
  });

  describe('Success Cases', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      const user = request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: { email: 'user@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'Test', nameLast: 'User' }
      });
      token = JSON.parse(user.body.toString()).token;
      const createdQuiz = createQuiz(token, 'Test Quiz', 'Test Description');
      quizId = createdQuiz.quizId;
      moveQuizToTrash(token, quizId);
    });

    test('Restore a quiz from the trash', () => {
      const res = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/restore`, { json: { token } });
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('Verify quiz is restored and active', () => {
      restoreQuiz(token, quizId);
      const quizList = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
      expect(JSON.parse(quizList.body.toString())).toStrictEqual({
        quizzes: [
          {
            quizId: quizId,
            name: 'Test Quiz'
          }
        ]
      });
    });
  });
});
