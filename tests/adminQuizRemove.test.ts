import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('DELETE /v1/admin/quiz/:quizid', () => {
  let token1: string;
  let token2: string;
  let qid: {quizId: number};
  let q2id: {quizId: number};

  beforeEach(() => {
    const uid1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
    token1 = JSON.parse(uid1.body.toString()).token;
    let response = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token1, name: 'validQuiz', description: 'valid description' } });
    qid = JSON.parse(response.body.toString());

    const uid2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5555555@unsw.edu.au', password: 'abs@#$234', nameFirst: 'brim', nameLast: 'johnson' } });
    token2 = JSON.parse(uid2.body.toString()).token;
    response = request('POST', SERVER_URL + '/v1/admin/quiz', { json: { token: token2, name: 'validQuiz2', description: 'valid description2' } });
    q2id = JSON.parse(response.body.toString());
  });

  // test to check if the authUserId is invalid
  test('AuthUserId is invalid', () => {
    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId}`, {
      qs: {
        token: 'invalidAuthUserId',
        quizid: qid.quizId,
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // test to check quiz Id does not refer to a valid quiz
  test('Quiz Id does not refer to a valid quiz', () => {
    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId + 1}`, {
      qs: {
        token: token1,
        quizid: qid.quizId + 1,
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // test to check if quiz ID does not refer to a quiz that this user owns
  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${q2id.quizId}`, {
      qs: {
        token: token1,
        quizid: qid.quizId,
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // test to check if the quiz is removed from the list of quizzes
  test('Quiz is removed from the list of quizzes', () => {
    let res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId}`, {
      qs: {
        token: token1,
      },
      timeout: TIMEOUT_MS
    });
    res = request('GET', SERVER_URL + '/v1/admin/quiz/list', {
      json: {
        token: token1,
      },
      timeout: TIMEOUT_MS
    });
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: [

      ]
    });
    expect(res.statusCode).toBe(200);
  });
});
