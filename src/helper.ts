import { getData } from './dataStore';

export function createSessionId(): number {
  return Math.random();
}

export function getUserIdFromToken( token: string ): { authUserId: number } | { error: string } {
  const sessionId = parseInt(JSON.parse(token).token);

  const store = getData();
  const sessArr = store.sessions;

  const session = sessArr.find((x) => x.sessionId === sessionId);
  if (!session) {
    return { error: 'invalid token'};
  }

  return { authUserId: session.authUserId};
}