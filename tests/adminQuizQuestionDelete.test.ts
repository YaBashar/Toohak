import request from 'sync-request-curl';
import { port, url } from '../src/config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('DELETE /v1/admin/quiz/:quizid/question/:questionid' ,() => {
	let token1: string;
	let token2: string;
	let qid: { quizId: number, questionId: number};
	let q2id: { quizId: number, questionId: number};

	beforeEach(() => {
		const uid1 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5525050@unsw.edu.au', password: '123ABCabc@#$', nameFirst: 'sidak', nameLast: 'singh' } });
		token1 = JSON.parse(uid1.body.toString()).token;

		let response = request('POST' ,SERVER_URL + '/v1/admin/quiz/:quizid/question', {  json: {
			token: token1,
			questionBody: {
				question: 'Who is the Monarch of England?',
				duration: 4,
				points: 5,
				answers: [
					{
						answer: 'Prince Charles',
						correct: true,
					},
					{
						answer: 'Queen Elizabeth',
						correct: false,
					}
				]
			}
		}});
		qid = JSON.parse(response.body.toString());

		const uid2 = request('POST', SERVER_URL + '/v1/admin/auth/register', { json: { email: 'z5555555@unsw.edu.au', password: 'abs@#$234', nameFirst: 'brim', nameLast: 'johnson' } });
    token2 = JSON.parse(uid2.body.toString()).token;
		response = request('POST' ,SERVER_URL + '/v1/admin/quiz/:quizid/question', {  json: {
			token: token2,
			questionBody: {
				question: 'Who is the Monarch?',
				duration: 3,
				points: 4,
				answers: [
					{
						answer: 'Prince',
						correct: true,
					},
					{
						answer: 'Queen',
						correct: false,
					}
				]
			}
		}});
		q2id = JSON.parse(response.body.toString());
	});

	// test to check if token is invalid
	test('Token is invalid', () => {
		const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId}/question/${qid.questionId}`, {
			qs: {
				token: 'invalidAuthUserId',
				quizid: qid.quizId,
				questionid: qid.questionId,
			},
			timeout: TIMEOUT_MS
		});
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toBe(401); 
	});

	// test to check if token is empty
	test('Token is empty', () => {
		const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId}/question/${qid.questionId}`, {
			qs: {
				token: '',
				quizid: qid.quizId,
				questionid: qid.questionId,
			},
			timeout: TIMEOUT_MS
		});
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toBe(401);
	});

	// test to check quiz Id does not refer to a valid quiz
	test('Quiz Id does not refer to a valid quiz', () => {
		const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId + 1}/question/${qid.questionId}`, {
			qs: {
				token: token1,
				quizid: qid.quizId + 1,
				questionid: qid.questionId,
			},
			timeout: TIMEOUT_MS
		});
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toBe(403);
	});

	// test to check if quiz ID does not refer to a quiz that this user owns
	test('Quiz ID does not refer to a quiz that this user owns', () => {
		const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${q2id.quizId}/question/${q2id.questionId}`, {
			qs: {
				token: token1,
				quizid: qid.quizId,
				questionid: qid.questionId,
			},
			timeout: TIMEOUT_MS
		});
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toBe(403);
	});

	// Question Id does not refer to a valid question within this quiz
	test('Question Id does not refer to a valid question within this quiz', () => {
		const res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId}/question/${qid.questionId + 1}`, {
			qs: {
				token: token1,
				quizid: qid.quizId,
				questionid: qid.questionId + 1,
			},
			timeout: TIMEOUT_MS
		});
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toBe(400);
	});

	// test to check if the question is removed from the list of questions
	test('Question is removed from the list of questions', () => {
		// we cant check the list of quizes later to check if we've deleted the question or not so use other approach
		let res = request('DELETE', SERVER_URL + `/v1/admin/quiz/${qid.quizId}/question/${qid.questionId}`, {
			qs: {
				token: token1,
				quizid: qid.quizId,
				questionid: qid.questionId,
			},
			timeout: TIMEOUT_MS
		});
		expect(JSON.parse(res.body.toString())).toStrictEqual({});
		expect(res.statusCode).toBe(200);	
	});
});
