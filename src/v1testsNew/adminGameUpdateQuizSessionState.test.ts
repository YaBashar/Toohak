import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////
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

  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};

const requestGameSessionInfo = (token : string, quizid : number, sessionid : number) => {
  const res = request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}`, {
    headers: { token }, json: { quizid, sessionid }
  });
  return {
    body: JSON.parse(res.body.toString()),
    statusCode: res.statusCode
  };
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  return (request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name }, timeout: TIMEOUT_MS
  }));
};

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizQuestionDuplicate Tests', () => {
  describe('Error Cases', () => {
    let token : string;
    let quizId : number;
    let sessionId : number;

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
      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      requestPlayerJoin(sessionId, 'player one');
      requestPlayerJoin(sessionId, 'player two');
      requestPlayerJoin(sessionId, 'player three');
    });

    test('Token is empty or invalid', () => {
      const res = updateQuizSessionStatus('invalid token', quizId, sessionId, Actions.NEXT_QUESTION);
      console.log(res);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Valid token but user is not owner of the quiz', () => {
      const user2 = createUser('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
      const token2 = JSON.parse(user2.body.toString()).token;
      const res = updateQuizSessionStatus(token2, quizId, sessionId, Actions.NEXT_QUESTION);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Valid token is provided but quiz doesnt exist', () => {
      const res = updateQuizSessionStatus(token, quizId + 1, sessionId, Actions.NEXT_QUESTION);

      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    // 400 ERRORS
    // Session Id does not refer to a valid session within this quiz
    test('Session Id does not refer to a valid session within this quiz', () => {
      const res = updateQuizSessionStatus(token, quizId, sessionId + 1, Actions.NEXT_QUESTION);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(400);
    });

    // Action provided is not a valid Action enum
    test('Session Id does not refer to a valid session within this quiz', () => {
      const res = updateQuizSessionStatus(token, quizId, sessionId, 'invalid_action' as unknown as Actions);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(400);
    });

    // Action enum cannot be applied in the current state (see spec for details)
    test('Invalid Actions From State Lobby', () => {
      const res = requestGameSessionInfo(token, quizId, sessionId);
      console.log(res.body);

      const result1 = updateQuizSessionStatus(token, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      console.log(result1.body);
      expect(result1.body).toStrictEqual({ error: expect.any(String) });
      expect(result1.statusCode).toStrictEqual(400);

      const result2 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_ANSWER);
      console.log(result2.body);
      expect(result2.body).toStrictEqual({ error: expect.any(String) });
      expect(result2.statusCode).toStrictEqual(400);

      const result3 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      console.log(result3.body);
      expect(result3.body).toStrictEqual({ error: expect.any(String) });
      expect(result3.statusCode).toStrictEqual(400);
    });

    test.only('Invalid Actions from State Question_Countdown', () => {
      // Start at lobby
      requestGameSessionInfo(token, quizId, sessionId);

      // Update to Next_Question
      updateQuizSessionStatus(token, quizId, sessionId, Actions.NEXT_QUESTION);
      // console.log(result1.body);

      const res2 = requestGameSessionInfo(token, quizId, sessionId);
      console.log(res2.body);

      // Now update using wrong Actions
      // const update1 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_ANSWER);
      // console.log(update1.body);
      // expect(update1).toStrictEqual({ error: expect.any(String) });
      // // expect(update1.statusCode).toStrictEqual(400);

      // const update2 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      // console.log(update2.body);
      // expect(update2).toStrictEqual({ error: expect.any(String) });
      // // expect(update2.statusCode).toStrictEqual(400);

      // const update3 = updateQuizSessionStatus(token, quizId, sessionId, Actions.NEXT_QUESTION);
      // console.log(update3.body);
      // expect(update3).toStrictEqual({ error: expect.any(String) });
      // // expect(update3.statusCode).toStrictEqual(400);
    });

    test('Invalid Actions from State Question_Open', () => {

    });

    test('Invalid Actions from State Question_Close', () => {

    });

    test('Invalid Actions from State Final_Results', () => {

    });

    test('Invalid Actions from State Answer_Show', () => {

    });

    test('Invalid Actions from State End', () => {

    });
  });

  describe('Success Cases', () => {
    //
  });
});
