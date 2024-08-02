import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// helper functions

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

const startSession = (quizid: number, token: string, autoStartNum: number) => {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
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

const updateState = (quizid: number, sessionid: number, token: string, action: Actions) => {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }, json: { action }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const quizSessionFinalResultCSV = (token: string, quizid: number, sessionid: number) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}/results/csv`, {
    headers: { token }, timeout: TIMEOUT_MS
  });
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('GET /v1/admin/quiz/:quizid/session/:sessionid/results', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  beforeEach(() => {
    token = requestAuthRegister('z5525050@unsw.edu.au', '123ABCabc!@#', 'sidak', 'singh');
    quizId = requestCreateQuiz(token, 'quiz1', 'quiz description');
    createQuizQuestion(token, quizId, 'What is 1 + 1?', 4, 5, [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ]);
    sessionId = startSession(quizId, token, 3).sessionId;
  });

  test('SessionId does not refer to a valid session', () => {
    const res = quizSessionFinalResultCSV(token, quizId, sessionId + 1);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const res = quizSessionFinalResultCSV(token, quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Token is empty', () => {
    const res = quizSessionFinalResultCSV('', quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Token is invalid', () => {
    const res = quizSessionFinalResultCSV('invalid token', quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz does not exist', () => {
    const res = quizSessionFinalResultCSV(token, quizId + 1, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test('User is not the owner of the quiz', () => {
    const token2 = requestAuthRegister('z5555555@unsw.edu.au', 'AAA123!@#b', 'veer', 'sheth');
    const res = quizSessionFinalResultCSV(token2, quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });
  // success case
  test('Success Case', () => {
    // Move session to FINAL_RESULTS state
    updateState(quizId, sessionId, token, Actions.GO_TO_FINAL_RESULTS);

    // Call the function to get the CSV result
    const res = quizSessionFinalResultCSV(token, quizId, sessionId);
    expect(res).toHaveProperty('url');
    expect(typeof res.url).toBe('string');
  });
});
