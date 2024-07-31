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

const createSession = (token: string, sessionName: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/session/create',
    {
      json: { token, sessionName },
      timeout: TIMEOUT_MS,
    }
  );
  return JSON.parse(res.body.toString());
};

const joinSession = (token: string, sessionId: number) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/player/session/${sessionId}/join`,
    {
      json: { token },
      timeout: TIMEOUT_MS,
    }
  );
  return JSON.parse(res.body.toString());
};

const sendMessage = (playerId: number, message: string) => {
  const res = request(
    'POST',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    {
      json: { message },
      timeout: TIMEOUT_MS,
    }
  );
  return JSON.parse(res.body.toString());
};

const getMessages = (playerId: number) => {
  const res = request(
    'GET',
    SERVER_URL + `/v1/player/${playerId}/chat`,
    { timeout: TIMEOUT_MS }
  );
  return JSON.parse(res.body.toString());
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
    let playerId: number;
    let sessionId: number;

    beforeEach(() => {
      const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
      token = user.token;
      const session = createSession(token, 'Test Session');
      sessionId = session.sessionId;
      const player = joinSession(token, sessionId);
      playerId = player.playerId;
    });

    test('Player ID does not exist', () => {
      const res = request('GET', SERVER_URL + `/v1/player/${playerId + 1}/chat`, { timeout: TIMEOUT_MS });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Player ID does not exist' });
    });

    test('No messages in session', () => {
      const res = getMessages(playerId);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ messages: [] });
    });
  });

  describe('Success Cases', () => {
    let token: string;
    let playerId: number;
    let sessionId: number;

    beforeEach(() => {
      const user = registerUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
      token = user.token;
      const session = createSession(token, 'Test Session');
      sessionId = session.sessionId;
      const player = joinSession(token, sessionId);
      playerId = player.playerId;
    });

    test('Send and retrieve messages within the same session', () => {
      const messages = [
        'Hello, this is the first message.',
        'This is the second message.',
        'And this is the third message.'
      ];
      
      messages.forEach(message => sendMessage(playerId, message));

      const res = getMessages(playerId);
      const retrievedMessages = JSON.parse(res.body.toString()).messages;

      expect(res.statusCode).toBe(200);
      expect(retrievedMessages).toHaveLength(messages.length);

      const currentTime = Math.floor(Date.now() / 1000);
      retrievedMessages.forEach((msg: any, index: number) => {
        expect(msg.message).toBe(messages[index]);
        expect(msg.timeSent).toBeGreaterThanOrEqual(currentTime - 1);
        expect(msg.timeSent).toBeLessThanOrEqual(currentTime);
      });
    });

    test('Retrieve messages with varying timestamps', () => {
      const messages = [
        'First message',
        'Second message',
        'Third message'
      ];
      
      messages.forEach(message => sendMessage(playerId, message));

      setTimeout(() => {
        const moreMessages = [
          'Fourth message',
          'Fifth message'
        ];
        moreMessages.forEach(message => sendMessage(playerId, message));
        
        const res = getMessages(playerId);
        const retrievedMessages = JSON.parse(res.body.toString()).messages;

        expect(res.statusCode).toBe(200);
        expect(retrievedMessages).toHaveLength(messages.length + moreMessages.length);

        const currentTime = Math.floor(Date.now() / 1000);
        retrievedMessages.forEach((msg: any, index: number) => {
          expect(msg.message).toBe(messages[index] || moreMessages[index - messages.length]);
          expect(msg.timeSent).toBeGreaterThanOrEqual(currentTime - 2);  
          expect(msg.timeSent).toBeLessThanOrEqual(currentTime);
        });
      }, 1000);
    });
  });
});