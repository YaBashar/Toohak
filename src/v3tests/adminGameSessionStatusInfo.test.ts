import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// //////////////////////////////////////////////

const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  return request('POST', SERVER_URL + '/v1/admin/auth/register', {
    json: { email, password, nameFirst: firstName, nameLast: lastName }
  });
};

const createQuiz = (token : string, name : string, description : string) => {
  const res = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description }
  });
  return JSON.parse(res.body.toString());
};
const createQuizQuestion = (token: string, quizid: number, question: string, duration: number, points: number, answers: object) => {
  return request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
    json: {
      token,
      questionBody: {
        question,
        duration,
        points,
        answers
      }
    }
  });
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
  return (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
    headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
  }));
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

      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = JSON.parse(session.body.toString()).sessionId;
    });

    test('Token is empty or invalid', () => {
      const res = requestGameSessionInfo('invalid_token', quizId, sessionId);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(401);
    });

    test('Valid token but user is not owner of the quiz', () => {
      const user2 = createUser('zid2@ad.unsw.edu.au', 'abcd1234', 'first', 'last');
      const token2 = JSON.parse(user2.body.toString()).token;
      const res = requestGameSessionInfo(token2, quizId, sessionId);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
    });

    test('Valid token is provided but quiz doesnt exist', () => {
      const res = requestGameSessionInfo(token, quizId + 1, sessionId);
      expect(res.body).toStrictEqual({ error: expect.any(String) });
      expect(res.statusCode).toStrictEqual(403);
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
      console.log('quizId', quizId);

      const question = createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, [
        { answer: 'Prince Charles', correct: true }, { answer: 'Queen Elizabeth', correct: false }
      ]);

      questionId = JSON.parse(question.body.toString()).questionId;

      const session = requestCreateSession(token, quizId, 3);
      console.log(JSON.parse(session.body.toString()));
      sessionId = JSON.parse(session.body.toString()).sessionId;
      console.log(sessionId);
    });

    // Properties from QuestionCreate Still missing.
    // Also need to know how to get atQuestion
    test('Successfully Gives Game Session Status Info', () => {
      const res = requestGameSessionInfo(token, quizId, sessionId);
      console.log('Full Response:', JSON.stringify(res, null, 2));

      // Log questions from response separately
      console.log('Questions from Response:', JSON.stringify(res.body.metadata.questions, null, 2));
      expect(res.body).toStrictEqual(
        {
          state: expect.any(String),
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
                // thumbnailUrl: '' Still undefined in question Create,
                points: 5,
                answers: [
                  {
                    answer: 'Prince Charles',
                    correct: true
                  },
                  {
                    answer: 'Queen Elizabeth',
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
    });
  });
});
