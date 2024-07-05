import { getData } from '../src/dataStore';

export function createSessionId(): number {
  return Math.random();
}

export function getUserIdFromToken( token: string ): { authUserId: number } | { error: string } {
  const sessionId = parseInt(JSON.parse(token).token);

  const store = getData();
  const sessArr = store.sessions;
  const userArr = store.users;

  const session = sessArr.find((x) => x.sessionId === sessionId);
  if (!session) {
    return { error: 'invalid token'};
  }

  const authUserId = userArr.find((x) => x.authUserId === session.authUserId);
  if (!authUserId) {
    return { error: 'invalid authUserId'};
  }
  
  return authUserId;

}