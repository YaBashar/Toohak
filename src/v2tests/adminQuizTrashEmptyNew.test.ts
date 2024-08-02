import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
const emptyTrash = (token: string, quizIds: number[]) => {
  return request('DELETE', `${SERVER_URL}/v2/admin/quiz/trash/empty`, {
    headers: { token },
    qs: {
      quizIds: JSON.stringify(quizIds),
    },
    timeout: TIMEOUT_MS
  });
};

const quizRemove = (token: string, quizId: number) => {
  const res = request(
    'DELETE',
    `${SERVER_URL}/v2/admin/quiz/${quizId}`,
    { headers: { token } }
  );
  return res;
};

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token: string, name: string, description: string) => {
  return (request('POST', SERVER_URL + '/v2/admin/quiz',
    { headers: { token }, json: { name, description }, timeout: TIMEOUT_MS })
  );
};

const requestViewTrash = (token: string) => {
  return (request('GET', SERVER_URL + '/v2/admin/quiz/trash', {
    headers: { token: token }, timeout: TIMEOUT_MS
  }));
};

beforeEach(() => {
  request('DELETE', `${SERVER_URL}/v1/clear`, { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizTrashEmpty Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let quizId: number;
    let quizId2: number;

    beforeEach(() => {
      const user = createUser('user@unsw.edu.au', '123ABCabc@#$', 'John', 'Doe');
      token = JSON.parse(user.body.toString()).token;

      const quiz = createQuiz(token, 'QuizName', 'Description');
      quizId = JSON.parse(quiz.body.toString()).quizId;

      const quiz2 = createQuiz(token, 'QuizName2', 'Description2');
      quizId2 = JSON.parse(quiz2.body.toString()).quizId;

      quizRemove(token, quizId);
    });

    test('Deleting quizzes not in the trash', () => {
      const res = emptyTrash(token, [quizId, quizId2]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Some quizzes are not in the trash' });
      expect(res.statusCode).toStrictEqual(400);
    });

    test('Deleting quizzes with an invalid token', () => {
      const res = emptyTrash('invalid token', [quizId]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Invalid User id' });
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Deleting quizzes not owned by the user', () => {
      const anotherUser = createUser('anotheruser@unsw.edu.au', '124ABCabc@#$', 'Jane', 'Smith');
      const anotherToken = JSON.parse(anotherUser.body.toString()).token;
      const res = emptyTrash(anotherToken, [quizId]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Some quizzes are not owned by the user' });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Deleting quizzes that do not exist', () => {
      const res = emptyTrash(token, [1234321]);
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: 'Some quizzes do not exist' });
      expect(res.statusCode).toStrictEqual(400);
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
