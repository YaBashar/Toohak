import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quizId: number;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  token = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  quizId = requestCreateQuiz(token, 'valid_name', 'valid_description');

  createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, [
    { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
  ]);
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

test('Token is empty or invalid', () => {
  const res = requestCreateSession('invalid token', quizId, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(401);
});

test('Valid token but user is not owner of the quiz', () => {
  const token2 = requestAuthRegister('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  const res = requestCreateSession(token2, quizId, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(403);
});

test('Valid token is provided but quiz doesnt exist', () => {
  const res = requestCreateSession(token, quizId + 1, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(403);
});

test('autoStartNum is a number greater than 50', () => {
  const res = requestCreateSession(token, quizId, 53);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(400);
});

test('10 sessions that are not in END state currently exist for this quiz', () => {
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);
  requestCreateSession(token, quizId, 3);

  const res = requestCreateSession(token, quizId, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(400);
});

test('The quiz does not have any questions in it', () => {
  const quizId2 = requestCreateQuiz(token, 'valid_name2', 'valid_description2');

  const res = requestCreateSession(token, quizId2, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(400);
});

test('The quiz is in trash', () => {
  requestQuizDelete(token, quizId);

  const res = requestCreateSession(token, quizId, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(400);
});

test('Correct return object in success case', () => {
  const res = requestCreateSession(token, quizId, 3);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ sessionId: expect.any(Number) });
  expect(res.statusCode).toStrictEqual(200);
});

// HELPER FUNCTIONS
const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
};

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const uid = (request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  }));
  return JSON.parse(uid.body.toString()).token;
};

const requestCreateQuiz = (token: string, name : string, description : string) => {
  const quiz = (request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }, timeout: TIMEOUT_MS
  }));
  return JSON.parse(quiz.body.toString()).quizId;
};

const createQuizQuestion = (token: string, quizid: number, question: string, duration: number, points: number, answers: object) => {
  return request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
    json: {
      token,
      questionBody: {
        question,
        duration,
        points,
        answers
      }
    }
  });
};

const requestQuizDelete = (token: string, quizId: number) => {
  return (request('DELETE', SERVER_URL + `/v1/admin/quiz/${quizId}`, {
    qs: { token: token }, timeout: TIMEOUT_MS
  }));
};
