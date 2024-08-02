import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// wrapper functions
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
    headers: {
      token,
    },
    json: { name, description }
  });
  return JSON.parse(res.body.toString());
};

const quizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v2/admin/quiz/${quizId}`,
    { headers: { token } }
  );
  return JSON.parse(res.body.toString());
};

const questionCreate = (token: string, quizid: number, question: string, duration: number, points: number, answers: object, thumbnailUrl: string) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizid}/question`, {
    headers: {
      token,
    },
    json: {
      questionBody: {
        question,
        duration,
        points,
        answers,
        thumbnailUrl
      }
    }
  });
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
};

const updateQuizSessionStatus = (token : string, quizId : number, sessionId : number, action : Actions) => {
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

const quizRemove = (token: string, quizId: number) => {
  const res = request(
    'DELETE',
    `${SERVER_URL}/v2/admin/quiz/${quizId}`,
    { headers: { token } }
  );
  return res;
};

const quizList = (token: string) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v2/admin/quiz/list`,
    { headers: { token } }
  );
  return res;
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('DELETE /v1/admin/quiz/:quizid', () => {
  let token1: string;
  let token2: string;
  let qid: {quizId: number};
  let q2id: {quizId: number};

  beforeEach(() => {
    const user1 = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
    token1 = JSON.parse(user1.body.toString()).token;
    let response = createQuiz(token1, 'validQuiz', 'valid description');
    qid = response;

    const user2 = createUser('z5555555@unsw.edu.au', 'abs@#$234', 'brim', 'johnson');
    token2 = JSON.parse(user2.body.toString()).token;
    response = createQuiz(token2, 'validQuiz2', 'valid description2');
    q2id = response;
  });

  test('Token is invalid', () => {
    const res = quizRemove('invaliduserId', qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  test('Token is empty', () => {
    const res = quizRemove('', qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  test('Quiz Id does not refer to a valid quiz', () => {
    const res = quizRemove(token1, qid.quizId + 1);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const res = quizRemove(token1, q2id.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  test('Any session for this quiz is not in END state', () => {
    questionCreate(token1, qid.quizId, 'Who is the Monarch of England?', 4, 5, [
      {
        answer: 'Prince Charles',
        correct: true,
      },
      {
        answer: 'Queen Elizabeth',
        correct: false,
      }
    ],
    'http://google.com/some/image/path.jpg'
    );
    const session = requestCreateSession(token1, qid.quizId, 3);
    const sessionId = JSON.parse(session.body.toString()).sessionId;
    const res = quizRemove(token1, qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);

    updateQuizSessionStatus(token1, qid.quizId, sessionId, Actions.NEXT_QUESTION);
    quizRemove(token1, qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);

    updateQuizSessionStatus(token1, qid.quizId, sessionId, Actions.GO_TO_ANSWER);
    quizRemove(token1, qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);

    updateQuizSessionStatus(token1, qid.quizId, sessionId, Actions.SKIP_COUNTDOWN);
    quizRemove(token1, qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);

    updateQuizSessionStatus(token1, qid.quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
    quizRemove(token1, qid.quizId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  test('Quiz is removed from the list of quizzes', () => {
    let res = quizRemove(token1, qid.quizId);
    res = quizList(token1);
    expect(JSON.parse(res.body.toString())).toStrictEqual({
      quizzes: [

      ]
    });
  });

  test('Testing timeLastEdited property is the same as timeCreated', () => {
    const quiz = createQuiz(token1, 'newQuiz', 'description');
    const initialTimeCreated = quiz.timeCreated;
    const initialTimeEdited = quiz.timeLastEdited;

    expect(initialTimeCreated).toEqual(initialTimeEdited);
  });

  test('Testing timeLastEdited property has been changed', () => {
    const quizId = createQuiz(token1, 'newQuiz', 'description').quizId;
    const quizResponse = quizInfo(token1, quizId);
    const initialTimeCreated = quizResponse.timeCreated;

    slync(2000);
    quizRemove(token1, quizId);
    const quizInfoResponse = quizInfo(token1, quizId);
    const updatedTimeLastEdited = quizInfoResponse.timeLastEdited;
    expect(updatedTimeLastEdited).not.toEqual(initialTimeCreated);
  });
});
