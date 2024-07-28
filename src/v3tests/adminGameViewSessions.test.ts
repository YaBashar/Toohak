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
  const res = requestViewSessions('', quizId);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({error: expect.any(String)});
  expect(res.statusCode).toStrictEqual(401);
})

test('Valid token but quiz does not exist', () => {
  const res = requestViewSessions(token, quizId + 1);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({error: expect.any(String)});
  expect(res.statusCode).toStrictEqual(403);
})

test('Valid token but user is not an owner of this quiz', () => {
  const token2 = requestAuthRegister('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
  const res = requestViewSessions(token2, quizId);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({error: expect.any(String)});
  expect(res.statusCode).toStrictEqual(403);
})

test('Success case - active sessions', () => {
  const sessionId1 = requestCreateSession(token, quizId, 3);
  const sessionId2 = requestCreateSession(token, quizId, 3);
  const sessionId3 = requestCreateSession(token, quizId, 3);
  const sessionId4 = requestCreateSession(token, quizId, 3);

  const res = requestViewSessions(token, quizId);
  const data = JSON.parse(res.body.toString());

  expect(data).toStrictEqual({
    activeSessions: [sessionId1, sessionId2, sessionId3, sessionId3, sessionId4],
    inactiveSessions: []
  });
  expect(res.statusCode).toStrictEqual(200);
});

/*
 TODO:
 - making sure only quizzes with relevant quizIds are called 
 - viewing both active and inactive quizzes
 - sorted in ascending order
*/

// HELPER FUNCTIONS

const requestViewSessions = (token: string, quizid: number) => {
  return(request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/sessions`, {
    headers: { token }, timeout: TIMEOUT_MS
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
