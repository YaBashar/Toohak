import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token : string, name : string, description : string) => {
  return (request('POST', SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS })
  );
};

const requestQuizTransfer = (quizId: number, token: string, email: string) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    { json: { token, email }, timeout: TIMEOUT_MS }
  ));
};

const requestQuizList = (token : string) => {
  return (request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token }, timeout: TIMEOUT_MS }));
};

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

/// /////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizTransfer Tests', () => {
  describe('Error Cases', () => {
    let sourceToken : string;
    let targetToken : string;
    let quizId : number;

    beforeEach(() => {
      const sourceUser = createUser('sourceuser@unsw.edu.au', '123ABCabc@#$', 'Mubashir', 'Hussain');
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = createUser('targetuser@unsw.edu.au', '124ABCabc@#$', 'Muhammad', 'Chowdhury');
      targetToken = JSON.parse(targetUser.body.toString()).token;

      const res = createQuiz(sourceToken, 'quizName', 'description');
      quizId = JSON.parse(res.body.toString()).quizId;
    });

    test('Transfer of a Quiz with invalid Authuser id', () => {
      const quizTransfer = requestQuizTransfer(quizId, 'Invalid_token', 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(401);
    });

    test('Transferring Quiz which does not exist ', () => {
      const res = requestQuizTransfer(quizId + 1, sourceToken, 'targetuser@unsw.edu.au');
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const quizTransfer = requestQuizTransfer(quizId + 1, sourceToken, 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(403);
    });

    // userEmail is not a real user
    test('target user email is not a real user', () => {
      const quizTransfer = requestQuizTransfer(quizId, sourceToken, 'gurigiurabgiurag@email.unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // userEmail is the current logged in user
    test('Destination user email is the same as current user email', () => {
      const quizTransfer = requestQuizTransfer(quizId, sourceToken, 'sourceuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // Quiz ID refers to a quiz that has a name that is already used by the target user
    test('Quiz has name already used by target user', () => {
      const res = createQuiz(targetToken, 'quizName', 'description');
      const quizId2 = (JSON.parse(res.body.toString())).quizId;
      const quizTransfer = requestQuizTransfer(quizId2, sourceToken, 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });
  });

  describe('Success Cases', () => {
    let sourceToken : string;
    let targetToken : string;
    let quizId : number;

    beforeEach(() => {
      const sourceUser = createUser('sourceuser@unsw.edu.au', '123ABCabc@#$', 'Mubashir', 'Hussain');
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = createUser('targetuser@unsw.edu.au', '124ABCabc@#$', 'Muhammad', 'Chowdhury');
      targetToken = JSON.parse(targetUser.body.toString()).token;

      const res = createQuiz(sourceToken, 'quizName', 'description');
      quizId = JSON.parse(res.body.toString()).quizId;
    });

    // check that function returns empty object
    test('Check that function returns empty object', () => {
      const quizTransfer = requestQuizTransfer(quizId, sourceToken, 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({});
    });

    test('Check that transferred quiz is under name of target user through quizList', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      const quizList = request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token: targetToken }, timeout: TIMEOUT_MS });

      expect(JSON.parse(quizList.body.toString())).toStrictEqual({
        quizzes:
        [
          {
            quizId: quizId,
            name: 'quizName',
          }
        ]
      });
    });

    test('Check that transferred quiz has been removed from source user through quizList', () => {
      request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`, { json: { token: sourceToken, email: 'targetuser@unsw.edu.au' }, timeout: TIMEOUT_MS });
      const quizList = requestQuizList(sourceToken);
      expect(JSON.parse(quizList.body.toString())).toStrictEqual({
        quizzes: []
      });
    });
  });
});
