import { getData } from './dataStore';

export function createSessionId(): number {
  return Math.random();
}

export function getUserIdFromToken(sessionId: string): number | { error: string } {
  const result = parseInt(sessionId);

  const store = getData();
  const sessArr = store.sessions;

  const session = sessArr.find((x) => x.sessionId === result);
  if (!session) {
    return { error: 'invalid token' };
  }

  return session.authUserId;
}
