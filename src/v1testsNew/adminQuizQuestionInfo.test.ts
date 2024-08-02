import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: number;
let sessionId: number;
let playerId: number;
let questionid: number;

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
  const res = request('POST', `${SERVER_URL}/v2/admin/quiz/${quizId}/question`, {
    headers: { token },
    json: {
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

const questionInfo = (playerid: number, questionposition: number) => {
  const res = request('GET', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}`, {
    timeout: TIMEOUT_MS
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // Create account and log in
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  token = user.token;
  userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD');

  // Create a quiz
  quiz1Id = createQuiz(token, 'quiz 1', 'the first quiz').quizId;

  // Add questions to the quiz
  const question = addQuestion(token, quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ],
    'http://google.com/some/image/path.jpg'
  );

  questionid = question.questionId;

  addQuestion(token, quiz1Id, 'What is 1 + 1?', 4, 5,
    [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ],
    'http://google.com/some/image/path.jpg'
  );

  // Start session
  sessionId = startSession(quiz1Id, token, 5).sessionId;

  // Join session
  const res = joinSession(sessionId, 'amelia');
  playerId = JSON.parse(res.body.toString()).playerId;

  // Change state
  updateState(quiz1Id, sessionId, token, Actions.NEXT_QUESTION); // lobby->question countdown
  updateState(quiz1Id, sessionId, token, Actions.SKIP_COUNTDOWN); // question countdown -> question 1 open
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('GET /v1/player/:playerid/question/:questionposition', () => {
  test('player id does not exist', () => {
    const res = questionInfo(999, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('invalid question position', () => {
    const res = questionInfo(playerId, 5);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is on a different question', () => {
    const res = questionInfo(playerId, 2);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is in the wrong state', () => {
    updateState(quiz1Id, sessionId, token, Actions.END);
    const res = questionInfo(playerId, 1);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('success case', () => {
    const res = questionInfo(playerId, 1);
    expect(res.body).toStrictEqual({
      questionId: questionid,
      question: 'Who is the Monarch of England?',
      duration: 4,
      thumbnailUrl: 'http://google.com/some/image/path.jpg',
      points: 5,
      answers: [
        {
          answerId: expect.any(Number),
          answer: 'Prince William',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Prince Charles',
          colour: expect.any(String)
        },
        {
          answerId: expect.any(Number),
          answer: 'Prince Beckham',
          colour: expect.any(String)
        }
      ]
    });
    expect(res.statusCode).toBe(200);
  });
});
