import { adminQuizCreate, adminQuizRemove } from "../src/quiz.js";
import { adminAuthRegister } from "../src/auth.js";
import { clear } from "../src/other.js";

let authUserId;

beforeEach(() => {
	clear();
	authUserId = adminAuthRegister('z5525050@unsw.edu.au', '123ABCabc@#$', 'sidak', 'singh');
	validQuizId = adminQuizCreate(authUserId, 'validQuiz', 'valid description').quizId;
	otherUserId = adminAuthRegister('otherUser', 'otherPassword');
});

describe('Testing for errors', () => {
	test('AuthUserId is not a valid user', () => {
		const invalidUserId = 'invalidUserId';
		const result = adminQuizRemove(invalidUserId, validQuizId)
		expect(result).toStrictEqual({ error: 'AuthUserId is not a valid user' }) 
	});
	test('Quiz Id does not refer to a valid quiz', () => {
		const invalidQuizId = 'invalidQuizId';
		const result = adminQuizRemove(authUserId, invalidQuizId)
		expect(result).toStrictEqual({ error: 'Invalid quiz Id entered '})
	});
	test('Quiz ID does not refer to a quiz that this user owns ', () => {
		const result = adminQuizRemove(otherUserId, validQuizId)
		expect(result).toStrictEqual({ error: 'Quiz Id not owned by the user '})
	});
});

