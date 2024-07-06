import { getData } from './dataStore';

export function createSessionId(): number {
  return Math.random();
}

export function getUserIdFromToken( token: string ):  number  | { error: string } {
  const sessionId = JSON.parse(token);
  const testing = sessionId.token;
  const store = getData();
  const sessArr = store.sessions;

  const session = sessArr.find((x) => x.sessionId === testing);
  if (!session) {
    return { error: 'invalid token'};
  }

  return session.authUserId;
}
