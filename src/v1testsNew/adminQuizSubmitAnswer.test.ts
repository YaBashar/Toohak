import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';
import { Answer } from '../interface';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: number;
let sessionId: number;
let playerId: number;
let answerId: number;
let player2Id: number;

// wrapper functions
const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const userLogin = (email: string, password: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const createQuiz = (token: string, name: string, description: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const addQuestion = (token: string, quizId: number, question: string, duration: number, points: number, answers: object, thumbnailUrl: string) => {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizId}/question`, {
    json: {
      token,
      questionBody: {
        question,
        duration,
        points,
        answers,
        thumbnailUrl
      }
    },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const startSession = (quizid: number, token: string, autoStartNum: number) => {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const joinSession = (sessionId: number, name: string) => {
  return (request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name }, timeout: TIMEOUT_MS
  }));
};

const updateState = (quizid: number, sessionid: number, token: string, action: Actions) => {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }, json: { action }, timeout: TIMEOUT_MS
  });
  return JSON.parse(res.body.toString());
};

const submitAnswer = (answerids: number[], playerid: number, questionposition: number) => {
  const res = request('PUT', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/answer`, {
    json: { answerids }, timeout: TIMEOUT_MS
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const quizInfo = (quizid: number, token: string) => {
  const res = request('GET', SERVER_URL + `/v2/admin/quiz/${quizid}`, {
    headers: { token }, json: { quizid }, timeout: TIMEOUT_MS
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // create account and log in
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  token = user.token;
  userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD');

  // create a quiz
  quiz1Id = createQuiz(token, 'quiz 1', 'the first quiz').quizId;

  // add a question to the quiz
  addQuestion(token, quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ],
    'http://google.com/some/image/path.jpg'
  );

  // add a question to the second quiz
  addQuestion(token, quiz1Id, 'What is 1 + 1?', 4, 5,
    [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ],
    'http://google.com/some/image/path.jpg'
  );

  // start session
  sessionId = startSession(quiz1Id, token, 5).sessionId;

  // join session
  const res = joinSession(sessionId, 'amelia');
  playerId = JSON.parse(res.body.toString()).playerId;

  const res2 = joinSession(sessionId, 'steph');
  player2Id = JSON.parse(res2.body.toString()).playerId;

  // change state
  updateState(quiz1Id, sessionId, token, Actions.NEXT_QUESTION); // lobby->question countdown
  updateState(quiz1Id, sessionId, token, Actions.SKIP_COUNTDOWN); // question countdown -> question 1 open

  const quizDetails = quizInfo(quiz1Id, token).body;
  const answer = quizDetails.questions[0].answers.find((answer: Answer) => answer.correct);
  answerId = answer ? answer.answerId : null;
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/player/:playerid/question/:questionposition/answer', () => {
  test('player id does not exist', () => {
    const res = submitAnswer([answerId], 999, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('invalid question position', () => {
    const res = submitAnswer([answerId], playerId, 5);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is on a different question', () => {
    const res = submitAnswer([answerId], playerId, 2);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is in the wrong state', () => {
    updateState(quiz1Id, sessionId, token, Actions.END);
    const res = submitAnswer([answerId], playerId, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('invalid answer id', () => {
    const res = submitAnswer([999], playerId, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('duplicate answer id provided', () => {
    const res = submitAnswer([answerId, answerId], playerId, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('no answer id was submitted', () => {
    const res = submitAnswer([], playerId, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('success case', () => {
    const res = submitAnswer([answerId], playerId, 1);
    expect(res.body).toStrictEqual({});
    expect(res.statusCode).toBe(200);

    const res2 = submitAnswer([answerId], player2Id, 1);
    expect(res2.body).toStrictEqual({});
    expect(res2.statusCode).toBe(200);
  });
});
