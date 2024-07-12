import { getData } from './dataStore';

<<<<<<< HEAD
export function getUserIdFromToken(sessionId: string): number {
  const result = parseFloat(sessionId);
  const store = getData();

  const sessArr = store.sessions;
  const session = sessArr.find((x) => {
    return x.sessionId === result;
  });
  if (!session) {
    return -1;
=======
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
>>>>>>> e08a276e77ceffef835467ac2bce35a4d8a3cc5a
  }

  return session.authUserId;
}
