import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// helper functions
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
	return (request('POST', SERVER_URL + '/v1/admin/auth/register',
	{ json: { email, password, nameFirst: firstName, nameLast: lastName } }
  ));
};

const createQuiz = (token : string, name : string, description : string) => {
	const res = request(
		'POST',
    SERVER_URL + '/v1/admin/quiz',
    { json: { token, name, description }, timeout: TIMEOUT_MS }
		);
		return JSON.parse(res.body.toString());
	};

	const updateThumbnail = (token: string, quizId: number, thumbnail: string) => {
		const res = request('PUT', SERVER_URL + `/v1/admin/quiz/${quizId}/thumbnail`, 
		{ headers: { token }, json: { thumbnail }, timeout: TIMEOUT_MS
		});
		return res;
	};

	const requestQuizInfo = (token : string, quizId : number) => {
		const res = request('GET', SERVER_URL + `/v2/admin/quiz/${quizId}`, { headers: { token } });
		return JSON.parse(res.body.toString());
		;
	};
////////////////////////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('PUT /v1/admin/quiz/:quizid/thumbnail', () => {
	describe('Error Cases', () => {
		let token: string;
		let quizId: number;
	
		beforeEach(() => {
			const user = createUser('z5525050@unsw.edu.au', '123ABX@#$', 'sidak', 'singh');
			token = JSON.parse(user.body.toString()).token;
			quizId = createQuiz(token, 'quizName', 'description').quizId;
		});
	
		// The imgUrl does not end with one of the following filetypes (case insensitive): jpg, jpeg, png
		test.each([
			{
				imgUrl: 'https://google.com/some/image/path.gif',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'https://google.com/some/image/path.com',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'https://google.com/some/document/path.docx',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'https://google.com/some/file/path.pdf',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'http://google.com/some/file/path.pptx',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'http://google.com/some/document/path.txt',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'http://google.com/some/song/path.mp3',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'http://google.com/some/song/path.mp4',
				errorMessage: expect.any(String),
			}
		])('Check fail for invalid thumbnail', ({ imgUrl, errorMessage }) => {
			const thumbnail = updateThumbnail(token, quizId, imgUrl);
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ error: errorMessage });
			expect(thumbnail.statusCode).toBe(400);
		});
	
		// The imgUrl does not begin with 'http://' or 'https://'
		test.each([
			{
				imgUrl: 'www.google.com',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'google.com',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'google',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'www.youtube.com',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'htt://google.com/some/image/path.mp3',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'htps://google.com/some/image/path.mp3',
				errorMessage: expect.any(String),
			},
			{
				imgUrl: 'tpps://google.com/some/image/path.mp3',
				errorMessage: expect.any(String),
			}
		])('Check fail for invalid thumbnail', ({ imgUrl, errorMessage }) => {
			const thumbnail = updateThumbnail(token, quizId, imgUrl);
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ error: expect.any(String) });
			expect(thumbnail.statusCode).toBe(400);
		});
	
		test('Token is empty', () => {
			const thumbnail = updateThumbnail('', quizId, 'https://google.com/some/image/path.jpg');
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ error: expect.any(String) });
			expect(thumbnail.statusCode).toBe(401);
		});
	
		test('Token is invalid', () => {
			const thumbnail = updateThumbnail('invalidToken', quizId, 'http://google.com/some/image/path.jpg');
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ error: expect.any(String) });
			expect(thumbnail.statusCode).toBe(401);
		});
	
		test('Invalid Quiz Id', () => {
			const thumbnail = updateThumbnail(token, quizId + 1, 'http://google.com/some/image/path.png');
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ error: expect.any(String) });
			expect(thumbnail.statusCode).toBe(403);
		});
	
		test('Quiz Id does not refer to a quiz that this user owns', () => {
			const thumbnail = updateThumbnail(token, quizId + 1, 'http://google.com/some/image/path.png');
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ error: expect.any(String) });
			expect(thumbnail.statusCode).toBe(403);
		});
	});
	
	describe('Success Cases', () => {
		let token: string;
		let quizId: number;
		
		beforeEach(() => {
			const user = createUser('z5525050@unsw.edu.au', '123ABC@#$', 'sidak', 'singh');
			token = JSON.parse(user.body.toString()).token;
			quizId = createQuiz(token, 'quizName', 'description').quizId;
		});
		
		test('Check that function returns empty object', () => {
			const thumbnail = updateThumbnail(token, quizId, '');
			console.log(thumbnail.body.toString());
			expect(JSON.parse(thumbnail.body.toString())).toStrictEqual({ });
		});
		
    test('Check thumbnail has been updated successfully through QuizInfo', () => {
			updateThumbnail(token, quizId, 'http://google.com/some/image/path.png');
			const result = requestQuizInfo(token, quizId);
			expect(result).toStrictEqual({
        quizId: quizId,
        name: expect.any(String),
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: expect.any(String),
        numQuestions: expect.any(Number),
        questions: expect.any(Array),
        duration: expect.any(Number),
				thumbnailUrl: 'http://google.com/some/image/path.png'
      });
		});

		test('Testing timeLastEdited property is the same as timeCreated', () => {
      const quiz = createQuiz(token, 'newQuiz', 'description');
      const initialTimeCreated = quiz.timeCreated;
      const initialTimeEdited = quiz.timeLastEdited;

      expect(initialTimeCreated).toEqual(initialTimeEdited);
    });

    test('Testing timeLastEdited property has been changed', (done) => {
      const createQuizResponse = createQuiz(token, 'newQuiz', 'description');
      const quizId = createQuizResponse.quizId;
      const initialTimeCreated = createQuizResponse.timeCreated;

      setTimeout(() => {
        const thumbnail = updateThumbnail(token, quizId, 'http://google.com/some/image/path.jpg');
				const result = requestQuizInfo(token, quizId);
				expect(result).toBeGreaterThan(initialTimeCreated);
				done();
			}, 1000);
    });
	});
});	
