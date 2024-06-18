import { adminQuizCreate, adminQuizRemove } from "../src/quiz.js";
import { adminAuthRegister } from "../src/auth.js";
import { clear } from "../src/other.js";

beforeEach(() => {
	clear();
});

describe('Testing for adminQuizRemove function', () => {
	const authUserId = adminAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh').authUserId;
	const validQuizId = adminQuizCreate(authUserId, 'validQuiz', 'valid description').quizId;
	const otherUserId = adminAuthRegister('z5555555@unsw.edu.au', 'abs@#$234', 'brim', 'Johnson').authUserId;

	// test to check if the authUserId is invalid
	test("AuthUserId is invalid", () => {
		const result = adminQuizCreate('invalidAuthUserId', 'Sidak', 'valid description');
		expect(result).toStrictEqual({ error: 'Invalid User id' });
	});
	// test to check quiz Id does not refer to a valid quiz
	test('Quiz Id does not refer to a valid quiz', () => {
		const invalidQuizId = 'invalidQuizId';
		const result = adminQuizRemove(authUserId, invalidQuizId)
		expect(result).toStrictEqual({ error: 'Invalid quiz Id entered'})
	});
	// test to check if quiz ID does not refer to a quiz that this user owns
	test('Quiz ID does not refer to a quiz that this user owns ', () => {
		const result = adminQuizRemove(otherUserId, validQuizId)
		expect(result).toStrictEqual({ error: 'Quiz Id not owned by the user'})
	});
	// write a test to check if the quiz is removed from the list of quizzes
	test('Quiz is removed from the list of quizzes', () => {
		const result = adminQuizRemove(authUserId, validQuizId);
		expect(result).toStrictEqual({});
	});
});

