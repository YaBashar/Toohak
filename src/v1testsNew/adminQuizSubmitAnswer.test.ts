import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;
let quiz1Id: string;
let quiz2Id: string;
let question1Quiz1Id: string;
let question1Quiz2Id: string;
let randomToken: string;
let randomQuizId: string;

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

const addQuestion = (token: string, quizId: string, question: string, duration: number, points: number, answers: object, thumbnailUrl: string) => {
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

const questionInfo = (playerid: string, questionposition: number) => {
  const res = request('GET', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}`, {
    json: {
        playerid,
        questionposition
    }
  })
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const startSession = (quizid: string, token: string, autoStartNum: number) => {
  const res = request('POST', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum }
  })
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
}

const joinSession = (sessionid: string, name: string) => {
  const res = request('POST', `${SERVER_URL}/v1/player/join`, {
    json: {
      sessionid,
      name
    }
  })
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const sessionState = (quizid: string, sessionid: string, token: string) => {
  const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }
  })
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const updateState = (quizid: string, sessionid: string, token: string, action: string) => {
  const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }, json: { action }
  })
};

const questionResult = (playerid: string, questionposition: number) => {
  const res = request('GET', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/results`)
};

const submitAnswer = (answerids: Array, playerid: string, questionposition: number) => {
  const res = request('PUT', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/answer`, {
    json: { answerids }
  })
}

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });

  // create account and log in
  const user = createUser('amelia@unsw.edu.au', 'abcd1234!@#$ABCD', 'amelia', 'su');
  token = user.token;
  userLogin('amelia@unsw.edu.au', 'abcd1234!@#$ABCD');

  // create a quiz
  quiz1Id = createQuiz(token, 'quiz 1', 'the first quiz').quizId;

  // add a question to the quiz
  question1Quiz1Id = addQuestion(token, quiz1Id, 'Who is the Monarch of England?', 4, 5,
    [
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince Beckham', correct: false }
    ],
    'http://google.com/some/image/path.jpg'
    ).questionId;

  // create a second quiz
  quiz2Id = createQuiz(token, 'quiz 2', 'the second quiz').quizId;

  // add a question to the second quiz
  question1Quiz2Id = addQuestion(token, quiz2Id, 'What is 1 + 1?', 4, 5,
    [
      { answer: '4', correct: false },
      { answer: '2', correct: true },
      { answer: '11', correct: false }
    ],
    'http://google.com/some/image/path.jpg'
    ).questionId;

  // start session
  sessionId = startSession(quiz1Id, token, 5).sessionId;

  // join session
  playerId = joinSession(sessionId, 'amelia').playerId;

  // change state
  updateState(quiz1Id, sessionId, token, NEXT_QUESTION); // lobby->question countdown
  updateState(quiz1Id, sessionId, token, SKIP_COUNTDOWN); // question countdown -> question 1 open
});

describe('PUT /v1/player/:playerid/question/:questionposition/answer', () => {
  test('player id does not exist', () => {
    const res = submitAnswer(answerid, '999', 1)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('invalid question position', () => {
    const res = submitAnswer(answerid, playerId, 5)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is on a different question', () => {
    const res = submitAnswer(answerid, playerId, 2)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('session is in the wrong state', () => {
    updateState(quiz1Id, sessionId, token, END)
    const res = submitAnswer(answerid, playerId, 1)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('invalid answer id', () => {
    const res = submitAnswer('999', playerId, 2)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('duplicate answer id provided', () => {
    const res = submitAnswer(answerid, playerId, 2)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('no answer id was submitted', () => {
    const res = submitAnswer('', playerId, 2)
    expect(res.body).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('success case', () => {
    const res = submitAnswer(answerid, playerId, 1)
    expect(res.body).toStrictEqual({ 
      questionId: question1Quiz1Id,
      playersCorrectList: [
        'amelia'
      ],
      averageAnswerTime: expect.any(Number),
      percentCorrect: expect.any(Number)
     });
    expect(res.statusCode).toBe(200);
  });
});