import { getData } from './dataStore';

export function createSessionId(): number {
  return Math.random();
}

<<<<<<< HEAD
export function getUserIdFromToken( token: string ): { authUserId: number } | { error: string } {
  const sessionId = parseInt(JSON.parse(token).token);
=======
export function getUserIdFromToken(sessionId: string): number | { error: string } {
  const result = parseFloat(sessionId);
>>>>>>> 7bb7eaf654ed5f9c0fc66f0053ede09b1fdd6b3d

  const store = getData();
  const sessArr = store.sessions;

<<<<<<< HEAD
  const session = sessArr.find((x) => x.sessionId === sessionId);
  if (!session) {
    return { error: 'invalid token'};
  }

  return { authUserId: session.authUserId};
=======
  const session = sessArr.find((x) => {
    console.log(x.sessionId, result, x.sessionId === result);
    return x.sessionId === result;
  });
  if (!session) {
    return { error: 'invalid token' };
  }

  return session.authUserId;
>>>>>>> 7bb7eaf654ed5f9c0fc66f0053ede09b1fdd6b3d
}
