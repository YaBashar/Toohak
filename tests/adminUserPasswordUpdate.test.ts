import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

let token: string;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizId/question/:questionId', () => {
  // Question Id does not refer to a valid question within this quiz
  test('Incorrect password', () => {

  });

  // Old password and new password are the same
  test('Old password is the same as the new password', () => {

  });

  // Question string is less than 5 characters in length or greater than 50 characters in length
  test('New password has been used before', () => {

  });

  // The question has more than 6 answers or less than 2 answers
  test('Invalid password length', () => {

  });

  // The question duration is not a positive number
  test('Password does not contain at least one number and one letter', () => {

  });

  // If this question were to be updated, the sum of the question durations in the quiz exceeds 3 minutes
  test('Success case', () => {

  });

  // The points awarded for the question are less than 1 or greater than 10
  test('Old password is the same as the new password', () => {

  });

  // The length of any answer is shorter than 1 character long, or longer than 30 characters long
  test('New password has been used before', () => {

  });

  // Any answer strings are duplicates of one another (within the same question)
  test('Invalid password length', () => {

  });

  // There are no correct answers
  test('Password does not contain at least one number and one letter', () => {

  });

  // success case
  test('Success case', () => {

  });
});
