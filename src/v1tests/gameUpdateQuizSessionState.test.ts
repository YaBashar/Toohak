import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////
const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return (request('POST', SERVER_URL + '/v1/admin/quiz/${quizId}/session/start', {
    json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
};

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

const createQuizQuestion = (token : string, quizId : number, questionBody : object) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/admin/quiz/${quizId}/question`,
    { json: { token: token, questionBody: questionBody }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

const updateQuizSessionStatus = (token : string, quizId : number, sessionId : number, action : Actions) => {
  const res = request(
    'PUT',
    SERVER_URL + `/v1/admin/quiz/${quizId}/session/${sessionId}`,
    { headers: { token }, json: { quizId, sessionId, action }, timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizQuestionDuplicate Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;

      createQuizQuestion(token, quizId,
        {
          question: 'Who is the Monarch of England?',
          duration: 4,
          points: 5,
          answers: [
            {
              answer: 'Prince Charles',
              correct: false,
            },
            {
              answer: 'Prince is not Charles',
              correct: true,
            },
            {
              answer: 'Prince is Beckham',
              correct: false,
            }
          ]
        });
    });

    test('Token is empty or invalid', () => {
      const res = updateQuizSessionStatus('invalid token', quizId, 3, Actions.NEXT_QUESTION);
      const data = JSON.parse(res.body.toString());

      expect(data).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Valid token but user is not owner of the quiz', () => {
      const user2 = createUser('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
      const token2 = JSON.parse(user2.body.toString()).token;
      const res = updateQuizSessionStatus(token2, quizId, 3, Actions.NEXT_QUESTION);
      const data = JSON.parse(res.body.toString());

      expect(data).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Valid token is provided but quiz doesnt exist', () => {
      const res = updateQuizSessionStatus(token, quizId + 1, 3, Actions.NEXT_QUESTION);
      const data = JSON.parse(res.body.toString());

      expect(data).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    // 400 ERRORS
    // Session Id does not refer to a valid session within this quiz
    // Action provided is not a valid Action enum
    // Action enum cannot be applied in the current state (see spec for details)
  });

  describe('Success Cases', () => {
    //
  });
});
