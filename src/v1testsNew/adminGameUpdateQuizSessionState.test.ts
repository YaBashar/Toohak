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

      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);
      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      requestPlayerJoin(sessionId, 'player one');
      requestPlayerJoin(sessionId, 'player two');
      requestPlayerJoin(sessionId, 'player three');
    });

    test('Token is empty or invalid', () => {
      const res = updateQuizSessionStatus('invalid token', quizId, sessionId, Actions.NEXT_QUESTION);
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
      const result1 = updateQuizSessionStatus(token, quizId, sessionId, Actions.SKIP_COUNTDOWN);
      expect(result1.body).toStrictEqual({ error: expect.any(String) });
      expect(result1.statusCode).toStrictEqual(400);

      const result2 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_ANSWER);
      expect(result2.body).toStrictEqual({ error: expect.any(String) });
      expect(result2.statusCode).toStrictEqual(400);

      const result3 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      expect(result3.body).toStrictEqual({ error: expect.any(String) });
      expect(result3.statusCode).toStrictEqual(400);
    });

    test('Invalid Actions from State Question_Countdown', () => {
      // Start with State at LOBBY
      requestGameSessionInfo(token, quizId, sessionId);

      // Update to Next_Question changing Status to QUESTION_COUNTDOWN
      updateQuizSessionStatus(token, quizId, sessionId, Actions.NEXT_QUESTION);

      // Now update using invalid Actions
      const update1 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_ANSWER);
      expect(update1.body).toStrictEqual({ error: expect.any(String) });
      expect(update1.statusCode).toStrictEqual(400);

      const update2 = updateQuizSessionStatus(token, quizId, sessionId, Actions.GO_TO_FINAL_RESULTS);
      expect(update2.body).toStrictEqual({ error: expect.any(String) });
      expect(update2.statusCode).toStrictEqual(400);

      const update3 = updateQuizSessionStatus(token, quizId, sessionId, Actions.NEXT_QUESTION);
      expect(update3.body).toStrictEqual({ error: expect.any(String) });
      expect(update3.statusCode).toStrictEqual(400);
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
    let token : string;
    let quizId : number;
    let sessionId : number;
    let questionId : number;

    beforeEach(() => {
      const user = createUser('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
      token = JSON.parse(user.body.toString()).token;
      quizId = createQuiz(token, 'quizName', 'description').quizId;

      const question = createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      questionId = JSON.parse(question.body.toString()).questionId;
      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;

      requestPlayerJoin(sessionId, 'player one');
      requestPlayerJoin(sessionId, 'player two');
      requestPlayerJoin(sessionId, 'player three');
    });

    test('Successfully Move from Question_Countdown to Question_Open', (done) => {
      // Start at lobby
      requestGameSessionInfo(token, quizId, sessionId);
      // Update to Next_Question
      updateQuizSessionStatus(token, quizId, sessionId, Actions.NEXT_QUESTION);
      // Wait for 3 seconds and then check if state has been changed to QUESTION_OPEN
      setTimeout(() => {
        const res3 = requestGameSessionInfo(token, quizId, sessionId);
        console.log(res3.body);
        expect(res3.body).toStrictEqual(
          {
            state: 'QUESTION_OPEN',
            atQuestion: expect.any(Number),
            players: expect.any(Array),
            metadata: {
              quizId: expect.any(Number),
              name: expect.any(String),
              timeCreated: expect.any(Number),
              timeLastEdited: expect.any(Number),
              description: expect.any(String),
              numQuestions: expect.any(Number),
              questions: [
                {
                  questionId: questionId,
                  question: 'Who is the Monarch of England?',
                  duration: 4,
                  thumbnailUrl: expect.any(String),
                  points: 5,
                  answers: [
                    {
                      answerId: expect.any(Number),
                      answer: 'Prince Charles',
                      colour: expect.any(String),
                      correct: true
                    },
                    {
                      answerId: expect.any(Number),
                      answer: 'Queen Elizabeth',
                      colour: expect.any(String),
                      correct: false
                    }
                  ]
                }
              ],
              duration: expect.any(Number),
              thumbnailUrl: expect.any(String)
            }
          }
        );
        done();
      }, 3000);
    });

    test('Successfully Skips Question_Countdown', () => {
      // Start at lobby
      requestGameSessionInfo(token, quizId, sessionId);
      // Update to Next_Question
      updateQuizSessionStatus(token, quizId, sessionId, Actions.NEXT_QUESTION);
      // Do Skip Question
    });
  });
});
