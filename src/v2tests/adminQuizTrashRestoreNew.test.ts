import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v2/admin/quiz',
    { headers: { token }, json: { name, description } });
  return JSON.parse(res.body.toString());
};

const moveQuizToTrash = (token: string, quizId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v2/admin/quiz/${quizId}/trash`,
    { headers: { token } });
  return JSON.parse(res.body.toString());
};

const restoreQuiz = (token: string, quizId: number) => {
  const res = request(
    'POST',
      `${SERVER_URL}/v2/admin/quiz/${quizId}/restore`,
      { headers: { token }, json: {} }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
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
      const user = createUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
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
