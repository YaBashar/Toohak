import { adminAuthRegister } from './auth.js';
import { adminQuizDescriptionUpdate } from './quiz.js';
import { clear } from './other.js';

beforeEach(() => {
  clear();
});

describe("adminQuizDescriptionUpdate Tests", () => {
  describe("Error Cases", () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email', 'password', 'firstname', 'lastname');
      quizId = adminQuizCreate(authUserId, 'quizname', 'description');
    });

    test('Missing description (authUserId: 1, quizId: 1)', () => {
      const result = adminQuizDescriptionUpdate(authUserId, quizId);
      expect(result).toStrictEqual({ error: "Description is required" });
    });

    test('Invalid user ID type (authUserId: "one", quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate('one', quizId, "Toohak Javascript Quiz 1");
      expect(result).toStrictEqual({ error: "Invalid user ID" });
    });

    test('Invalid quiz ID type (authUserId: 1, quizId: "one", description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, 'one', "Toohak Javascript Quiz 1");
      expect(result).toStrictEqual({ error: "Invalid quiz ID" });
    });

    test('Negative user ID (authUserId: -1, quizId: 2, description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate(-1, quizId, "Toohak Javascript Quiz 1");
      expect(result).toStrictEqual({ error: "Invalid user ID" });
    });

    test('Negative quiz ID (authUserId: 1, quizId: -1, description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, -1, "Toohak Javascript Quiz 1");
      expect(result).toStrictEqual({ error: "Invalid quiz ID" });
    });

    test('Empty description (authUserId: 1, quizId: 1, description: "")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, quizId, "");
      expect(result).toStrictEqual({ error: "Description cannot be empty" });
    });

    test('Description is more than 100 characters', () => {
      const longDescription = 'A'.repeat(101);
      const result = adminQuizDescriptionUpdate(authUserId, quizId, longDescription);
      expect(result).toStrictEqual({ error: 'Description is more than 100 characters in length' });
    });

    test('Non-existent quiz ID (authUserId: 1, quizId: 999, description: "Non-existent Quiz")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, 999, "Non-existent Quiz");
      expect(result).toStrictEqual({ error: "Quiz ID does not refer to a valid quiz" });
    });
  });

  describe("Success Cases", () => {
    let authUserId;
    let quizId;

    beforeEach(() => {
      authUserId = adminAuthRegister('email', 'password', 'firstname', 'lastname');
      quizId = adminQuizCreate(authUserId, 'quizname', 'description');
    });

    test('Valid inputs (authUserId: 1, quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, quizId, "Toohak Javascript Quiz 1");
      expect(result).toStrictEqual({});
    });

    test('Valid inputs (authUserId: 1, quizId: 2, description: "QUIZ 1")', () => {
      const result = adminQuizDescriptionUpdate(authUserId, quizId, "QUIZ 1");
      expect(result).toStrictEqual({});
    });

    test('Description is exactly 100 characters', () => {
      const longDescription = 'A'.repeat(100);
      const result = adminQuizDescriptionUpdate(authUserId, quizId, longDescription);
      expect(result).toStrictEqual({});
    });

    test('Description is exactly 99 characters', () => {
      const description = 'A'.repeat(99);
      const result = adminQuizDescriptionUpdate(authUserId, quizId, description);
      expect(result).toStrictEqual({});
    });
  });
});