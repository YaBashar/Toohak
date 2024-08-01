import { getData } from './dataStore';
import { isEmail } from 'validator';
import { Question, User, Quiz, Game, Store } from './interface';
import { getHashOf } from './hash';

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
  return (sessArr.findIndex(session => (session.sessionId === target)));
}

// returns the index of quiz with quizId in quizzes array
export function findQuizIndexFromQuizId(target: number): number {
  const quizArr = getData().quizzes;
  return (quizArr.findIndex(quiz => (quiz.quizId === target)));
}

// returns the index of a question with question id in quiz or -1 if not found
export function findQuestionIndex(quizArray: Quiz[], quizId: number, questionId: number): number {
  const quiz = quizArray.find(quiz => quiz.quizId === quizId);
  return quiz ? quiz.questions.findIndex(question => question.questionId === questionId) : -1;
}

// Checks whether sessionId exists from a game for a valid quiz.
export function findGameSessionId(data: Store, sessionId: number, quizId: number): Game | null {
  const game = data.games.find(game => game.sessionId === sessionId && game.quizId === quizId);
  return game || null;
}

// Checks whether a userid exists with an associated token
export function findUserByToken(token: number, users: Array<User>): User | null {
  return users.find(user => user.userId === token) || null;
}

export function findUserByEmail(userEmail: string, users: Array<User>): User | null {
  return users.find(user => user.email === userEmail) || null;
}

// Checks whether quiz exists with associated quizId
export function findQuizById(quizId: number, quizzes: Array<Quiz>): Quiz | null {
  return quizzes.find(quiz => quiz.quizId === quizId) || null;
}

// Checks whether a quiz is owned by a partiuclar
export function checkQuizOwnership(token: number, quizzes: Array<Quiz>): boolean {
  return quizzes.some(quiz => quiz.userId === token);
}

// Checks whether a name for a quiz already exists or not
export function isQuizNameAvailable(name: string, token: number, quizzes: Array<Quiz>): boolean {
  return !quizzes.some(quiz => quiz.name === name && quiz.userId === token);
}

// returns the index of quiz with quizId in trash
export function findDelQuizIndexFromQuizId(target: number): number {
  const trashArr = getData().trash;
  return (trashArr.findIndex(quiz => (quiz.quizId === target)));
}

//

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
  } while (quesArr.some(x => x.questionId === id));

  return id;
}

/*
  HELPER FUNCTIONS FOR AUTH RELATED ERROR CHECKS
*/

// checks that email being registered is valid and new
function checkEmail(email: string): void {
  if (!isEmail(email)) {
    throw new Error('Email is not a valid email address.');
  } else if (!findUserIndexFromEmail(email)) {
    throw new Error('User already exists with this email address.');
  }
}

function checkName(name: string): void {
  if (/[^A-Za-z' -]/.test(name)) {
    throw new Error('Name contains invalid characters.');
  } else if (name.length < 2 || name.length > 20) {
    throw new Error('Name must be between 2 and 20 characters.');
  }
}

function checkPassword(password: string): void {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters.');
  } else if (!(/\d/.test(password) && /[a-zA-Z]/.test(password))) {
    throw new Error('Password must contain at least one number and one letter');
  }
}

/*
  HELPER FUNCTIONS FOR FUNCTION GROUP ERROR TESTING
*/
// checks for any errors in the checkAdminAuthRegister function
export function checkAdminAuthRegister(email: string, password: string,
  nameFirst: string, nameLast: string) {
  try {
    checkEmail(email);
    checkName(nameFirst);
    checkName(nameLast);
    checkPassword(password);
  } catch (e) {
    throw new Error(e.message);
  }
}

// checks for any errors in the adminAuthLogin function
export function checkAdminAuthLogin(email: string, password: string) {
  const user = getData().users[findUserIndexFromEmail(email)];
  if (!user) {
    throw new Error('Email address is not registered');
  } else if (user.password !== getHashOf(password)) {
    user.numFailedPasswordsSinceLastLogin++;
    throw new Error('Incorrect password for given email');
  }
}

/// ///////////////////////////////////////////////////////////

// Validates a quiz name for adminQuizNameUpdate
export function validateQuizName(name: string): string | null {
  if (name.trim() === '') {
    throw new Error('Name cannot be empty');
  }
  if (name.length > 30) {
    throw new Error('Name is too long');
  }
  if (name.length <= 3) {
    throw new Error('Name is too short');
  }
  if (/[!-:-@[-`{-~]/.test(name)) {
    throw new Error('Quiz name cannot have symbols');
  }
  return null;
}
