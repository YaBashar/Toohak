import { adminQuizList } from '../src/quiz.js'
import { clear } from '../src/other.js'

beforeEach(() => {
  clear();
});

describe('Testing for errors', () => {
  // AuthUserId isn't valid
  test('Invalid AuthUserId', () => {
    const result1 = adminQuizList('randomstring');
    expect(result1).toStrictEqual({error: expect.any(String)});

    const result2 = adminQuizList(1);
    expect(result2).toStrictEqual({error: expect.any(String)});
  });
});