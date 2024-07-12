import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('GET /v1/admin/quiz/list', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: { authUserId: 'randomstring' } });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid user id' });
    expect(res.statusCode).toBe(401);
    const res2 = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: { authUserId: '1' } });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: 'invalid user id' });
    expect(res.statusCode).toBe(401);
  });

  test('Expected results', () => {
    const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su' } });
    token = JSON.parse(user.body.toString()).token;
    const quiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name: 'quiz 1', description: 'the first quiz' } });
    const quizId = JSON.parse(quiz.body.toString());
    const quiz2 = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token, name: 'quiz 2', description: 'the second quiz' } });
    const quiz2Id = JSON.parse(quiz2.body.toString());
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token } });
    expect(JSON.parse(res.body.toString())).toStrictEqual(
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
