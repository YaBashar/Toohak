import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';
import { Answer } from '../interface';

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

const requestPlayerJoin = (sessionId: number, name: string) => {
  return (request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name }, timeout: TIMEOUT_MS
  }));
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

const submitAnswer = (answerids: number[], playerid: number, questionposition: number) => {
  const res = request('PUT', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/answer`, {
    json: { answerids }, timeout: TIMEOUT_MS
  });
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const quizSessionFinalResult = (token: string, quizid: number, sessionid: number) => {
  return request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}/results`, {
    headers: { token }, timeout: TIMEOUT_MS
  });
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

/// /////////////////////////////////////////////////////////////////////////////

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
    const res = quizSessionFinalResult(token, quizId, sessionId + 1);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Session is not in FINAL_RESULTS state', () => {
    const res = quizSessionFinalResult(token, quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(400);
  });

  test('Token is empty', () => {
    const res = quizSessionFinalResult('', quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Token is invalid', () => {
    const res = quizSessionFinalResult('invalid token', quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(401);
  });

  test('Quiz does not exist', () => {
    const res = quizSessionFinalResult(token, quizId + 1, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  test('User is not the owner of the quiz', () => {
    const token2 = requestAuthRegister('z5555555@unsw.edu.au', 'AAA123!@#b', 'veer', 'sheth');
    const res = quizSessionFinalResult(token2, quizId, sessionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toStrictEqual(403);
  });

  // success cases
  test('Success case', () => {
    const res = requestPlayerJoin(sessionId, 'Hayden');
    const playerId = JSON.parse(res.body.toString()).playerId;
    createQuizQuestion(token, quizId, 'What is 1 + 1?', 4, 5, [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ]);
    updateState(quizId, sessionId, token, Actions.NEXT_QUESTION);
    updateState(quizId, sessionId, token, Actions.SKIP_COUNTDOWN);
    const quizInformation = quizInfo(quizId, token).body;
    const correctAnswer = quizInformation.questions[0].answers.find((ans: Answer) => ans.correct);
    submitAnswer([correctAnswer.answerId], playerId, 1);
    updateState(quizId, sessionId, token, Actions.GO_TO_ANSWER);
    updateState(quizId, sessionId, token, Actions.GO_TO_FINAL_RESULTS);
    const res2 = quizSessionFinalResult(token, quizId, sessionId);
    expect(JSON.parse(res2.body.toString())).toStrictEqual({
      usersRankedByScore: [{ name: 'Hayden', score: 5 }],
      questionResults: [
        {
          questionId: expect.any(Number),
          playersCorrectList: ['Hayden'],
          averageAnswerTime: 0,
          percentCorrect: 100
        }
      ]
    });
  });
  // success case with 3 players
  test('Success case with three players', () => {
    const res1 = requestPlayerJoin(sessionId, 'Hayden');
    const playerId1 = JSON.parse(res1.body.toString()).playerId;

    const res2 = requestPlayerJoin(sessionId, 'Alex');
    const playerId2 = JSON.parse(res2.body.toString()).playerId;

    const res3 = requestPlayerJoin(sessionId, 'Sam');
    const playerId3 = JSON.parse(res3.body.toString()).playerId;

    createQuizQuestion(token, quizId, 'What is 1 + 1?', 4, 5, [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ]);

    updateState(quizId, sessionId, token, Actions.NEXT_QUESTION);
    updateState(quizId, sessionId, token, Actions.SKIP_COUNTDOWN);

    const quizInformation = quizInfo(quizId, token).body;
    const correctAnswer = quizInformation.questions[0].answers.find((ans: Answer) => ans.correct);

    submitAnswer([correctAnswer.answerId], playerId1, 1);
    submitAnswer([correctAnswer.answerId], playerId2, 1);
    submitAnswer([correctAnswer.answerId], playerId3, 1);

    updateState(quizId, sessionId, token, Actions.GO_TO_ANSWER);
    updateState(quizId, sessionId, token, Actions.GO_TO_FINAL_RESULTS);

    const resFinal = quizSessionFinalResult(token, quizId, sessionId);
    const finalResult = JSON.parse(resFinal.body.toString());

    expect(finalResult.usersRankedByScore).toStrictEqual([
      { name: 'Hayden', score: 5 },
      { name: 'Alex', score: 5 },
      { name: 'Sam', score: 5 }
    ]);

    expect(finalResult.questionResults[0].averageAnswerTime).toBe(0);
    expect(finalResult.questionResults[0].percentCorrect).toBeCloseTo(100, 5);
    expect(finalResult.questionResults[0].playersCorrectList).toStrictEqual(['Hayden', 'Alex', 'Sam']);
  });
});
