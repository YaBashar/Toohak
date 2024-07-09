import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
/// ///////////////////////////////////////////////
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  const res = request(
    'POST',
    `${SERVER_URL}/v1/admin/auth/register`,
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const createQuiz = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    `${SERVER_URL}/v1/admin/quiz`,
    { json: { token, name, description } }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const quizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/description`,
    { json: { token, description } }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const quizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}`,
    { qs: { token } }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

const clear = () => {
  request('DELETE', `${SERVER_URL}/v1/clear`, { timeout: TIMEOUT_MS });
};
/// ///////////////////////////////////////////////
beforeEach(() => {
  clear();
});

describe('adminQuizDescriptionUpdate Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      token = createUser('email@gmail.com', '1password', 'firstname', 'lastname').body.token;
      quizId = createQuiz(token, 'quizname', 'description').body.quizId;
    });

    // Test for checking if the quiz's description exceeds over 100 characters
    test('Description is more than 100 characters', () => {
      const longDescription = 'A'.repeat(101);
      const result = quizDescriptionUpdate(token, quizId, longDescription);
      expect(result.body).toStrictEqual({ error: 'Quiz description is more than 100 characters in length' });
      expect(result.statusCode).toBe(400);
    });

    // Test for checking if quidId is non-existent within Tahook
    test('Non-existent quiz Id (authUserId: 1, quizId: 999, description: "Non-existent Quiz")', () => {
      const result = quizDescriptionUpdate(token, 999, 'Non-existent Quiz');
      expect(result.body).toStrictEqual({ error: 'Quiz Id not found' });
      expect(result.statusCode).toBe(403);
    });

    // Test for checking if the quiz description is updated to be empty
    test('Empty description', () => {
      const result = quizDescriptionUpdate(token, quizId, '');
      expect(result.body).toStrictEqual({ error: 'Quiz description cannot be empty' });
      expect(result.statusCode).toBe(400);
    });

    // Test for checking if the quizId is owned by the user and uses a second user to test against
    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const anotherToken = createUser('another@gmail.com', 'anotherPassword', 'another', 'user').body.token;
      const result = quizDescriptionUpdate(anotherToken, quizId, 'Any description');
      expect(result.body).toStrictEqual({ error: 'Quiz Id not owned by the user' });
      expect(result.statusCode).toBe(400);
    });
  });

  describe('Success Cases', () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      token = createUser('email@gmail.com', '1password', 'firstname', 'lastname').body.token;
      quizId = createQuiz(token, 'quizname', 'description').body.quizId;
    });

    // Test for checking if the user has provided a valid input for the quiz description
    test('Valid inputs (authUserId: 1, quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
      const updateResult = quizDescriptionUpdate(token, quizId, 'Toohak Javascript Quiz 1');
      expect(updateResult.statusCode).toBe(200);
      const result = quizInfo(token, quizId);
      expect(result.body).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Toohak Javascript Quiz 1',
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number)
      });
    });

    // Test for checking if the user with a different quiId has provided a valid input for the quiz description
    test('Valid inputs (authUserId: 1, quizId: 2, description: "QUIZ 1")', () => {
      const updateResult = quizDescriptionUpdate(token, quizId, 'QUIZ 1');
      expect(updateResult.statusCode).toBe(200);
      const result = quizInfo(token, quizId);
      expect(result.body).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'QUIZ 1',
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number)
      });
    });

    // Test for checking if the quiz description is around 100 characters
    test('Description is exactly 100 characters', () => {
      const longDescription = 'A'.repeat(100);
      const updateResult = quizDescriptionUpdate(token, quizId, longDescription);
      expect(updateResult.statusCode).toBe(200);
      const result = quizInfo(token, quizId);
      expect(result.body).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: longDescription,
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number)
      });
    });

    // Test for checking if the quiz description is around 99 characters
    test('Description is exactly 99 characters', () => {
      const description = 'A'.repeat(99);
      const updateResult = quizDescriptionUpdate(token, quizId, description);
      expect(updateResult.statusCode).toBe(200);
      const result = quizInfo(token, quizId);
      expect(result.body).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: description,
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number)
      });
    });
  });
});
