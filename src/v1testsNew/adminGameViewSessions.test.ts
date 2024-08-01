import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quizId: number, quizId2: number;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
  token = requestAuthRegister('zid@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  quizId = requestCreateQuiz(token, 'valid_name', 'valid_description');
  requestCreateQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, [
    { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
  ]);
  quizId2 = requestCreateQuiz(token, 'valid_name2', 'valid_description2');
  requestCreateQuestion(token, quizId2, 'Who is the Monarch of England2?', 4, 5, [
    { answer: 'Prince Charles2', correct: true }, { answer: 'Queen Elizabeth2', correct: false }
  ]);
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

test('Token is empty or invalid', () => {
  const res = requestViewSessions('', quizId);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(401);
});

test('Valid token but quiz does not exist', () => {
  const res = requestViewSessions(token, quizId + 1);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(403);
});

test('Valid token but user is not an owner of this quiz', () => {
  const token2 = requestAuthRegister('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  const res = requestViewSessions(token2, quizId);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({ error: expect.any(String) });
  expect(res.statusCode).toStrictEqual(403);
});

describe('Success cases', () => {
  let sessionId1: number, sessionId2: number, sessionId3: number, sessionId4: number;

  beforeEach(() => {
    sessionId1 = requestCreateSession(token, quizId, 3);
    sessionId2 = requestCreateSession(token, quizId, 3);
    sessionId3 = requestCreateSession(token, quizId, 3);
    sessionId4 = requestCreateSession(token, quizId, 3);
  });

  test('Success case - active sessions', () => {
    const res = requestViewSessions(token, quizId);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({
      activeSessions: [sessionId1, sessionId2, sessionId3, sessionId4],
      inactiveSessions: []
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('Viewing both active and inactive quizzes', () => {
    requestUpdateStatus(token, quizId, sessionId1, Actions.END);
    requestUpdateStatus(token, quizId, sessionId2, Actions.END);

    const res = requestViewSessions(token, quizId);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({
      activeSessions: [sessionId3, sessionId4],
      inactiveSessions: [sessionId1, sessionId2]
    });
    expect(res.statusCode).toStrictEqual(200);
  });

  test('making sure only quizzes with relevant quizIds are called', () => {
    const sessionId5 = requestCreateSession(token, quizId2, 3);
    const sessionId6 = requestCreateSession(token, quizId2, 3);
    requestUpdateStatus(token, quizId2, sessionId5, Actions.END);

    const res = requestViewSessions(token, quizId2);
    const data = JSON.parse(res.body.toString());

    expect(data).toStrictEqual({
      activeSessions: [sessionId6],
      inactiveSessions: [sessionId5]
    });
    expect(res.statusCode).toStrictEqual(200);
  });
});

/*
 TODO:
 - making sure only quizzes with relevant quizIds are called
 - viewing both active and inactive quizzes
 - sorted in ascending order
*/

// HELPER FUNCTIONS

const requestViewSessions = (token: string, quizid: number) => {
  return (request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/sessions`, {
    headers: { token }, timeout: TIMEOUT_MS
  }));
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  const sessId = (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
  return JSON.parse(sessId.body.toString()).sessionId;
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

const requestCreateQuestion = (token: string, quizid: number, question: string, duration: number, points: number, answers: object) => {
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

const requestUpdateStatus = (token : string, quizId : number, sessionId : number, action : Actions) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    { headers: { token }, json: { quizId, sessionId, action }, timeout: TIMEOUT_MS }
  );

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};
