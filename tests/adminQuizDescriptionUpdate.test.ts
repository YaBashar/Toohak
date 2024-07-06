import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
//////////////////////////////////////////////////
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
  const res = request(
    'POST',
    `${SERVER_URL}/v1/admin/auth/register`,
    { json: { email, password, nameFirst: firstName, nameLast: lastName } }
  );
  return JSON.parse(res.body.toString());
};

const createQuiz = (token: string, name: string, description: string) => {
  const res = request(
    'POST',
    `${SERVER_URL}/v1/admin/quiz`,
    { json: { token, name, description } }
  );
  return JSON.parse(res.body.toString());
};

const quizDescriptionUpdate = (token: string, quizId: number, description: string) => {
  const res = request(
    'PUT',
    `${SERVER_URL}/v1/admin/quiz/${quizId}/description`,
    { json: { token, description } }
  );
  return JSON.parse(res.body.toString());
};

const quizInfo = (token: string, quizId: number) => {
  const res = request(
    'GET',
    `${SERVER_URL}/v1/admin/quiz/${quizId}`,
    { qs: { token } }
  );
  return JSON.parse(res.body.toString());
};

const clear = () => {
  request('DELETE', `${SERVER_URL}/v1/clear`, { timeout: TIMEOUT_MS });
};
//////////////////////////////////////////////////

beforeEach(() => {
  clear();
});

describe("adminQuizDescriptionUpdate Tests", () => {
  describe("Error Cases", () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      token = createUser('email@gmail.com', '1password', 'firstname', 'lastname').token;
      quizId = createQuiz(token, 'quizname', 'description').quizId;
    });

    // Test for checking if the quiz's description exceeds over 100 characters
    test('Description is more than 100 characters', () => {
      const longDescription = 'A'.repeat(101);
      const result = quizDescriptionUpdate(token, quizId, longDescription);
      expect(result).toStrictEqual({ error: 'Quiz description is more than 100 characters in length' });
    });

    // Test for checking if quidId is non-existent within Tahook
    test('Non-existent quiz Id (authUserId: 1, quizId: 999, description: "Non-existent Quiz")', () => {
      const result = quizDescriptionUpdate(token, 999, "Non-existent Quiz");
      expect(result).toStrictEqual({ error: 'Quiz Id not found' });
    });

    // Test for checking if the quizId is owned by the user and uses a second user to test against
    test('Quiz Id does not refer to a quiz that this user owns', () => {
      const anotherToken = createUser('another@gmail.com', 'anotherPassword', 'another', 'user').token;
      const result = quizDescriptionUpdate(anotherToken, quizId, "Any description");
      expect(result).toStrictEqual({ error: 'Quiz Id not owned by the user' });
    });
  });

  describe("Success Cases", () => {
    let token: string;
    let quizId: number;

    beforeEach(() => {
      token = createUser('email@gmail.com', '1password', 'firstname', 'lastname').token;
      quizId = createQuiz(token, 'quizname', 'description').quizId;
    });

    // Test for checking if the user has provided a valid input for the quiz description
    test('Valid inputs (authUserId: 1, quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
      quizDescriptionUpdate(token, quizId, "Toohak Javascript Quiz 1");
      const result = quizInfo(token, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Toohak Javascript Quiz 1',
      });
    });

    // Test for checking if the user with a different quiId has provided a valid input for the quiz description
    test('Valid inputs (authUserId: 1, quizId: 2, description: "QUIZ 1")', () => {
      quizDescriptionUpdate(token, quizId, "QUIZ 1");
      const result = quizInfo(token, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'QUIZ 1',
      });
    });

    // Test for checking if the quiz description is around 100 characters
    test('Description is exactly 100 characters', () => {
      const longDescription = 'A'.repeat(100);
      quizDescriptionUpdate(token, quizId, longDescription);
      const result = quizInfo(token, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: longDescription,
      });
    });

    // Test for checking if the quiz description is around 99 characters
    test('Description is exactly 99 characters', () => {
      const description = 'A'.repeat(99);
      quizDescriptionUpdate(token, quizId, description);
      const result = quizInfo(token, quizId);

      expect(result).toStrictEqual({
        quizId: quizId,
        name: 'quizname',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: description,
      });
    });
  });
});