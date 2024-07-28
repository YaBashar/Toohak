import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quizId: number;
let sessionId: number;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  token = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  quizId = requestCreateQuiz(token, 'valid_name', 'valid_description');
  createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, [
    { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
  ]);
  sessionId = requestCreateSession(token, quizId, 3);
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

test('Name of user entered is not unique', () => {
  requestPlayerJoin(sessionId, 'first last');
  const res = requestPlayerJoin(sessionId, 'first last');
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({error: expect.any(String)});
  expect(res.statusCode).toStrictEqual(400);
});

test('SessionId does not refer to a valid session', () => {
  const res = requestPlayerJoin(sessionId + 1, 'first last');
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({error: expect.any(String)});
  expect(res.statusCode).toStrictEqual(400);
});

test('Session is not in LOBBY state', () => {
  requestPlayerJoin(sessionId, 'player one');
  requestPlayerJoin(sessionId, 'player two');
  requestPlayerJoin(sessionId, 'player three');

  const res = requestPlayerJoin(sessionId, 'player four');
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({error: expect.any(String)});
  expect(res.statusCode).toStrictEqual(400);
});



// HELPER FUNCTIONS
const requestPlayerJoin = (sessionId: number, name: string) {
  return (request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name }, timeout: TIMEOUT_MS
  }));
}

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  const sessId = (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
  return JSON.parse(sessId.body.toString());
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