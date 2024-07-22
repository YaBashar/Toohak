import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// wrapper function

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
}

const createQuiz = (token : string, name : string, description : string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
  });
  return JSON.parse(res.body.toString());
};

const quizList = (token: string) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/list`,
    { qs: { token } }
  );
  return res;
}

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('POST /v1/admin/quiz', () => {
  let token: string;

  beforeEach(() => {
    const user1 = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
    token = JSON.parse(user1.body.toString()).token;
  });

  test('Token is invalid', () => {
    const res = createQuiz('invaliduserId', 'Sidak', 'valid description');
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Token is empty', () => {
    const res = createQuiz('', 'Sidak', 'valid description');
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Name contains invalid characters', () => {
    const res = createQuiz(token, 'sid!ak', 'valid description');
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Name is too short', () => {
    const res = createQuiz(token, 's', 'valid description');
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Name is too long', () => {
    const res = createQuiz(token, 'abcdefghijklmnopqrstuvwxyzabcde', 'valid description');
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Name is already used by current logged in user', () => {
    createQuiz(token, 'Sidak', 'valid description');
    const res = createQuiz(token, 'Sidak', 'description');
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Description is more than 100 characters', () => {
    const longDescription = 'a'.repeat(101);
    const res = createQuiz(token, 'Sidak', longDescription);
    expect(res).toStrictEqual({ error: expect.any(String) });
  });

  test('Successful quiz creation returns correct object', () => {
    const res = createQuiz(token, 'John', 'toohak quiz');
    expect(res).toStrictEqual({ quizId: expect.any(Number) });
  });


  test('Quiz created successfully', () => {
    createQuiz(token, 'Quiz 1', 'toohak quiz');
    const res = quizList(token);
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: [
        {
          quizId: expect.any(Number),
          name: 'Quiz 1',
        }
      ]
    });
  });
});

