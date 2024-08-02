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

const questionDelete = (token: string, quizid: number, questionid: number) => {
  const res = request('DELETE', SERVER_URL + `/v2/admin/quiz/${quizid}/question/${questionid}`, {
    headers: { token },
    timeout: TIMEOUT_MS
  });
  return res;
};

/// ////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid', () => {
  let token1: string;
  let token2: string;
  let qid: { questionId: number};
  let q2id: { questionId: number};
  let quizId: number;
  let quizId2: number;
  beforeEach(() => {
    // logging in user 1
    const uid1 = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
    token1 = JSON.parse(uid1.body.toString()).token;

    // getting the quiz id for 1st user
    let quizResponse = createQuiz(token1, 'quiz1', 'quiz1 description');
    quizId = quizResponse.quizId;

    // creating a question for user 1
    let questionResponse = questionCreate(token1, quizId, 'Who is the Monarch of England?', 4, 5, [
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
    qid = JSON.parse(questionResponse.body.toString());

    // logging in user 2
    const uid2 = createUser('5555555@unsw.edu.au', 'abs@#$234', 'brim', 'johnson');
    token2 = JSON.parse(uid2.body.toString()).token;

    // getting the quiz id for 2nd user
    quizResponse = createQuiz(token2, 'quiz2', 'quiz2 description');
    quizId2 = quizResponse.quizId;

    // creating a question for user 2
    questionResponse = questionCreate(token2, quizId2, 'Who is the Monarch?', 3, 4, [
      {
        answer: 'Prince',
        correct: true,
      },
      {
        answer: 'Queen',
        correct: false,
      }
    ],
    'http://google.com/some/image/path.jpg'
    );
    q2id = JSON.parse(questionResponse.body.toString());
  });

  // test to check if token is invalid
  test('Token is invalid', () => {
    const res = questionDelete('invaliduserId', quizId, qid.questionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // test to check if token is empty
  test('Token is empty', () => {
    const res = questionDelete('', quizId, qid.questionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(401);
  });

  // test to check quiz Id does not refer to a valid quiz
  test('Quiz Id does not refer to a valid quiz', () => {
    const res = questionDelete(token1, quizId + 1902303920, qid.questionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // test to check if quiz ID does not refer to a quiz that this user owns
  test('Quiz ID does not refer to a quiz that this user owns', () => {
    const res = questionDelete(token1, quizId2, q2id.questionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(403);
  });

  // Question Id does not refer to a valid question within this quiz
  test('Question Id does not refer to a valid question within this quiz', () => {
    const res = questionDelete(token1, quizId, qid.questionId + 1);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);
  });

  // Any session for this quiz is not in END state
  test('Any session for this quiz is not in END state', () => {
    const sessionResponse = requestCreateSession(token1, quizId, 3);
    const sessionId = JSON.parse(sessionResponse.body.toString()).sessionId;

    // deleting at lobby
    const res = questionDelete(token1, quizId, qid.questionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res.statusCode).toBe(400);

    updateQuizSessionStatus(token1, quizId, sessionId, Actions.NEXT_QUESTION);

    // deleting at next question
    const res2 = questionDelete(token1, quizId, qid.questionId);
    expect(JSON.parse(res2.body.toString())).toStrictEqual({ error: expect.any(String) });
    expect(res2.statusCode).toBe(400);
    updateQuizSessionStatus(token1, quizId, sessionId, Actions.END);
  });

  // test to check if the question is removed from the list of questions
  test('Question is removed from the list of questions', () => {
    const res = questionDelete(token1, quizId, qid.questionId);
    expect(JSON.parse(res.body.toString())).toStrictEqual({});
    expect(res.statusCode).toBe(200);
  });
});
