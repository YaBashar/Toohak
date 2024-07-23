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

const createQuiz = (token: string, name: string, description: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS })
  );
};

const requestQuizTransfer = (token: string, quizId: number, email: string) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/transfer`,
    { json: { token, email }, timeout: TIMEOUT_MS }
  ));
};

const requestQuizList = (token: string) => {
  return (request('GET', SERVER_URL + '/v1/admin/quiz/list', { qs: { token }, timeout: TIMEOUT_MS }));
};

/// /////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizTransfer Tests', () => {
  describe('Error Cases', () => {
    let sourceToken: string;
    let targetToken: string;
    let quizId: number;

    beforeEach(() => {
      const sourceUser = createUser('sourceuser@unsw.edu.au', '123ABCabc@#$', 'Mubashir', 'Hussain');
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = createUser('targetuser@unsw.edu.au', '124ABCabc@#$', 'Muhammad', 'Chowdhury');
      targetToken = JSON.parse(targetUser.body.toString()).token;

      const res = createQuiz(sourceToken, 'quizName', 'description');
      quizId = JSON.parse(res.body.toString()).quizId;
    });

    test('Transfer of a Quiz with invalid Authuser id', () => {
      const quizTransfer = requestQuizTransfer('Invalid_token', quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(401);
    });

    test('Transferring Quiz which does not exist', () => {
      const res = requestQuizTransfer(sourceToken, quizId + 1, 'targetuser@unsw.edu.au');
      const data = JSON.parse(res.body.toString());
      expect(data).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const quizTransfer = requestQuizTransfer(sourceToken, quizId + 1, 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toStrictEqual(403);
    });

    test('target user email is not a real user', () => {
      const quizTransfer = requestQuizTransfer(sourceToken, quizId, 'gurigiurabgiurag@email.unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    test('Destination user email is the same as current user email', () => {
      const quizTransfer = requestQuizTransfer(sourceToken, quizId, 'sourceuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    test('Quiz has name already used by target user', () => {
      const res = createQuiz(targetToken, 'quizName', 'description');
      const quizId2 = (JSON.parse(res.body.toString())).quizId;
      const quizTransfer = requestQuizTransfer(targetToken, quizId2, 'targetuser@unsw.edu.au');
      expect(JSON.parse(quizTransfer.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(quizTransfer.statusCode).toBe(400);
    });

    // Failing autotest
    // Transferring quiz to wrong user?
    test('Test quiz transfer - unauthorised error', () => {
      const token3 = createUser('blah2@email.com', 'password1YAY', 'hayden', 'smith');
      const invalidToken = JSON.parse(token3.body.toString()).token;
      const res = requestQuizTransfer(invalidToken, quizId, 'blah2@email.com');
      expect(res.statusCode).toStrictEqual(403);
    });
  });

  describe('Success Cases', () => {
    let sourceToken: string;
    let targetToken: string;
    let quizId: number;

    beforeEach(() => {
      const sourceUser = createUser('sourceuser@unsw.edu.au', '123ABCabc@#$', 'Mubashir', 'Hussain');
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = createUser('targetuser@unsw.edu.au', '124ABCabc@#$', 'Muhammad', 'Chowdhury');
      targetToken = JSON.parse(targetUser.body.toString()).token;

      const res = createQuiz(sourceToken, 'quizName', 'description');
      quizId = JSON.parse(res.body.toString()).quizId;
    });

    test('Check that function returns empty object', () => {
      const quizTransfer = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
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
      requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      const quizList = requestQuizList(sourceToken);
      expect(JSON.parse(quizList.body.toString())).toStrictEqual({
        quizzes: []
      });
    });

    // Failing tests
    test('Test successful quiz transfer', () => {
      const res = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const quizzes = requestQuizList(sourceToken);
      const quizInList = JSON.parse(quizzes.body.toString()).quizzes;
      expect(quizInList).toStrictEqual([{ quizId: quizId, name: 'test quiz' }]);
    });

    test('Test successful quiz transfer, then transfer back to creator', () => {
      const parse = JSON.parse(requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au').body.toString());
      expect(parse).toStrictEqual({});
      const res = requestQuizTransfer(targetToken, quizId, 'sourceuser@email.com');
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const quizzes = requestQuizList(sourceToken);
      const quizInList = JSON.parse(quizzes.body.toString());
      expect(JSON.parse(quizInList.body.toString())).toStrictEqual([{ quizId: quizId, name: 'test quiz' }]);
    });
  });
});
