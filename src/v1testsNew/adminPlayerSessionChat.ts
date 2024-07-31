import request from 'sync-request-curl';
import { port, url } from '../config.json';

const SERVER_URL = `${url}:${port}`;
const TIMEOUT_MS = 5 * 1000;

// Helper Functions
const createUser = (email: string, password: string, firstName: string, lastName: string) => {
    return request('POST', SERVER_URL + '/v1/admin/auth/register', {
        json: { email, password, nameFirst: firstName, nameLast: lastName }
    });
};

const createQuiz = (token: string, name: string, description: string) => {
    const res = request('POST', SERVER_URL + '/v2/admin/quiz', {
        headers: { token },
        json: { name, description }
    });
    return JSON.parse(res.body.toString());
};

const requestCreateSession = (token: string, quizid: number, autoStartNum: number) => {
    return request('POST', SERVER_URL + `/v1/admin/quiz/${quizid}/session/start`, {
        headers: { token },
        json: { autoStartNum },
        timeout: TIMEOUT_MS
    });
};

const requestPlayerJoin = (sessionId: number, name: string) => {
    return request('POST', SERVER_URL + '/v1/player/join', {
        json: { sessionId, name },
        timeout: TIMEOUT_MS
    });
};

const sendMessage = (playerId: number, message: string) => {
    return request('POST', SERVER_URL + `/v1/player/${playerId}/message`, {
        json: { message },
        timeout: TIMEOUT_MS
    });
};

const getChatMessages = (playerId: number) => {
    const res = request('GET', SERVER_URL + `/v1/player/${playerId}/chat`);
    return JSON.parse(res.body.toString());
};

const isTimestampCloseEnough = (timestamp: number, expectedTime: number) => {
    const ONE_SECOND = 1000;
    return Math.abs(timestamp - expectedTime) <= ONE_SECOND;
};

beforeEach(() => {
    // Clear the server state before each test
    request('DELETE', SERVER_URL + '/v1/clear');
});

describe('adminPlayerSessionChat Tests', () => {
    let playerId: number;
    let sessionId: number;
    let quizId: number;
    let token: string;

    beforeEach(() => {
        // Create a user and a quiz
        const userResponse = createUser('user@unsw.edu.au', '123ABCabc@#$', 'Test', 'User');
        token = JSON.parse(userResponse.body.toString()).token;

        const quizResponse = createQuiz(token, 'Test Quiz', 'Test Description');
        quizId = JSON.parse(quizResponse.body.toString()).quizId;

        // Create a session for the quiz
        const sessionResponse = requestCreateSession(token, quizId, 1);
        sessionId = JSON.parse(sessionResponse.body.toString()).sessionId;

        // Create a player and join the session
        const playerResponse = requestPlayerJoin(sessionId, 'Test Player');
        playerId = JSON.parse(playerResponse.body.toString()).playerId;

        // Optionally: Send some messages in the session
        sendMessage(playerId, 'Hello world');
    });

    test('Successfully retrieve chat messages for a valid player with multiple messages', () => {
        // Send multiple messages
        sendMessage(playerId, 'Second message');
        sendMessage(playerId, 'Third message');

        const res = getChatMessages(playerId);
        expect(res.statusCode).toBe(200);
        const messages = res.messages;
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThanOrEqual(3); // At least 3 messages (including initial one)
        messages.forEach(message => {
            expect(message.timeSent).toBeDefined();
            expect(isTimestampCloseEnough(message.timeSent, Date.now())).toBe(true);
        });
    });

    test('Successfully retrieve chat messages for a valid player with messages from multiple users', () => {
        // Create and join another player
        const anotherPlayerResponse = requestPlayerJoin(sessionId, 'Another Player');
        const anotherPlayerId = JSON.parse(anotherPlayerResponse.body.toString()).playerId;

        // Send messages from both players
        sendMessage(playerId, 'Player 1 message');
        sendMessage(anotherPlayerId, 'Player 2 message');

        // Retrieve messages
        const res = getChatMessages(playerId);
        expect(res.statusCode).toBe(200);
        const messages = res.messages;
        expect(Array.isArray(messages)).toBe(true);
        expect(messages.length).toBeGreaterThanOrEqual(2); // At least 2 messages from different users
        messages.forEach(message => {
            expect(message.timeSent).toBeDefined();
            expect(isTimestampCloseEnough(message.timeSent, Date.now())).toBe(true);
        });
    });

    test('Unauthorized access with invalid token', () => {
        const res = request('GET', SERVER_URL + `/v1/player/${playerId}/chat`, {
            headers: { token: 'invalid_token' }
        });
        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'invalid token' });
    });

    test('Retrieve chat messages for a player ID not in current session', () => {
        // Create a new session
        const newSessionResponse = requestCreateSession(token, quizId, 1);
        const newSessionId = JSON.parse(newSessionResponse.body.toString()).sessionId;

        // Join a player to the new session
        const newPlayerResponse = requestPlayerJoin(newSessionId, 'New Player');
        const newPlayerId = JSON.parse(newPlayerResponse.body.toString()).playerId;

        // Retrieve messages for a player who is not part of the original session
        const res = getChatMessages(newPlayerId);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'player ID does not exist' });
    });

    test('Check response time for retrieving chat messages', () => {
        const startTime = Date.now();
        const res = getChatMessages(playerId);
        const endTime = Date.now();
        expect(res.statusCode).toBe(200);
        expect(endTime - startTime).toBeLessThanOrEqual(2000); // Response time should be less than or equal to 2 seconds
    });

    test('Retrieve chat messages for player with no messages', () => {
        // Create a new player without sending any messages
        const newPlayerResponse = requestPlayerJoin(sessionId, 'Player with no messages');
        const newPlayerId = JSON.parse(newPlayerResponse.body.toString()).playerId;

        // Retrieve messages for the player with no messages
        const res = getChatMessages(newPlayerId);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res.body.toString()).messages).toEqual([]); // Should return an empty array
    });

    test('Retrieve chat messages with invalid player ID', () => {
        // Use an invalid player ID
        const invalidPlayerId = 999999;

        const res = getChatMessages(invalidPlayerId);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res.body.toString())).toStrictEqual({ error: 'player ID does not exist' });
    });
});