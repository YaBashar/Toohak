import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('GET /v1/admin/quiz/list', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: {authUserId: 'randomstring'} });
    expect(JSON.parse(res.body.toString())).toStrictEqual({error: 'invalid user id'});

    const res2 = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: {authUserId: '1'} });
    expect(JSON.parse(res2.body.toString())).toStrictEqual({error: 'invalid user id'});
  });

  test('Expected results', () => {
    const user = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: {email: 'amelia@unsw.edu.au', password: 'abcd1234!@#$ABCD', nameFirst: 'amelia', nameLast: 'su'}});
    const id = JSON.parse(user.body.toString()).authUserId;   
    const quiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: {authUserId: id, name: 'quiz 1', description: 'the first quiz'} });
    const quiz = request('POST', SERVER_URL + '/v1/admin/quiz', { json: {authUserId: id, name: 'quiz 2', description: 'the second quiz'} });
    const res = request('GET', SERVER_URL + '/v1/admin/quiz/list', { json: {authUserId: id} });
    expect(JSON.parse(res.body.toString())).toStrictEqual(
      { quizzes: [
        {
          quizId: quiz,
          name: 'quiz 1'
        },
        {
          quizId: quiz2,
          name: 'quiz 2'
        }
      ]
    })
  });
});