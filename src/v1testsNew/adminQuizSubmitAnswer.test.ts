import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: number;
let quiz2Id: number;
let question1Quiz1Id: number;
let question1Quiz2Id: number;
let randomToken: number;
let randomQuizId: number;
let sessionId: number;
let playerId: number;
let answerId: number;

// wrapper functions
const createUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst, nameLast }
  });
  return JSON.parse(res.body.toString());
};

const userLogin = (email: string, password: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/auth/login', {
    json: { email, password }
  });
  return JSON.parse(res.body.toString());
};

const createQuiz = (token: string, name: string, description: string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
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
    }
  });
  return JSON.parse(res.body.toString());
};

const questionInfo = (playerid: number, questionposition: number) => {
  const res = request('GET', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}`, {
    json: {
        playerid,
        questionposition
    }
  })
return JSON.parse(res.body.toString());};

const startSession = (quizid: number, token: string, autoStartNum: number) => {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum }
  })
return JSON.parse(res.body.toString());}

const joinSession = (sessionid: number, name: string) => {
  const res = request('POST', `${SERVER_URL}/v1/player/join`, {
    json: {
      sessionid,
      name
    }
  })
return JSON.parse(res.body.toString());};

const sessionState = (quizid: number, sessionid: number, token: string) => {
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }
  })
return JSON.parse(res.body.toString());};

const updateState = (quizid: number, sessionid: number, token: string, action: Actions) => {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }, json: { action }
  })
return JSON.parse(res.body.toString());};

const questionResult = (playerid: number, questionposition: number) => {
  const res = request('GET', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/results`)
return JSON.parse(res.body.toString());};

const submitAnswer = (answerids: [number], playerid: number, questionposition: number) => {
  const res = request('PUT', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/answer`, {
    json: { answerids }
  })
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

beforeEach(() => {
  // Clear data before each test
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // Create account and log in
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  token = user.token;

  // Log in to get the token
  const loginRes = userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD');
  token = loginRes.token;

  // Create a quiz
  const quiz1 = createQuiz(token, 'quiz 1', 'the first quiz');
  quiz1Id = quiz1.quizId;

  // Add a question to the quiz
  const question1Quiz1 = addQuestion(token, quiz1Id, 'Who is the Monarch of England?', 4, 5, [
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Charles', correct: true },
    { answer: 'Prince Beckham', correct: false },
  ], 'http://google.com/some/image/path.jpg');
  question1Quiz1Id = question1Quiz1.questionId;

  // Create a second quiz
  const quiz2 = createQuiz(token, 'quiz 2', 'the second quiz');
  quiz2Id = quiz2.quizId;

  // Add a question to the second quiz
  const question1Quiz2 = addQuestion(token, quiz2Id, 'What is 1 + 1?', 4, 5, [
    { answer: '4', correct: false },
    { answer: '2', correct: true },
    { answer: '11', correct: false },
  ], 'http://google.com/some/image/path.jpg');
  question1Quiz2Id = question1Quiz2.questionId;

  // Start a session for the first quiz
  const sessionRes = startSession(quiz1Id, token, 5);
  sessionId = sessionRes.sessionId;

  // Join the session
  const joinRes = joinSession(sessionId, 'amelia');
  playerId = joinRes.playerId;

  // Update the session state to open the first question
  updateState(quiz1Id, sessionId, token, Actions.NEXT_QUESTION); // LOBBY -> QUESTION_COUNTDOWN
  updateState(quiz1Id, sessionId, token, Actions.SKIP_COUNTDOWN); // QUESTION_COUNTDOWN -> QUESTION_OPEN

  // Log the sessionId and playerId for debugging
  console.log('Session ID:', sessionId);
  console.log('Player ID:', playerId);
});


describe('PUT /v1/player/:playerid/question/:questionposition/answer', () => {
  test('player id does not exist', () => {
    const res = submitAnswer([answerId], 999, 1)
    console.log(res.body);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test.only('invalid question position', () => {
    const res = submitAnswer([answerId], playerId, 5)
    console.log(res.body);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is on a different question', () => {
    const res = submitAnswer([answerId], playerId, 2)
    console.log(res.body);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is in the wrong state', () => {
    updateState(quiz1Id, sessionId, token, Actions.END)
    const res = submitAnswer([answerId], playerId, 1)
    console.log(res.body);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('invalid answer id', () => {
    const res = submitAnswer([999], playerId, 2)
    console.log(res.body);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('duplicate answer id provided', () => {
    const res = submitAnswer([answerId], playerId, 2)
    console.log(res.body);
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // test('no answer id was submitted', () => {
  //   const res = submitAnswer([], playerId, 2)
  //   expect(res.body).toStrictEqual({ error: expect.any(String) });
  //   expect(res.statusCode).toBe(400);
  // });

  test('success case', () => {
    const res = submitAnswer([answerId], playerId, 1)
    expect(res.body).toStrictEqual({ 
      questionId: question1Quiz1Id,
      playersCorrectList: [
        expect.any(String)
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number)
     });
    expect(res.statusCode).toBe(200);
  });
});