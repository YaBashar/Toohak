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
/////////////////////////////////////////////////////////////

beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

afterEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { timeout: TIMEOUT_MS });
});

describe('adminPlayerSessionChatSend Tests', () => {
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
      const res = request('POST', SERVER_URL + `/v1/player/${playerId + 1}/chat`, { json: { message: 'Hello' }, timeout: TIMEOUT_MS });
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Player ID does not exist' });
    });

    test('Message body is less than 1 character', () => {
      const res = sendMessage(playerId, '');
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Message body is less than 1 character' });
    });

    test('Message body is more than 100 characters', () => {
      const longMessage = 'a'.repeat(101);
      const res = sendMessage(playerId, longMessage);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Message body is more than 100 characters' });
    });

    test('Message body contains only whitespace', () => {
      const res = sendMessage(playerId, ' '.repeat(10));
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'Message body is less than 1 character' });
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

    test('Send a valid chat message', () => {
      const res = sendMessage(playerId, 'Hello, this is a test message.');
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });

    test('Send a chat message exactly 100 characters long', () => {
      const validMessage = 'a'.repeat(100);
      const res = sendMessage(playerId, validMessage);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res.body.toString())).toStrictEqual({});
    });
  });
});