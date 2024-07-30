import request from 'sync-request-curl';
import { port, url } from '../config.json';
import { Actions } from '../game';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// helper functions
const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
	const uid = (request('POST', SERVER_URL + '/v1/admin/auth/register', {
		json: { email, password, nameFirst, nameLast }, timeout: TIMEOUT_MS
	}));
	return JSON.parse(uid.body.toString()).token;
};
const requestCreateQuiz = (token: string, name : string, description : string) => {
	const quiz = (request('POST', SERVER_URL + '/v1/admin/quiz', {
		json: { token, name, description }, timeout: TIMEOUT_MS
	}));
	return JSON.parse(quiz.body.toString()).quizId;
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
	const sessId = (request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
		headers: { token }, json: { autoStartNum: autoStartNum }, timeout: TIMEOUT_MS
	}));
	return JSON.parse(sessId.body.toString()).sessionId;
};


const requestPlayerJoin = (sessionId: number, name: string) => {
	return (request('POST', SERVER_URL + '/v1/player/join', {
		json: { sessionId, name }, timeout: TIMEOUT_MS
	}));	
};	

const createQuizQuestion = (token: string, quizid: number, question: string, duration: number, points: number, answers: object) => {
	return request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/question`, {
		json: {
			token,
			questionBody: {
				question,
				duration,
				points,
				answers
			}
		}
	});	
};

 const sessionState = (quizid: number, sessionid: number, token: string) => {
   const res = request('GET', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
     headers: { token }
   })
 return JSON.parse(res.body.toString());};


  const updateState = (quizid: number, sessionid: number, token: string, action: Actions) => {
    const res = request('PUT', `${SERVER_URL}/v1/admin/quiz/${quizid}/session/${sessionid}`, {
      headers: { token }, json: { action }
    })
  return JSON.parse(res.body.toString());};

 const submitAnswer = (answerids: [number], playerid: number, questionposition: number) => {
   const res = request('PUT', `${SERVER_URL}/v1/player/${playerid}/question/${questionposition}/answer`, {
     json: { answerids }
   })
   return { body: JSON.parse(res.body.toString()), statusCode: res.statusCode };
 }

const quizSessionFinalResult = (token: string, quizid: number, sessionid: number) => {
	return request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}/results`, {
		headers: { token }, timeout: TIMEOUT_MS
	});
}

const quizSessionFinalResultCSV = (token: string, quizid: number, sessionid: number) => {
	return request('GET', SERVER_URL + `/v1/admin/quiz/${quizid}/session/${sessionid}/results/csv`, {
		headers: { token }, timeout: TIMEOUT_MS
	});
}

beforeEach(() => {
	request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});


describe('GET /v1/admin/quiz/:quizid/session/:sessionid/results', () => {
	let token: string;
	let quizId: number;
	let sessionId: number;
	beforeEach(() => {
		token = requestAuthRegister('z5525050@unsw.edu.au', '123ABCabc!@#', 'sidak', 'singh');
		quizId = requestCreateQuiz(token, 'quiz1', 'quiz description');
		sessionId = requestCreateSession(token, quizId, 3);
	});

	test('SessionId does not refer to a valid session', () => {
		const res = quizSessionFinalResult(token, quizId, sessionId + 1);
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toStrictEqual(400);
	});

	test('Session is not in FINAL_RESULTS state', () => {
		const res = quizSessionFinalResult(token, quizId, sessionId);
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toStrictEqual(400);
	});

	test('Token is empty', () => {
		const res = quizSessionFinalResult('', quizId, sessionId);
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toStrictEqual(401);
	});

	test('Token is invalid', () => {
		const res = quizSessionFinalResult('invalid token', quizId, sessionId);
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toStrictEqual(401);
	});
	
	test('Quiz does not exist', () => {
		const res = quizSessionFinalResult(token, quizId + 1, sessionId);
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toStrictEqual(403);
	});

	test('User is not the owner of the quiz', () => {
		const token2 = requestAuthRegister('z5555555@unsw.edu.au', 'AAA123!@#b', 'veer', 'sheth');
		const res = quizSessionFinalResult(token2, quizId, sessionId);
		expect(JSON.parse(res.body.toString())).toStrictEqual({ error: expect.any(String) });
		expect(res.statusCode).toStrictEqual(403);
	});
	// success case 
	// Get the a link to the final results (in CSV format) for all players for a completed quiz session
	// "url": "http://google.com/some/image/path.csv"
	test('Success Case', () => {
		
	})

});