import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// wrapper functions
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

const quizNameUpdate = (token : string, quizId : number, name : string) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/name`,
    { json: { token, name }, timeout: TIMEOUT_MS }
  );
  return res;
};

const quizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}`,
    { qs: { token } }
  );
  return JSON.parse(res.body.toString());
};

const quizRemove = (token: string, quizId: number) => {
  const res = request(
    'DELETE',
    `${SERVER_URL}/v1/admin/quiz/${quizId}`,
    { qs: { token } }
  );
  return res;
};

const quizList = (token: string) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/list`,
    { qs: { token } }
  );
  return res;
};

/// /////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
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

  test('Testing timeLastEdited property has been changed', (done) => {
    const createQuizResponse = createQuiz(token1, 'newQuiz', 'description');
    const quizId = createQuizResponse.quizId;
    const initialTimeCreated = createQuizResponse.timeCreated;

    setTimeout(() => {
      quizNameUpdate(token1, quizId, 'changeName');
      const quizInfoResponse = quizInfo(token1, quizId);
      const updatedTimeLastEdited = quizInfoResponse.timeLastEdited;
      expect(updatedTimeLastEdited).not.toEqual(initialTimeCreated);
      done();
    },
    1000
    );
  });
});
