import request from 'sync-request-curl';
import { port, url } from '../config.json';

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

// Function to create a new quiz
const createQuiz = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    `${SERVER_URL}/v1/admin/quiz`,
    { json: { token, name, description } }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// Function to update the description of a quiz
const quizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/description`,
    { json: { token, description } }
  );
  return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
};

// Function to get quiz information
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

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminQuizDescriptionUpdate Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let quizId: number;

    // Create a user and a quiz before each test case
    beforeEach(() => {
      token = createUser('email@gmail.com', '1password', 'firstname', 'lastname').body.token;
      quizId = createQuiz(token, 'quizname', 'description').body.quizId;
    });

    // Test for description exceeding 100 characters
    test('Description is more than 100 characters', () => {
      const longDescription = 'A'.repeat(101);
      const result = quizDescriptionUpdate(token, quizId, longDescription);
      expect(result.body).toStrictEqual({ error: 'Quiz description is more than 100 characters in length' });
      expect(result.statusCode).toBe(400);
    });

    // Test for non-existent quiz ID
    test('Non-existent quiz Id (userId: 1, quizId: 999, description: "Non-existent Quiz")', () => {
      const result = quizDescriptionUpdate(token, 999, 'Non-existent Quiz');
      expect(result.body).toStrictEqual({ error: 'Quiz Id not found' });
      expect(result.statusCode).toBe(403);
    });

    // Test for empty description
    test('Empty description', () => {
      const result = quizDescriptionUpdate(token, quizId, '');
      expect(result.body).toStrictEqual({ error: 'Quiz description cannot be empty' });
      expect(result.statusCode).toBe(400);
    });

    // Test for quiz ID not owned by the user
    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const anotherToken = createUser('another@gmail.com', 'anotherPassword', 'another', 'user').body.token;
      const result = quizDescriptionUpdate(anotherToken, quizId, 'Any description');
      expect(result.body).toStrictEqual({ error: 'Invalid User id' });
      expect(result.statusCode).toBe(401);
    });
  });

  describe('Success Cases', () => {
    let token: string;
    let quizId: number;

    // Create a user and a quiz before each test case
    beforeEach(() => {
      token = createUser('email@gmail.com', '1password', 'firstname', 'lastname').body.token;
      quizId = createQuiz(token, 'quizname', 'description').body.quizId;
    });

    // Test for valid description update
    test('Valid inputs (userId: 1, quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
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
        duration: expect.any(Number),
      });
    });

    // Test for valid description update with a different description
    test('Valid inputs (userId: 1, quizId: 2, description: "QUIZ 1")', () => {
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
        duration: expect.any(Number),
      });
    });

    // Test for description of exactly 100 characters
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
        duration: expect.any(Number),
      });
    });

    // Test for description of exactly 99 characters
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
        duration: expect.any(Number),
      });
    });
  });
});
