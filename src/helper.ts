import { getData } from './dataStore';

export function createSessionId(): number {
  return Math.random();
}

export function getUserIdFromToken(sessionId: string): number | { error: string } {
  console.log('Received sessionId:', sessionId);

  const result = parseFloat(sessionId);
  console.log('Parsed sessionId:', result);

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
