import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';
import slync from 'slync';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/// /////////////////////////////////////////////////////////////

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
};

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return (request('POST', SERVER_URL + '/v1/admin/auth/register',
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token: string, name: string, description: string) => {
  return (request('POST', SERVER_URL + '/v2/admin/quiz',
    { headers: { token }, json: { name, description }, timeout: TIMEOUT_MS })
  );
};

const requestQuizTransfer = (token: string, quizId: number, email: string) => {
  return (request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/transfer`,
    { headers: { token }, json: { email }, timeout: TIMEOUT_MS }
  ));
};

const requestQuizList = (token: string) => {
  return (request('GET', SERVER_URL + '/v2/admin/quiz/list', { headers: { token }, timeout: TIMEOUT_MS }));
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

const createQuizQuestion = (token: string, quizid: number, question: string, duration: number, points: number, thumbnailUrl: string, answers: object) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizid}/question`, {
    headers: {
      token,
    },
    json: {
      questionBody: {
        question,
        duration,
        points,
        thumbnailUrl,
        answers,
      }
    }
  });
};

const requestQuizInfo = (token : string, quizId : number) => {
  return (request('GET', SERVER_URL + `/v2/admin/quiz/${quizId}`, { headers: { token } }));
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  return (request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name }, timeout: TIMEOUT_MS
  }));
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
    let sessionId: number;
    let questionDuration : number;

    beforeEach(() => {
      const sourceUser = createUser('sourceuser@unsw.edu.au', '123ABCabc@#$', 'Mubashir', 'Hussain');
      sourceToken = JSON.parse(sourceUser.body.toString()).token;

      const targetUser = createUser('targetuser@unsw.edu.au', '124ABCabc@#$', 'Muhammad', 'Chowdhury');
      targetToken = JSON.parse(targetUser.body.toString()).token;

      const res = createQuiz(sourceToken, 'quizName', 'description');
      quizId = JSON.parse(res.body.toString()).quizId;
    });

    test('Not in End State of Game', () => {
      createQuizQuestion(sourceToken, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      const res2 = requestQuizInfo(sourceToken, quizId);
      questionDuration = JSON.parse(res2.body.toString()).duration;

      const session = requestCreateSession(sourceToken, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      requestPlayerJoin(sessionId, 'player one');
      requestPlayerJoin(sessionId, 'player two');
      requestPlayerJoin(sessionId, 'player three');
      // Transferring at Lobby
      const transfer1 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer1.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer1.statusCode).toStrictEqual(400);

      // Transferrring at Question Countdown
      updateQuizSessionStatus(sourceToken, quizId, sessionId, Actions.NEXT_QUESTION);
      const transfer2 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer2.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer2.statusCode).toStrictEqual(400);

      updateQuizSessionStatus(sourceToken, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      const transfer3 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer3.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer3.statusCode).toStrictEqual(400);

      // Transferring at Question Open
      const transfer4 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer4.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer4.statusCode).toStrictEqual(400);

      // Transferring at Question Close
      slync(questionDuration * 1000);
      const transfer5 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer5.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer5.statusCode).toStrictEqual(400);

      // Transferring at Answer Show
      updateQuizSessionStatus(sourceToken, quizId, sessionId, Actions.GO_TO_ANSWER);
      const transfer6 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer6.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer6.statusCode).toStrictEqual(400);

      // Transferring at Final Results
      updateQuizSessionStatus(sourceToken, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      const transfer7 = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer7.body.toString())).toStrictEqual({ error: expect.any(String) });
      expect(transfer7.statusCode).toStrictEqual(400);
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
    let sessionId: number;

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

    test('Transfer only at End State', () => {
      // Start from end state

      createQuizQuestion(sourceToken, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(sourceToken, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      requestPlayerJoin(sessionId, 'player one');
      requestPlayerJoin(sessionId, 'player two');
      requestPlayerJoin(sessionId, 'player three');

      updateQuizSessionStatus(sourceToken, quizId, sessionId, Actions.END);
      const transfer = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(transfer.body.toString())).toStrictEqual({});
      expect(transfer.statusCode).toStrictEqual(200);
    });

    test('Check that transferred quiz is under name of target user through quizList', () => {
      requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      const quizList = requestQuizList(targetToken);
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

    test('Test successful quiz transfer', () => {
      const res = requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au');
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
      const quizzes = requestQuizList(sourceToken);
      expect(JSON.parse(quizzes.body.toString())).toStrictEqual({
        quizzes: []
      });
    });

    test('Test successful quiz transfer, then transfer back to creator', () => {
      const parse = JSON.parse(requestQuizTransfer(sourceToken, quizId, 'targetuser@unsw.edu.au').body.toString());
      expect(parse).toStrictEqual({});
      const res = JSON.parse(requestQuizTransfer(targetToken, quizId, 'sourceuser@unsw.edu.au').body.toString());
      expect(res).toStrictEqual({});

      const quizzes = requestQuizList(sourceToken);
      expect(JSON.parse(quizzes.body.toString())).toStrictEqual({
        quizzes: [
          {
            name: 'quizName',
            quizId: quizId
          }
        ]
      });
    });
  });
});
