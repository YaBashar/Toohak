import { adminQuizDescriptionUpdate } from "../src/quiz.js";
import { clear } from '../src/other.js';

// Function to reset data before each test
beforeEach(() => {
  clear();
});

// Tests for checking if the provided description has valid inputs in it:
test('Valid inputs (authUserId: 1, quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
  const result = adminQuizDescriptionUpdate(1, 1, "Toohak Javascript Quiz 1");
  expect(result).toEqual({});
});

test('Valid inputs (authUserId: 1, quizId: 2, description: "QUIZ 1")', () => {
  const result = adminQuizDescriptionUpdate(1, 2, "QUIZ 1");
  expect(result).toEqual({});
});

// Test to check if the Quiz has any missing description:
test('Missing description (authUserId: 1, quizId: 1)', () => {
  const result = adminQuizDescriptionUpdate(1, 1);
  expect(result).toEqual({ error: "Description is required" });
});

// Tests to check for invalid AuthuserID type:
test('Invalid user ID type (authUserId: "one", quizId: 1, description: "Toohak Javascript Quiz 1")', () => {
  const result = adminQuizDescriptionUpdate('one', 1, "Toohak Javascript Quiz 1");
  expect(result).toEqual({ error: "Invalid user ID" });
});

test('Invalid user ID type (authUserId: "one", quizId: 2, description: "QUIZ 1")', () => {
  const result = adminQuizDescriptionUpdate('one', 2, "QUIZ 1");
  expect(result).toEqual({ error: "Invalid user ID" });
});

// Tests to check for invalid Quiz ID type:
test('Invalid quiz ID type (authUserId: 1, quizId: "one", description: "Toohak Javascript Quiz 1")', () => {
  const result = adminQuizDescriptionUpdate(1, 'one', "Toohak Javascript Quiz 1");
  expect(result).toEqual({ error: "Invalid quiz ID" });
});

test('Invalid quiz ID type (authUserId: 1, quizId: "two", description: "QUIZ 1")', () => {
  const result = adminQuizDescriptionUpdate(1, 'two', "QUIZ 1");
  expect(result).toEqual({ error: "Invalid quiz ID" });
});

// Tests for negative user ID
test('Negative user ID (authUserId: -1, quizId: 2, description: "Toohak Javascript Quiz 1")', () => {
  const result = adminQuizDescriptionUpdate(-1, 1, "Toohak Javascript Quiz 1");
  expect(result).toEqual({ error: "Invalid user ID" });
});

test('Negative user ID (authUserId: -1, quizId: 2, description: "QUIZ 1")', () => {
  const result = adminQuizDescriptionUpdate(-1, 2, "QUIZ 1");
  expect(result).toEqual({ error: "Invalid user ID" });
});

// Tests for negative quiz ID
test('Negative quiz ID (authUserId: 1, quizId: -1, description: "Toohak Javascript Quiz 1")', () => {
  const result = adminQuizDescriptionUpdate(1, -1, "Toohak Javascript Quiz 1");
  expect(result).toEqual({ error: "Invalid quiz ID" });
});

test('Negative quiz ID (authUserId: 1, quizId: -1, description: "QUIZ 1")', () => {
  const result = adminQuizDescriptionUpdate(1, -1, "QUIZ 1");
  expect(result).toEqual({ error: "Invalid quiz ID" });
});

// Test for empty description
test('Empty description (authUserId: 1, quizId: 1, description: "")', () => {
  const result = adminQuizDescriptionUpdate(1, 1, "");
  expect(result).toEqual({ error: "Description cannot be empty" });
});

// Test for description more than 100 characters
test('Description is more than 100 characters', () => {
  const longDescription = 'A'.repeat(101);
  const result = adminQuizDescriptionUpdate(1, 1, longDescription);
  expect(result).toEqual({ error: 'Description is more than 100 characters in length' });
});

// Test for description exactly 100 characters
test('Description is exactly 100 characters', () => {
  const longDescription = 'A'.repeat(100);
  const result = adminQuizDescriptionUpdate(1, 1, longDescription);
  expect(result).toEqual({});
});

// Test for description 99 characters
test('Description is exactly 99 characters', () => {
  const description = 'A'.repeat(99);
  const result = adminQuizDescriptionUpdate(1, 1, description);
  expect(result).toEqual({});
});

// Tests for non-existent quiz ID
test('Non-existent quiz ID (authUserId: 1, quizId: 999, description: "Non-existent Quiz")', () => {
  const result = adminQuizDescriptionUpdate(1, 999, "Non-existent Quiz");
  expect(result).toEqual({ error: "Quiz ID does not refer to a valid quiz" });
});

// Test for clear function
test('TOTAL RESET', () => {
  const result = clear();
  expect(result).toEqual({});
});