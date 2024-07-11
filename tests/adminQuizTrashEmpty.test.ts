import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
const emptyTrash = (token: string, quizIds: number[]) => {
  return request('DELETE', `${SERVER_URL}/v1/admin/quiz/trash/empty`, {
    qs: {
      token,
      quizIds: JSON.stringify(quizIds),
    },
    timeout: TIMEOUT_MS
  });
};

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`, { timeout: TIMEOUT_MS });
});

describe('adminQuizTrashEmpty Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let quizId: number;
    let quizId2: number;

    beforeEach(() => {
      const user = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'user@unsw.edu.au',
          password: '123ABCabc@#$',
          nameFirst: 'John',
          nameLast: 'Doe'
        },
        timeout: TIMEOUT_MS
      });
      token = JSON.parse(user.body.toString()).token;

      const quiz = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Quiz Name',
          description: 'Description'
        },
        timeout: TIMEOUT_MS
      });
      quizId = JSON.parse(quiz.body.toString()).quizId;

      const quiz2 = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Quiz Name 2',
          description: 'Description 2'
        },
        timeout: TIMEOUT_MS
      });
      quizId2 = JSON.parse(quiz2.body.toString()).quizId;

      request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
        qs: {
          token,
          quizid: quizId
        },
        timeout: TIMEOUT_MS
      });
    });

    test('Deleting quizzes not in the trash', () => {
      const res = emptyTrash(token, [quizId, quizId2]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Some quizzes are not in the trash' });
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Deleting quizzes with an invalid token', () => {
      const res = emptyTrash('invlaid token', [quizId]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Token is empty or invalid' });
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Deleting quizzes not owned by the user', () => {
      const anotherUser = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'anotheruser@unsw.edu.au',
          password: '124ABCabc@#$',
          nameFirst: 'Jane',
          nameLast: 'Smith'
        },
        timeout: TIMEOUT_MS
      });
      const anotherToken = JSON.parse(anotherUser.body.toString()).token;
      const res = emptyTrash(anotherToken, [quizId]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Some quizzes are not owned by the user' });
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('Success Case', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      const user = request('POST', `${SERVER_URL}/v1/admin/auth/register`, {
        json: {
          email: 'user@unsw.edu.au',
          password: '123ABCabc@#$',
          nameFirst: 'John',
          nameLast: 'Doe'
        },
        timeout: TIMEOUT_MS
      });
      token = JSON.parse(user.body.toString()).token;

      const quiz = request('POST', `${SERVER_URL}/v1/admin/quiz`, {
        json: {
          token,
          name: 'Quiz Name',
          description: 'Description'
        },
        timeout: TIMEOUT_MS
      });
      quizId = JSON.parse(quiz.body.toString()).quizId;

      request('DELETE', `${SERVER_URL}/v1/admin/quiz/${quizId}`, {
        qs: {
          token,
          quizid: quizId
        },
        timeout: TIMEOUT_MS
      });
    });

    test('Emptying the trash', () => {
      const res = emptyTrash(token, [quizId]);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      expect(res.statusCode).toStrictEqual(200);
    });

    test('Checking that trash is empty', () => {
      emptyTrash(token, [quizId]);
      const res = requestViewTrash(token);
      const data = JSON.parse(res.body.toString());

      expect(data).toStrictEqual({ quizzes: [] });
      expect(res.statusCode).toStrictEqual(200);
    });
  });
});

const requestViewTrash = (token: string) => {
  return (request('GET', SERVER_URL + '/v1/admin/quiz/trash', {
    qs: { token: token }, timeout: TIMEOUT_MS
  }));
};
