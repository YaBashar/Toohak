import { getData } from './dataStore';

export function getUserIdFromToken(sessionId: string): number | { error: string } {
  const result = parseFloat(sessionId);
  const store = getData();

  const sessArr = store.sessions;
  const session = sessArr.find((x) => {
    return x.sessionId === result;
  });
  if (!session) {
    return { error: 'invalid token' };
  }

  return session.authUserId;
}
