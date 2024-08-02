import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('Testing error cases', () => {
  let token: string;

  beforeEach(() => {
    token = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  });

  test('Token is empty', () => {
    const res = requestViewTrash('');
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Token is invalid', () => {
    const res = requestViewTrash(token + 1);
    const data = JSON.parse(res.body.toString());
    expect(data).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });
});

describe('Testing success cases', () => {
  let token: string, quizId: number;

  beforeEach(() => {
    token = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
    quizId = requestCreateQuiz(token, 'valid_name', 'valid_description');
  });

  test('Views empty trash', () => {
    const res = requestViewTrash(token);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({ quizzes: [] });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Views non-empty trash', () => {
    requestQuizDelete(token, quizId);

    const res = requestViewTrash(token);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({
      quizzes: [
        {
          quizId: quizId,
          name: 'valid_name'
        }
      ]
    });

    expect(res.statusCode).toStrictEqual(200);
  });
});

const requestViewTrash = (token: string) => {
  return (request('GET', SERVER_URL + '/v2/admin/quiz/trash', {
    headers: { token: token }, timeout: TIMEOUT_MS
  }));
};

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const user = (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));

  return JSON.parse(user.body.toString()).token;
};

const requestCreateQuiz = (token: string, name : string, description : string) => {
  const quiz = (request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: { token }, json: { name, description }, timeout: TIMEOUT_MS
  }));

  return JSON.parse(quiz.body.toString()).quizId;
};

const requestQuizDelete = (token: string, quizId: number) => {
  return (request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizId}`, {
    headers: { token: token }, timeout: TIMEOUT_MS
  }));
};
