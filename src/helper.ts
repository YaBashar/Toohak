import { getData } from './dataStore';
import { isEmail } from 'validator';
import { Question } from './interface';

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

// generates a random number that has not yet been used as a
// user, session or quiz id. 
export function createDataStoreId(): number {
  const sessArr = getData().sessions;
  let id: number;

  do {
    id = Math.floor(Math.random() * 1000000) + 1;
  } while (sessArr.some(x => x.userId === id || x.sessionId === id));

  return id;  
}

// generates a random number that has not yet been used as a 
// questionId for a given Quiz
export function createQuestionId(quesArr: Question[]): number {
  let id: number;

  do {
    id = Math.floor(Math.random() * 1000000) + 1;
  } while (quesArr.some(x => x.questionId === id ));

  return id;
}


/*
  HELPER FUNCTIONS FOR AUTH RELATED ERROR CHECKS
*/

// checks that email being registered is valid and new
function checkEmail(email: string): void {
  const userArr = getData().users;
  if(!isEmail(email)) {
    throw new Error('Email is not a valid email address.');
  } else if(!findUserIndexFromEmail(email)) {
    throw new Error('User already exists with this email address.')
  }
}

function checkName(name: string): void {
  if (/[^A-Za-z' -]/.test(name)){
    throw new Error('Name contains invalid characters.');
  } else if (name.length < 2 || name.length > 20) {
    throw new Error('Name must be between 2 and 20 characters.');
  }
}

function checkPassword(password:string): void {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  } else if (!(/\d/.test(password) && /[a-zA-Z]/.test(password))) {
    throw new Error('Password must contain at least one number and one letter');
  }
}


/*
  HELPER FUNCTIONS FOR FUNCTION GROUP ERROR TESTING
*/
export function checkAdminAuthRegister(email: string, password: string, 
  nameFirst: string, nameLast: string) {
    try {
      checkEmail(email);
      checkName(nameFirst);
      checkName(nameLast);
      checkPassword(password);
    } catch (e) {
      throw Error(e.message);
    }
  }