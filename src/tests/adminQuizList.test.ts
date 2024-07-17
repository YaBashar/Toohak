import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;

// wrapper functions
const quizList = (token: string) => {
  const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
    qs: { token }
  });
  return JSON.parse(res.body.toString());
}

const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }
  });
  return JSON.parse(res.body.toString());
}

const createQuiz = (token: string, name: string, description: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
  });
  return JSON.parse(res.body.toString());
}


beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su')
  token = user.token;
});

describe('GET /v1/admin/quiz/list', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const res = quizList('randomstring');
    expect(res).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
    const res2 = quizList('1');
    expect(res2).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toBe(401);
  });

  test('Logged in user has no quizzes', () => {
    const res = quizList(token);
    expect(res).toStrictEqual(
      {
        quizzes:
        [
        ]
      });
    expect(res.statusCode).toBe(200);
  })

  test('Expected results', () => {
    const quizId = createQuiz(token, 'quiz 1', 'the first quiz')
    const quiz2Id = createQuiz(token, 'quiz 2', 'the second quiz')
    const res = quizList(token);
    expect(res).toStrictEqual(
      {
        quizzes:
        [
          {
            quizId: quizId.quizId,
            name: 'quiz 1'
          },
          {
            quizId: quiz2Id.quizId,
            name: 'quiz 2'
          }
        ]
      });
    expect(res.statusCode).toBe(200);
  });
});
