import { getData } from './dataStore';
import { User } from './interface';

export function getUserIdFromToken(sessionId: string): number {
  const result = parseFloat(sessionId);
  const store = getData();

  const sessArr = store.sessions;
  const session = sessArr.find((x) => {
    return x.sessionId === result;
  });
  if (!session) {
    return -1;
  }

  return session.userId;
}

/*
  HELPER FUNCTIONS FOR FINDING COMMON VALUES IN DATASTORE
*/

// returns the userId associated with a session 
export function findUserIdFromSessionId(target: number): number {
  const sessArr = getData().sessions;
  return (sessArr.find(session => (session.sessionId === target))).userId;
}

// returns the index of user with userId in users array
export function findUserIndexFromUserId(target: number): number {
  const userArr = getData().users;
  return (userArr.findIndex(user => (user.userId === target)));
}

// returns the index of user with email in users array
export function findUserIndexFromEmail(target: string): number {
  const userArr = getData().users;
  return (userArr.findIndex(user => (user.email === target)));
}

// returns the index of session with sessionId in sessions array
export function findSessionIndexFromSessionId(target: number): number {
  const sessArr = getData().sessions;
  return (sessArr.findIndex(session => (session.sessionId == target)));
}

// returns the index of quiz with quizId in quizzes array
export function findQuizIndexFromQuizId(target: number): number {
  const quizArr = getData().quizzes;
  return (quizArr.findIndex(quiz => (quiz.quizId == target)));
}

// returns the index of quiz with quizId in trash
export function findDelQuizIndexFromQuizId(target: number): number {
  const trashArr = getData().trash;
  return (trashArr.findIndex(quiz => (quiz.quizId == target)));
}


/*
  HELPER FUNCTIONS FOR CREATING UNIQUE AND RANDOM NUMBER IDS
*/


export function createUserId(userArr: User[]): number {

  let userId: number;

  do {
    userId = Math.floor(Math.random() * 1000000) + 1;
  } while (userArr.find(user => (user.userId === userId)));

  return userId;  

}