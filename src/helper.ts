import { getData } from './dataStore';
import { isEmail } from 'validator';
import { Quiz } from './interface';

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

  return session.authUserId;
}

// AUTH.TS HELPER FUNCTIONS

// function to create a unique id everytime
export function uniqueId(sessArr: { sessionId: number }[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (sessArr.find(session => (session.sessionId === uId)));
  return uId;
}

export function registerErrorChecking (email: string, password: string, nameFirst: string, nameLast: string): string {
  const store = getData();
  const userArr = store.users;

  const name = nameFirst + ' ' + nameLast;

  if (!isEmail(email)) {
    return 'email is not a valid email address';
  } else if (userArr.some(user => user.email === email)) {
    return 'email is used by another user';
  } else if (/[^A-Za-z' -]/.test(name)) {
    return 'name contains invalid characters';
  } else if (nameFirst.length < 2 || nameFirst.length > 20) {
    return 'first name must be at least 2 characters and no more than 20';
  } else if (nameLast.length < 2 || nameLast.length > 20) {
    return 'last name must be at least 2 characters and no more than 20';
  } else if (password.length < 8) {
    return 'password must be at least 8 characters';
  } else if (!(/\d/.test(password) && /[a-zA-Z]/.test(password))) {
    return 'password must contain at least one number and one letter';
  } else {
    return 'passed';
  }
}

export function loginErrorChecking (email: string, password: string): string {
  const store = getData();
  const userArr = store.users;

  const user = userArr.find((user) => user.email === email);

  if (!user) {
    return 'Email address does not exist';
  } else if (user.password !== password) {
    user.numFailedPasswordSinceLastLogin++;
    return 'Incorrect password';
  } else {
    return 'passed';
  }
}

export function updateDetailsErrorChecking(token: number, email: string, nameFirst: string, nameLast: string) {
  const specialChars = /[@!#$%^&*()_+=[\]{};:"\\|,.<>/?]/;
  const data = getData();

  if (!Number.isInteger(token)) {
    return 'invalid userId';
  } else if (data.users.some(user => user.email === email && user.authUserId !== token)) {
    return 'email used by another user';
  } else if (!isEmail(email)) {
    return 'invalid email address';
  } else if (specialChars.test(nameFirst)) {
    return 'first name contains invalid characters';
  } else if (nameFirst.length < 2) {
    return 'first name is too short';
  } else if (nameFirst.length > 20) {
    return 'first name is too long';
  } else if (specialChars.test(nameLast)) {
    return 'last name contains invalid characters';
  } else if (nameLast.length < 2) {
    return 'last name is too short';
  } else if (nameLast.length > 20) {
    return 'last name is too long';
  }

  const userIndex = data.users.findIndex(user => user.authUserId === token);

  if (userIndex === -1) {
    return 'userId does not exist';
  } else if (!isEmail(email)) {
    return 'invalid email address';
  } else if (data.users.some(user => user.email === email && user.authUserId !== token)) {
    return 'email used by another user';
  } else if (specialChars.test(nameFirst)) {
    return 'first name contains invalid characters';
  } else if (nameFirst.length < 2) {
    return 'first name is too short';
  } else if (nameFirst.length > 20) {
    return 'first name is too long';
  } else if (specialChars.test(nameLast)) {
    return 'last name contains invalid characters';
  } else if (nameLast.length < 2) {
    return 'last name is too short';
  } else if (nameLast.length > 20) {
    return 'last name is too long';
  } else {
    return 'passed';
  }
}

export function updatePasswordErrorChecking(token: number, oldPassword: string, newPassword: string): string {
  const data = getData();
  const user = data.users.find(user => user.authUserId === token);

  if (!user) {
    return 'userId does not exist';
  } else if (user.password !== oldPassword) {
    return 'incorrect password';
  } else if (oldPassword === newPassword) {
    return 'new password is the same as old password';
  } else if (user.passwordHistory.includes(newPassword)) {
    return 'password has already been used';
  } else if (newPassword.length < 8) {
    return 'password is too short';
  }

  const hasNumber = /\d/.test(newPassword);
  const hasLetter = /[a-zA-Z]/.test(newPassword);

  if (!hasNumber || !hasLetter) {
    return 'new password should contain at least one letter and one number';
  } else {
    return 'passed';
  }
}

// QUIZ.TS HELPER FUNCTIONS

// function to create a random id everytime
export function uniqueQuizId(quizArr: Quiz[]): number {
  let uId: number;
  do {
    uId = Date.now();
  } while (quizArr.find(quiz => (quiz.quizId === uId)));
  return uId;
}

export function quizCreateErrorChecking(token: number, name: string, description: string): string {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const user = userArr.find((user) => {
    return user.authUserId === token;
  });

  if (!user) {
    return 'Invalid token';
  }

  const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '=', '{', '}', '[', ']',
    ':', ';', '-', '"', "'", '<', '>', '.', '?', '/', '|', '\\'];
  for (let i = 0; i < specialChars.length; i++) {
    if (name.includes(specialChars[i])) {
      return 'Name contains invalid characters';
    }
  }

  if (name.length < 3) {
    return 'name is less than 3 characters';
  } else if (name.length > 30) {
    return 'name is more than 30 characters';
  } else if (description.length > 100) {
    return 'Description is more than 100 characters in length';
  } else if (quizArr.find((quiz) => quiz.name === name && quiz.authUserId === token)) {
    return 'Name is already used by current logged in user';
  } else {
    return 'passed';
  }
}

export function quizNameUpdateErrorChecking(token: number, quizId: number, name: string) {
  const store = getData();
  const userArr = store.users;
  const quizArr = store.quizzes;
  const quiz = quizArr.find(quiz => quiz.quizId === quizId);
  const user = userArr.find(user => user.authUserId === token);
  const findName = quizArr.find(quiz => quiz.name === name && quiz.authUserId === token);
  const quizUser = quizArr.find((quiz) => quiz.authUserId === token);

  if (!user) {
    return 'Invalid User id';
  } else if (!quiz) {
    return 'Invalid Quiz id';
  } else if (!quizUser) {
    return 'Quiz Id not owned by the user';
  } else if (findName) {
    return 'Name is already used';
  }

  if (name === ' ') {
    return 'Name cannot be empty';
  } else if (name.length <= 3) {
    return 'Name is too short';
  } else if (name.length > 30) {
    return 'Name is too long';
  } else if (/[!-:-@[-`{-~]/.test(name)) {
    return 'Quiz name cannot have symbols';
  } else {
    return 'passed';
  }
}
