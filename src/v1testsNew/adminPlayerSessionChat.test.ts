import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions for requests
/////////////////////////////////////////////////////////////
const registerUser = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: { email, password, nameFirst, nameLast },
      timeout: TIMEOUT_MS,
    }
  );
  return JSON.parse(res.body.toString());
};

const requestCreateQuiz = (token: string, name: string, description: string) => {
  const quiz = request('POST', SERVER_URL + '/v1/admin/quiz', {
    json: { token, name, description },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(quiz.body.toString()).quizId;
};

const createQuizQuestion = (token: string, quizId: number, question: string, duration: number, points: number, thumbnailUrl: string, answers: object) => {
  return request('POST', SERVER_URL + `/v2/admin/quiz/${quizId}/question`, {
    headers: { token },
    json: {
      questionBody: { question, duration, points, thumbnailUrl, answers }
    }
  });
};

const requestCreateSession = (token: string, quizId: number, autoStartNum: number) => {
  const session = request('POST', SERVER_URL + `/v1/admin/quiz/${quizId}/session/start`, {
    headers: { token },
    json: { autoStartNum },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(session.body.toString());
};

const requestPlayerJoin = (sessionId: number, name: string) => {
  const player = request('POST', SERVER_URL + '/v1/player/join', {
    json: { sessionId, name },
    timeout: TIMEOUT_MS
  });
  return JSON.parse(player.body.toString());
};

const sendMessage = (playerId: number, messageBody: string) => {
  return request(
    'POST',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      json: { message: messageBody },
      timeout: TIMEOUT_MS,
    }
  );
};

const getMessages = (playerId: number) => {
  return request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    { timeout: TIMEOUT_MS }
  );
};
/////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminPlayerSessionChat Tests', () => {
  describe('Error Cases', () => {
    let token: string;
    let playerId1: number;
    let playerId2: number;
    let sessionId: number;
    let quizId: number;

    beforeEach(() => {
      const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
      token = user.token;

      quizId = requestCreateQuiz(token, 'Test Quiz', 'Test Description');
      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = session.sessionId;

      const player1 = requestPlayerJoin(sessionId, 'Mubashir');
      const player2 = requestPlayerJoin(sessionId, 'Mohammad');
      requestPlayerJoin(sessionId, 'Syed');
      
      playerId1 = player1.playerId;
      playerId2 = player2.playerId;
    });

    test('Player ID does not exist', () => {
      const res = request('GET', SERVER_URL + `/v1/player/${playerId1 + 1}/chat`, { timeout: TIMEOUT_MS });
      const body = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(400);
      expect(body).toStrictEqual({ error: 'Player ID does not exist' });
    });

    test('No messages in session', () => {
      const res = getMessages(playerId1);
      const body = JSON.parse(res.body.toString());
      expect(res.statusCode).toBe(200);
      expect(body).toStrictEqual({ messages: [] });
    });
  });

  describe('Success Cases', () => {
    let token: string;
    let playerId1: number;
    let playerId2: number;
    let sessionId: number;
    let quizId: number;

    beforeEach(() => {
      const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
      token = user.token;
      console.log(token);

      quizId = requestCreateQuiz(token, 'Test Quiz', 'Test Description');
      console.log(quizId);
      createQuizQuestion(token, quizId, 'Who is the Monarch of England?', 4, 5, 'https://example.com/image-thumbnail-12345.jpg', [
        { answer: 'Prince Charles', correct: true },
        { answer: 'Queen Elizabeth', correct: false }
      ]);

      const session = requestCreateSession(token, quizId, 3);
      sessionId = session.sessionId;
      console.log(sessionId);

      const player1 = requestPlayerJoin(sessionId, 'Mubashir');
      const player2 = requestPlayerJoin(sessionId, 'Mohammad');
      requestPlayerJoin(sessionId, 'Syed');
      
      
      playerId1 = player1.playerId;
      playerId2 = player2.playerId;
    });

    test('Send and retrieve messages within the same session', () => {
      sendMessage(playerId1, 'Test Message') 
      getMessages(playerId1);
      const res = getMessages(playerId1);
      expect(res.body.toString()).toStrictEqual({
      });
    });

    test('Retrieve messages with varying timestamps', () => {
      const messages = [
        'First message',
        'Second message',
        'Third message'
      ];
      
      messages.forEach(message => sendMessage(playerId1, message));
      const moreMessages = [
        'Fourth message',
        'Fifth message'
      ];
      moreMessages.forEach(message => sendMessage(playerId1, message));

      const res = getMessages(playerId1);
      const body = JSON.parse(res.body.toString());
      const retrievedMessages = body.messages;

      expect(res.statusCode).toBe(200);
      expect(retrievedMessages).toHaveLength(messages.length + moreMessages.length);

      const currentTime = Math.floor(Date.now() / 1000);
      retrievedMessages.forEach((msg: any, index: number) => {
        expect(msg.message).toBe(messages[index] || moreMessages[index - messages.length]);
        expect(msg.timeSent).toBeGreaterThanOrEqual(currentTime - 2);  
        expect(msg.timeSent).toBeLessThanOrEqual(currentTime);
      });
    });

    test('Retrieve messages from multiple players', async () => {
      // Send messages from player 1
      const messagesPlayer1 = [
        'Player 1, first message.',
        'Player 1, second message.'
      ];
      messagesPlayer1.forEach(message => sendMessage(playerId1, message));

      // Send messages from player 2
      const messagesPlayer2 = [
        'Player 2, first message.',
        'Player 2, second message.'
      ];
      messagesPlayer2.forEach(message => sendMessage(playerId2, message));

      await new Promise(resolve => setTimeout(resolve, 1000));  

      // Retrieve messages for player 1
      const res1 = getMessages(playerId1);
      const body1 = JSON.parse(res1.body.toString());
      const retrievedMessages1 = body1.messages;

      expect(res1.statusCode).toBe(200);
      expect(retrievedMessages1).toHaveLength(messagesPlayer1.length + messagesPlayer2.length);

      const currentTime = Math.floor(Date.now() / 1000);
      retrievedMessages1.forEach((msg: any, index: number) => {
        expect(msg.message).toBe(messagesPlayer1[index] || messagesPlayer2[index - messagesPlayer1.length]);
        expect(msg.timeSent).toBeGreaterThanOrEqual(currentTime - 1);
        expect(msg.timeSent).toBeLessThanOrEqual(currentTime);
      });

      // Retrieve messages for player 2
      const res2 = getMessages(playerId2);
      const body2 = JSON.parse(res2.body.toString());
      const retrievedMessages2 = body2.messages;

      expect(res2.statusCode).toBe(200);
      expect(retrievedMessages2).toHaveLength(messagesPlayer1.length + messagesPlayer2.length);

      retrievedMessages2.forEach((msg: any, index: number) => {
        expect(msg.message).toBe(messagesPlayer1[index] || messagesPlayer2[index - messagesPlayer1.length]);
        expect(msg.timeSent).toBeGreaterThanOrEqual(currentTime - 1);
        expect(msg.timeSent).toBeLessThanOrEqual(currentTime);
      });
    });
  });
});
